// Основной файл приложения
class App {
    constructor() {
        this.themeBtn = document.getElementById('themeBtn');
        this.dark = localStorage.getItem(authManager.getThemeKey()) === 'dark';
        this.calendar = null;
        this.init();
    }

    init() {
        this.initTheme();
        this.initEventListeners();
        
        if (authManager.checkAuth()) {
            this.startApp();
        }
    }

    initTheme() {
        this.applyTheme(this.dark);
    }

    initEventListeners() {
        document.getElementById('loginBtn').addEventListener('click', () => authManager.login());
        document.getElementById('logoutBtn').addEventListener('click', () => authManager.logout());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    applyTheme(dark) {
        this.dark = dark;
        const root = document.getElementById('appRoot');
        
        if (dark) {
            document.documentElement.classList.add('dark');
            root.classList.add('dark');
            this.themeBtn.textContent = '☼';
        } else {
            document.documentElement.classList.remove('dark');
            root.classList.remove('dark');
            this.themeBtn.textContent = '☾';
        }
        
        localStorage.setItem(authManager.getThemeKey(), dark ? 'dark' : 'light');
    }

    toggleTheme() {
        this.applyTheme(!this.dark);
    }

    startApp() {
        this.calendar = new Calendar();
        taskManager.render();
        this.applyTheme(this.dark);
        
        // Демо-данные для новых пользователей
        if (!localStorage.getItem(authManager.getUserKey())) {
            const sample = [
                { id: 1, desc: 'Пример задачи 1', date: '2025-10-16 16:04', completed: false, time: 0 },
                { id: 2, desc: 'Пример задачи 2', date: '2025-10-16 16:04', completed: true, time: 2.5 }
            ];
            localStorage.setItem(authManager.getUserKey(), JSON.stringify(sample));
            taskManager.render();
        }
        
        // Загружаем данные из 1С
        syncManager.loadFrom1C().then(() => {
            taskManager.render();
            syncManager.updateSyncStatus('Синхронизировано', 'success');
        }).catch(() => {
            syncManager.updateSyncStatus('Офлайн режим', 'error');
        });
    }
}

// Запуск приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
