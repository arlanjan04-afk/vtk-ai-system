// Основные страницы приложения

const Pages = {
    // ============ ДАШБОРД ============
    async dashboard() {
        const user = API.getUser();
        let statsHTML = "";

        try {
            if (user.role === "admin") {
                const stats = await API.getStats();
                statsHTML = `
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon purple">👥</div>
                            <div class="stat-value">${stats.total_users || 0}</div>
                            <div class="stat-label">Всего пользователей</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon pink">📋</div>
                            <div class="stat-value">${stats.total_requests || 0}</div>
                            <div class="stat-label">Всего заявок</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon green">✅</div>
                            <div class="stat-value">${stats.completed_requests || 0}</div>
                            <div class="stat-label">Завершено</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon orange">⏳</div>
                            <div class="stat-value">${stats.pending_requests || 0}</div>
                            <div class="stat-label">В работе</div>
                        </div>
                    </div>
                `;
            } else {
                const requests = await API.getRequests();
                const pending = requests.filter(r => r.status === "новая" || r.status === "в работе").length;
                const completed = requests.filter(r => r.status === "выполнено").length;

                statsHTML = `
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon purple">📋</div>
                            <div class="stat-value">${requests.length}</div>
                            <div class="stat-label">Мои заявки</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon orange">⏳</div>
                            <div class="stat-value">${pending}</div>
                            <div class="stat-label">В обработке</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon green">✅</div>
                            <div class="stat-value">${completed}</div>
                            <div class="stat-label">Завершено</div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error(error);
        }

        return `
            <div class="page-header">
                <h1>👋 Добро пожаловать, ${user.full_name}!</h1>
                <p>${user.role === "admin" ? "Панель администратора" : "Ваш личный кабинет"}</p>
            </div>

            ${statsHTML}

            <div class="card">
                <div class="card-header">
                    <div class="card-title">🚀 Быстрые действия</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <button class="btn btn-primary" onclick="App.showPage('chat')">
                        💬 Открыть чат
                    </button>
                    <button class="btn btn-secondary" onclick="App.showPage('new-request')">
                        ➕ Новая заявка
                    </button>
                    <button class="btn btn-secondary" onclick="App.showPage('services')">
                        📚 Услуги
                    </button>
                </div>
            </div>
        `;
    },

    // ============ ЧАТ ============
    chat() {
        return `
            <div class="page-header">
                <h1>💬 AI Чат-бот</h1>
                <p>Задайте мне любой вопрос о колледже</p>
            </div>

            <div class="chat-container">
                <div class="chat-messages" id="chat-messages">
                    <div class="message bot">
                        👋 Привет! Я AI-помощник ВТК. Спросите меня о расписании, справках, общежитии, стипендии или чём угодно!
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="chat-input" placeholder="Введите ваш вопрос...">
                    <button onclick="Pages.sendMessage()">Отправить</button>
                </div>
            </div>
        `;
    },

    async sendMessage() {
        const input = document.getElementById("chat-input");
        const messages = document.getElementById("chat-messages");
        const text = input.value.trim();
        if (!text) return;

        // Добавляем сообщение пользователя
        messages.innerHTML += `<div class="message user">${text}</div>`;
        input.value = "";
        messages.scrollTop = messages.scrollHeight;

        // Показываем "печатает"
        messages.innerHTML += `<div class="message bot" id="typing">⌨️ Печатает...</div>`;
        messages.scrollTop = messages.scrollHeight;

        try {
            const response = await API.sendChatMessage(text);
            document.getElementById("typing").remove();
            messages.innerHTML += `<div class="message bot">${response.response}</div>`;
            messages.scrollTop = messages.scrollHeight;
        } catch (error) {
            document.getElementById("typing").remove();
            messages.innerHTML += `<div class="message bot">❌ Ошибка: ${error.message}</div>`;
        }
    },

    // ============ МОИ ЗАЯВКИ ============
    async requests() {
        let requests = [];
        try {
            requests = await API.getRequests();
        } catch (error) {
            console.error(error);
        }

        const statusBadge = (status) => {
            const map = {
                "новая": '<span class="badge badge-warning">⏳ Новая</span>',
                "в работе": '<span class="badge badge-primary">🔄 В работе</span>',
                "выполнено": '<span class="badge badge-success">✅ Готово</span>',
                "отменена": '<span class="badge badge-gray">❌ Отменена</span>',
            };
            return map[status] || `<span class="badge badge-gray">${status}</span>`;
        };

        const priorityBadge = (priority) => {
            const map = {
                "низкий": '<span class="badge badge-gray">Низкий</span>',
                "средний": '<span class="badge badge-primary">Средний</span>',
                "высокий": '<span class="badge badge-warning">Высокий</span>',
                "срочный": '<span class="badge badge-danger">🔥 Срочно</span>',
            };
            return map[priority] || `<span class="badge badge-gray">${priority}</span>`;
        };

        const rows = requests.length === 0
            ? `<tr><td colspan="5" style="text-align:center; padding: 40px; color: var(--gray);">Заявок пока нет</td></tr>`
            : requests.map(r => `
                <tr>
                    <td>#${r.id}</td>
                    <td><strong>${r.title || (r.description || '').slice(0, 50)}</strong><br><small style="color:var(--gray)">${(r.description || '').slice(0, 80)}...</small></td>
                    <td>${priorityBadge(r.priority)}</td>
                    <td>${statusBadge(r.status)}</td>
                    <td>${new Date(r.created_at).toLocaleDateString("ru")}</td>
                </tr>
            `).join("");

        return `
            <div class="page-header">
                <h1>📋 Мои заявки</h1>
                <p>История ваших обращений</p>
            </div>

            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary btn-sm" onclick="App.showPage('new-request')">
                    ➕ Создать заявку
                </button>
            </div>

            <div class="table">
                <table>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Заявка</th>
                            <th>Приоритет</th>
                            <th>Статус</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    // ============ НОВАЯ ЗАЯВКА ============
    newRequest() {
        return `
            <div class="page-header">
                <h1>➕ Новая заявка</h1>
                <p>Опишите вашу проблему или вопрос</p>
            </div>

            <div class="card" style="max-width: 700px;">
                <div id="request-alert"></div>

                <form id="request-form">
                    <div class="form-group">
                        <label>Заголовок</label>
                        <input type="text" id="req-title" placeholder="Кратко опишите проблему" required>
                    </div>

                    <div class="form-group">
                        <label>Категория</label>
                        <select id="req-category">
                            <option value="academic">📚 Учебные вопросы</option>
                            <option value="dormitory">🏠 Общежитие</option>
                            <option value="financial">💰 Финансы/Стипендия</option>
                            <option value="documents">📄 Документы и справки</option>
                            <option value="technical">🔧 Техническая поддержка</option>
                            <option value="other">📌 Другое</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Описание</label>
                        <textarea id="req-description" rows="6" placeholder="Подробно опишите вашу ситуацию..." required></textarea>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button type="submit" class="btn btn-primary">📤 Отправить заявку</button>
                        <button type="button" class="btn btn-secondary" onclick="App.showPage('requests')">Отмена</button>
                    </div>
                </form>
            </div>
        `;
    },

    initNewRequest() {
        document.getElementById("request-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const alertBox = document.getElementById("request-alert");

            const data = {
                title: document.getElementById("req-title").value,
                description: document.getElementById("req-description").value,
                category: document.getElementById("req-category").value,
                service_type: document.getElementById("req-category").value,
            };

            try {
                const result = await API.createRequest(data);
                alertBox.innerHTML = `
                    <div class="alert alert-success">
                        ✅ Заявка #${result.id} создана!<br>
                        🤖 AI определил приоритет: <strong>${result.priority}</strong>
                    </div>
                `;
                setTimeout(() => App.showPage("requests"), 1500);
            } catch (error) {
                alertBox.innerHTML = `<div class="alert alert-error">❌ ${error.message}</div>`;
            }
        });
    },

    // ============ УСЛУГИ ============
    async services() {
        let services = [];
        try {
            services = await API.getServices();
        } catch (error) {
            console.error(error);
        }

        const cards = services.map(s => `
            <div class="card" style="margin-bottom: 16px;">
                <h3 style="margin-bottom: 8px;">${s.name}</h3>
                <p style="color: var(--gray); margin-bottom: 12px;">${s.description}</p>
                <div style="display: flex; gap: 16px; font-size: 13px; flex-wrap: wrap;">
                    <span><strong>📂</strong> ${s.category || "—"}</span>
                    <span><strong>🏢</strong> ${s.department || "—"}</span>
                    <span><strong>⏱️</strong> ${s.processing_time || s.estimated_time || "—"}</span>
                </div>
            </div>
        `).join("");

        return `
            <div class="page-header">
                <h1>📚 Услуги колледжа</h1>
                <p>Доступные услуги и сервисы</p>
            </div>
            ${cards || '<div class="card">Услуг пока нет</div>'}
        `;
    },

    // ============ ПРОФИЛЬ ============
    profile() {
        const user = API.getUser();
        const roleLabels = {
            admin: "👑 Администратор",
            teacher: "👨‍🏫 Преподаватель",
            student: "🎓 Студент",
        };

        return `
            <div class="page-header">
                <h1>👤 Мой профиль</h1>
                <p>Информация об аккаунте</p>
            </div>

            <div class="card" style="max-width: 600px;">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
                    <div class="user-avatar" style="width: 80px; height: 80px; font-size: 32px;">
                        ${user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style="margin-bottom: 4px;">${user.full_name}</h2>
                        <p style="color: var(--gray);">${roleLabels[user.role] || user.role}</p>
                    </div>
                </div>

                <div style="display: grid; gap: 16px;">
                    <div>
                        <div style="font-size: 12px; color: var(--gray); text-transform: uppercase; margin-bottom: 4px;">Логин</div>
                        <div style="font-weight: 600;">${user.username}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--gray); text-transform: uppercase; margin-bottom: 4px;">Email</div>
                        <div style="font-weight: 600;">${user.email || "—"}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--gray); text-transform: uppercase; margin-bottom: 4px;">ID пользователя</div>
                        <div style="font-weight: 600;">#${user.id}</div>
                    </div>
                </div>

                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                    <button class="btn btn-danger btn-sm" onclick="API.logout()">
                        🚪 Выйти из аккаунта
                    </button>
                </div>
            </div>
        `;
    },

    // ============ АДМИН: ПОЛЬЗОВАТЕЛИ ============
    async users() {
        let users = [];
        try {
            users = await API.getUsers();
        } catch (error) {
            return `<div class="alert alert-error">❌ Нет доступа</div>`;
        }

        const roleBadge = (role) => {
            const map = {
                admin: '<span class="badge badge-danger">👑 Admin</span>',
                teacher: '<span class="badge badge-primary">👨‍🏫 Teacher</span>',
                student: '<span class="badge badge-success">🎓 Student</span>',
            };
            return map[role] || role;
        };

        const rows = users.map(u => `
            <tr>
                <td>#${u.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 13px;">
                            ${u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>${u.full_name}</strong><br>
                            <small style="color: var(--gray);">@${u.username}</small>
                        </div>
                    </div>
                </td>
                <td>${u.email || "—"}</td>
                <td>${roleBadge(u.role)}</td>
                <td>${u.is_active ? '<span class="badge badge-success">✅ Активен</span>' : '<span class="badge badge-gray">Заблокирован</span>'}</td>
            </tr>
        `).join("");

        return `
            <div class="page-header">
                <h1>👥 Пользователи</h1>
                <p>Управление пользователями системы</p>
            </div>

            <div class="table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Пользователь</th>
                            <th>Email</th>
                            <th>Роль</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }
};