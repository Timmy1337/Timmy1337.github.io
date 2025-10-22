// Утилиты и хелперы
class Utils {
    static pad(n) {
        return n < 10 ? '0' + n : n;
    }

    static formatDate(date) {
        return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static validateTime(time) {
        const v = parseFloat(time);
        return !isNaN(v) && v >= 0 && (v * 10) % 5 === 0;
    }
}

// Конфигурация
const CONFIG = {
    API_BASE: 'https://your-1c-server.com/api',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
    DEMO_USERS: {
        'user1': '123456',
        'user2': '123456', 
        'admin': 'admin123'
    }
};
