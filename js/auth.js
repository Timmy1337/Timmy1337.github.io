// Аутентификация и управление пользователями
class AuthManager {
    constructor() {
        this.AUTH_KEY = 'tm_auth';
        this.currentUser = null;
    }

    checkAuth() {
        const authRaw = localStorage.getItem(this.AUTH_KEY);
        if (!authRaw) {
            this.showAuth();
            return false;
        }

        try {
            const authData = JSON.parse(authRaw);
            
            if (Date.now() - authData.timestamp > CONFIG.SESSION_TIMEOUT) {
                this.showAuth();
                return false;
            }

            this.currentUser = authData.username;
            document.getElementById('currentUserDisplay').textContent = this.currentUser;
            this.hideAuth();
            return true;
        } catch (e) {
            this.showAuth();
            return false;
        }
    }

    login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Введите имя пользователя и пароль');
            return;
        }

        // Демо-проверка (заменить на вызов 1С API)
        if (CONFIG.DEMO_USERS[username] && CONFIG.DEMO_USERS[username] === password) {
            this.currentUser = username;
            const authData = { 
                username, 
                timestamp: Date.now(),
                token: this.generateToken()
            };
            localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
            document.getElementById('currentUserDisplay').textContent = username;
            this.hideAuth();
            
            // Загружаем задачи
            syncManager.loadFrom1C().then(() => {
                taskManager.render();
                syncManager.updateSyncStatus('Успешно загружено', 'success');
            }).catch(() => {
                taskManager.render();
                syncManager.updateSyncStatus('Офлайн режим', 'error');
            });
        } else {
            alert('Неверное имя пользователя или пароль');
        }
    }

    logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            localStorage.removeItem(this.AUTH_KEY);
            this.currentUser = null;
            this.showAuth();
        }
    }

    showAuth() {
        document.getElementById('authOverlay').style.display = 'flex';
        document.getElementById('appRoot').style.display = 'none';
    }

    hideAuth() {
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('appRoot').style.display = 'block';
    }

    generateToken() {
        return 'demo_token_' + Math.random().toString(36).substr(2, 9);
    }

    getUserKey() {
        return `tm_tasks_${this.currentUser}_v4`;
    }

    getThemeKey() {
        return `tm_theme_${this.currentUser}_v4`;
    }
}

const authManager = new AuthManager();
