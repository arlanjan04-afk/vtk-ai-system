// Страницы авторизации

const AuthPages = {
    login() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-logo">
                        <div class="auth-logo-icon">🎓</div>
                        <h1>ВТК AI Сервис</h1>
                        <p>Войдите в свой аккаунт</p>
                    </div>

                    <div id="auth-alert"></div>

                    <form id="login-form">
                        <div class="form-group">
                            <label>Логин</label>
                            <input type="text" id="login-username" placeholder="Введите логин" required>
                        </div>

                        <div class="form-group">
                            <label>Пароль</label>
                            <input type="password" id="login-password" placeholder="••••••••" required>
                        </div>

                        <button type="submit" class="btn btn-primary">
                            🔓 Войти
                        </button>
                    </form>

                    <div class="auth-switch">
                        Нет аккаунта? <a onclick="App.showPage(\'register\')">Зарегистрироваться</a>
                    </div>

                    <div class="demo-accounts">
                        <h4>🧪 Тестовые аккаунты</h4>
                        <div>👑 Админ: <code>admin</code> / <code>admin123</code></div>
                        <div>🎓 Студент: <code>ivan</code> / <code>ivan123</code></div>
                        <div>👨‍🏫 Учитель: <code>teacher</code> / <code>teacher123</code></div>
                    </div>
                </div>
            </div>
        `;
    },

    register() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-logo">
                        <div class="auth-logo-icon">✨</div>
                        <h1>Регистрация</h1>
                        <p>Создайте новый аккаунт</p>
                    </div>

                    <div id="auth-alert"></div>

                    <form id="register-form">
                        <div class="form-group">
                            <label>ФИО</label>
                            <input type="text" id="reg-fullname" placeholder="Иванов Иван Иванович" required>
                        </div>

                        <div class="form-group">
                            <label>Логин</label>
                            <input type="text" id="reg-username" placeholder="ivan_ivanov" required>
                        </div>

                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="reg-email" placeholder="ivan@vtk.ru" required>
                        </div>

                        <div class="form-group">
                            <label>Пароль</label>
                            <input type="password" id="reg-password" placeholder="Минимум 6 символов" required>
                        </div>

                        <div class="form-group">
                            <label>Роль</label>
                            <select id="reg-role">
                                <option value="student">🎓 Студент</option>
                                <option value="teacher">👨‍🏫 Преподаватель</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary">
                            ✨ Создать аккаунт
                        </button>
                    </form>

                    <div class="auth-switch">
                        Уже есть аккаунт? <a onclick="App.showPage(\'login\')">Войти</a>
                    </div>
                </div>
            </div>
        `;
    },

    init(pageName) {
        if (pageName === "login") {
            document.getElementById("login-form").addEventListener("submit", async (e) => {
                e.preventDefault();
                const username = document.getElementById("login-username").value;
                const password = document.getElementById("login-password").value;
                const alertBox = document.getElementById("auth-alert");

                try {
                    alertBox.innerHTML = "";
                    await API.login(username, password);
                    alertBox.innerHTML = `<div class="alert alert-success">✅ Вход выполнен! Загрузка...</div>`;
                    setTimeout(() => App.start(), 500);
                } catch (error) {
                    alertBox.innerHTML = `<div class="alert alert-error">❌ ${error.message}</div>`;
                }
            });
        }

        if (pageName === "register") {
            document.getElementById("register-form").addEventListener("submit", async (e) => {
                e.preventDefault();
                const alertBox = document.getElementById("auth-alert");

                const userData = {
                    full_name: document.getElementById("reg-fullname").value,
                    username: document.getElementById("reg-username").value,
                    email: document.getElementById("reg-email").value,
                    password: document.getElementById("reg-password").value,
                    role: document.getElementById("reg-role").value,
                };

                try {
                    alertBox.innerHTML = "";
                    await API.register(userData);
                    alertBox.innerHTML = `<div class="alert alert-success">✅ Аккаунт создан! Выполняем вход...</div>`;
                    
                    // Автоматический вход после регистрации
                    await API.login(userData.username, userData.password);
                    setTimeout(() => App.start(), 800);
                } catch (error) {
                    alertBox.innerHTML = `<div class="alert alert-error">❌ ${error.message}</div>`;
                }
            });
        }
    }
};
