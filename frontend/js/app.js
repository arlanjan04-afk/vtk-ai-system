// Главное приложение - роутинг и управление

const App = {
    currentPage: null,

    // Запуск приложения
    start() {
        const user = API.getUser();
        const token = API.getToken();

        if (!token || !user) {
            this.showPage("login");
        } else {
            this.showPage("dashboard");
        }
    },

    // Показать страницу
    async showPage(pageName) {
        this.currentPage = pageName;
        const app = document.getElementById("app");

        // Страницы авторизации (без sidebar)
        if (pageName === "login" || pageName === "register") {
            app.innerHTML = AuthPages[pageName]();
            AuthPages.init(pageName);
            return;
        }

        // Проверка авторизации
        const user = API.getUser();
        if (!user) {
            this.showPage("login");
            return;
        }

        // Загружаем содержимое страницы
        let content = "";
        try {
            switch (pageName) {
                case "dashboard":
                    content = await Pages.dashboard();
                    break;
                case "chat":
                    content = Pages.chat();
                    break;
                case "requests":
                    content = await Pages.requests();
                    break;
                case "new-request":
                    content = Pages.newRequest();
                    break;
                case "services":
                    content = await Pages.services();
                    break;
                case "profile":
                    content = Pages.profile();
                    break;
                case "users":
                    content = await Pages.users();
                    break;
                default:
                    content = await Pages.dashboard();
            }
        } catch (error) {
            content = `<div class="alert alert-error">❌ Ошибка загрузки: ${error.message}</div>`;
        }

        // Рендерим страницу с sidebar
        app.innerHTML = this.renderLayout(content);

        // Инициализация для конкретных страниц
        if (pageName === "chat") {
            const input = document.getElementById("chat-input");
            if (input) {
                input.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") Pages.sendMessage();
                });
                input.focus();
            }
        }

        if (pageName === "new-request") {
            Pages.initNewRequest();
        }
    },

    // Шаблон страницы с sidebar
    renderLayout(content) {
        const user = API.getUser();
        const isAdmin = user.role === "admin";

        const menuItems = [
            { id: "dashboard", icon: "🏠", label: "Главная" },
            { id: "chat", icon: "💬", label: "AI Чат" },
            { id: "requests", icon: "📋", label: "Заявки" },
            { id: "services", icon: "📚", label: "Услуги" },
            { id: "profile", icon: "👤", label: "Профиль" },
        ];

        if (isAdmin) {
            menuItems.push({ id: "users", icon: "👥", label: "Пользователи" });
        }

        const menuHTML = menuItems.map(item => `
            <li class="nav-item ${this.currentPage === item.id ? "active" : ""}" 
                onclick="App.showPage('${item.id}')">
                <span class="nav-item-icon">${item.icon}</span>
                <span>${item.label}</span>
            </li>
        `).join("");

        const roleLabels = {
            admin: "Администратор",
            teacher: "Преподаватель",
            student: "Студент",
        };

        return `
            <div class="layout">
                <aside class="sidebar">
                    <div class="sidebar-logo">
                        <div class="sidebar-logo-icon">🎓</div>
                        <div class="sidebar-logo-text">
                            <h2>ВТК AI</h2>
                            <p>Система сервиса</p>
                        </div>
                    </div>

                    <ul class="nav-menu">
                        ${menuHTML}
                    </ul>

                    <div class="sidebar-user">
                        <div class="sidebar-user-info">
                            <div class="user-avatar">
                                ${user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="user-name">${user.full_name.split(" ")[0]}</div>
                                <div class="user-role">${roleLabels[user.role] || user.role}</div>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="API.logout()">
                            🚪 Выйти
                        </button>
                    </div>
                </aside>

                <main class="main-content">
                    ${content}
                </main>
            </div>
        `;
    }
};

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    App.start();
});
