// Синхронизация с 1С
class SyncManager {
    constructor() {
        this.syncStatusEl = document.getElementById('syncStatus');
    }

    async syncWith1C() {
        this.updateSyncStatus('Синхронизация...', '');
        
        try {
            const tasks = taskManager.load();
            const authData = JSON.parse(localStorage.getItem(authManager.AUTH_KEY));
            
            const response = await fetch(`${CONFIG.API_BASE}/sync`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData?.token || 'demo'}`
                },
                body: JSON.stringify({
                    user: authManager.currentUser,
                    tasks: tasks,
                    timestamp: Date.now()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.updateSyncStatus('Синхронизировано', 'success');
                
                if (result.tasks) {
                    localStorage.setItem(authManager.getUserKey(), JSON.stringify(result.tasks));
                    taskManager.render();
                }
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            console.error('Ошибка синхронизации с 1С:', error);
            this.updateSyncStatus('Ошибка синхронизации', 'error');
        }
    }

    async loadFrom1C() {
        try {
            const authData = JSON.parse(localStorage.getItem(authManager.AUTH_KEY));
            const response = await fetch(`${CONFIG.API_BASE}/tasks?user=${authManager.currentUser}`, {
                headers: {
                    'Authorization': `Bearer ${authData?.token || 'demo'}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.tasks) {
                    localStorage.setItem(authManager.getUserKey(), JSON.stringify(data.tasks));
                    return data.tasks;
                }
            }
            throw new Error('Не удалось загрузить из 1С');
        } catch (error) {
            console.warn('Используем локальные данные:', error);
            return taskManager.load();
        }
    }

    updateSyncStatus(message, type = '') {
        this.syncStatusEl.textContent = message;
        this.syncStatusEl.className = 'sync-status';
        if (type) {
            this.syncStatusEl.classList.add(type);
        }
    }
}

const syncManager = new SyncManager();

// Глобальная функция для вызова из HTML
window.syncWith1C = () => syncManager.syncWith1C();
