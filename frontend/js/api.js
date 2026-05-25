// API клиент для общения с бэкендом

const API_URL = "";

class API {
    static getToken() {
        return localStorage.getItem("token");
    }

    static setToken(token) {
        localStorage.setItem("token", token);
    }

    static removeToken() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    static getUser() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }

    static setUser(user) {
        localStorage.setItem("user", JSON.stringify(user));
    }

    static async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            
            if (response.status === 401) {
                this.removeToken();
                window.location.reload();
                return;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || "Ошибка запроса");
            }
            
            return data;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }

    // Авторизация
    static async login(username, password) {
        const data = await this.request("/api/auth/login-json", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        this.setToken(data.access_token);
        this.setUser(data.user);
        return data;
    }

    static async register(userData) {
        return await this.request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    }

    static async getMe() {
        return await this.request("/api/auth/me");
    }

    static logout() {
        this.removeToken();
        window.location.reload();
    }

    // Заявки
    static async getRequests() {
        return await this.request("/api/requests");
    }

    static async createRequest(data) {
        return await this.request("/api/requests", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // Услуги
    static async getServices() {
        return await this.request("/api/services");
    }

    // Чат
    static async sendChatMessage(message) {
        return await this.request("/api/chat", {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    }

    // Админ: пользователи
    static async getUsers() {
        return await this.request("/api/users");
    }

    // Статистика
    static async getStats() {
        return await this.request("/api/stats");
    }
}
