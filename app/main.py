from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os

from app.database import engine, Base, get_db
from app import models, schemas, auth, chatbot, analyzer

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VTK AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== AUTH ====================

@app.post("/api/auth/register", tags=["Auth"])
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует")

    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        hashed_password=auth.hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = auth.create_access_token(data={"sub": new_user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role,
            "is_active": new_user.is_active
        }
    }


# Логин через форму (для Swagger)
@app.post("/api/auth/login", tags=["Auth"])
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return _do_login(form_data.username, form_data.password, db)


# Логин через JSON (для фронтенда)
@app.post("/api/auth/login-json", tags=["Auth"])
def login_json(data: schemas.UserLogin, db: Session = Depends(get_db)):
    return _do_login(data.username, data.password, db)


def _do_login(username: str, password: str, db: Session):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль"
        )
    token = auth.create_access_token(data={"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active
        }
    }


@app.get("/api/auth/me", tags=["Auth"])
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active
    }


# ==================== REQUESTS ====================

@app.post("/api/requests", tags=["Requests"])
def create_request(
    req: schemas.RequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Поддержка обоих форматов от фронтенда (title+category+description) и от Swagger (description+service_type)
    description = req.description or ""
    if req.title:
        # Если фронт прислал title и description — склеиваем
        description = f"{req.title}. {description}".strip(". ")

    service_type = req.service_type or req.category or "general"

    priority_result = analyzer.analyze_priority(description, service_type)
    sentiment_result = analyzer.analyze_sentiment(description)

    new_request = models.Request(
        user_id=current_user.id,
        description=description,
        service_type=service_type,
        priority=priority_result["priority"],
        priority_score=priority_result["score"],
        sentiment=sentiment_result["sentiment"],
        status="новая"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Возвращаем поля так, чтобы и фронт, и Swagger были довольны
    return {
        "id": new_request.id,
        "user_id": new_request.user_id,
        "title": req.title or description[:50],
        "description": new_request.description,
        "service_type": new_request.service_type,
        "category": new_request.service_type,
        "priority": new_request.priority,
        "priority_score": new_request.priority_score,
        "sentiment": new_request.sentiment,
        "status": new_request.status,
        "created_at": new_request.created_at,
        "estimated_time": priority_result["estimated_time"]
    }


@app.get("/api/requests", tags=["Requests"])
def list_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == "admin":
        requests_list = db.query(models.Request).order_by(models.Request.priority_score.desc()).all()
    else:
        requests_list = db.query(models.Request).filter(
            models.Request.user_id == current_user.id
        ).order_by(models.Request.created_at.desc()).all()

    # Возвращаем с title для фронта
    result = []
    for r in requests_list:
        result.append({
            "id": r.id,
            "user_id": r.user_id,
            "title": (r.description or "")[:60],
            "description": r.description,
            "service_type": r.service_type,
            "category": r.service_type,
            "priority": r.priority,
            "priority_score": r.priority_score,
            "sentiment": r.sentiment,
            "status": r.status,
            "created_at": r.created_at
        })
    return result


# ==================== CHAT ====================

@app.post("/api/chat", tags=["Chat"])
def chat(msg: schemas.ChatMessageCreate, db: Session = Depends(get_db)):
    result = chatbot.get_response(msg.message)

    chat_entry = models.ChatHistory(
        message=msg.message,
        response=result["response"],
        category=result["category"],
        confidence=result["confidence"]
    )
    db.add(chat_entry)
    db.commit()

    return result


# ==================== SERVICES ====================

@app.get("/api/services", tags=["Services"])
def list_services(db: Session = Depends(get_db)):
    services = db.query(models.Service).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "description": s.description,
            "department": s.department,
            "processing_time": s.processing_time,
            "estimated_time": s.processing_time,  # алиас для фронта
            "created_at": s.created_at
        }
        for s in services
    ]


# ==================== USERS (admin) ====================

@app.get("/api/users", tags=["Users"])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]


# ==================== STATS ====================

@app.get("/api/stats", tags=["Stats"])
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    total_users = db.query(models.User).count()
    total_requests = db.query(models.Request).count()
    completed = db.query(models.Request).filter(models.Request.status == "выполнено").count()
    pending = db.query(models.Request).filter(models.Request.status.in_(["новая", "в работе"])).count()
    urgent = db.query(models.Request).filter(models.Request.priority == "срочный").count()
    total_chats = db.query(models.ChatHistory).count()

    return {
        "total_users": total_users,
        "total_requests": total_requests,
        "completed_requests": completed,
        "pending_requests": pending,
        "urgent_requests": urgent,
        "total_chats": total_chats
    }


# ==================== ROOT / FRONTEND ====================

@app.get("/")
async def root():
    return {"message": "VTK AI Service", "frontend": "/app", "docs": "/docs"}


if os.path.exists("frontend"):
    app.mount("/static", StaticFiles(directory="frontend"), name="static")

    @app.get("/app")
    async def serve_frontend():
        return FileResponse("frontend/index.html")