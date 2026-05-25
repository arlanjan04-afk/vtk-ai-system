from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password

# Удаляем старые таблицы и создаём заново
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ===== ПОЛЬЗОВАТЕЛИ С ПАРОЛЯМИ =====
users = [
    models.User(
        username="admin",
        email="admin@vtk.ru",
        hashed_password=hash_password("admin123"),
        full_name="Администратор ВТК",
        role="admin",
        is_active=True
    ),
    models.User(
        username="ivan",
        email="ivan@vtk.ru",
        hashed_password=hash_password("ivan123"),
        full_name="Иван Петров",
        role="student",
        is_active=True
    ),
    models.User(
        username="maria",
        email="maria@vtk.ru",
        hashed_password=hash_password("maria123"),
        full_name="Мария Сидорова",
        role="student",
        is_active=True
    ),
    models.User(
        username="teacher",
        email="teacher@vtk.ru",
        hashed_password=hash_password("teacher123"),
        full_name="Анна Викторовна",
        role="teacher",
        is_active=True
    ),
]
db.add_all(users)
db.commit()

# ===== УСЛУГИ =====
services = [
    models.Service(name="Справка об обучении", category="docs", description="Справка для предоставления по месту требования", department="Учебная часть", processing_time="1-3 дня"),
    models.Service(name="Справка для военкомата", category="docs", description="Справка для военкомата о форме обучения", department="Учебная часть", processing_time="1 день"),
    models.Service(name="Академическая стипендия", category="money", description="Назначение академической стипендии", department="Бухгалтерия", processing_time="1 месяц"),
    models.Service(name="Социальная стипендия", category="money", description="Социальная стипендия для нуждающихся", department="Бухгалтерия", processing_time="2-3 недели"),
    models.Service(name="Общежитие", category="housing", description="Заселение в общежитие", department="Воспитательный отдел", processing_time="2 недели"),
    models.Service(name="Расписание занятий", category="study", description="Получение расписания на семестр", department="Учебная часть", processing_time="1 день"),
    models.Service(name="Перевод на другую специальность", category="study", description="Перевод на другую специальность", department="Учебная часть", processing_time="1 месяц"),
    models.Service(name="Восстановление в колледже", category="study", description="Восстановление после отчисления", department="Учебная часть", processing_time="2-4 недели"),
]
db.add_all(services)
db.commit()

# ===== ТЕСТОВЫЕ ЗАЯВКИ =====
requests = [
    models.Request(
        user_id=2,
        description="Mne srochno nuzhna spravka dlya voenkomat",
        service_type="spravka",
        priority="urgent",
        priority_score=90,
        sentiment="neutral",
        status="new"
    ),
    models.Request(
        user_id=3,
        description="Hochu uznat o stipendiya",
        service_type="stipendiya",
        priority="high",
        priority_score=70,
        sentiment="neutral",
        status="in_progress"
    ),
    models.Request(
        user_id=2,
        description="Spasibo za pomoshch",
        service_type="general",
        priority="low",
        priority_score=20,
        sentiment="positive",
        status="completed"
    ),
]
db.add_all(requests)
db.commit()

print("=" * 50)
print("✅ База данных успешно заполнена!")
print("=" * 50)
print(f"   👥 Пользователей: {db.query(models.User).count()}")
print(f"   📋 Услуг: {db.query(models.Service).count()}")
print(f"   📝 Заявок: {db.query(models.Request).count()}")
print("=" * 50)
print("🔐 ТЕСТОВЫЕ АККАУНТЫ:")
print("=" * 50)
print("   👑 ADMIN:")
print("      Логин: admin")
print("      Пароль: admin123")
print()
print("   🎓 СТУДЕНТ 1:")
print("      Логин: ivan")
print("      Пароль: ivan123")
print()
print("   🎓 СТУДЕНТ 2:")
print("      Логин: maria")
print("      Пароль: maria123")
print()
print("   👨‍🏫 ПРЕПОДАВАТЕЛЬ:")
print("      Логин: teacher")
print("      Пароль: teacher123")
print("=" * 50)

db.close()
