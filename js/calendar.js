// Календарь
class Calendar {
    constructor() {
        this.calendarEl = document.getElementById('calendar');
        this.currentDate = new Date();
        this.render(this.currentDate);
    }

    render(date) {
        this.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
        this.calendarEl.innerHTML = '';
        
        this.renderHeader();
        this.renderWeekdays();
        this.renderDays();
    }

    renderHeader() {
        const header = document.createElement('div');
        header.className = 'cal-head';
        
        const nav = document.createElement('div');
        nav.className = 'nav';
        
        const prev = document.createElement('button');
        prev.className = 'btn-icon';
        prev.textContent = '◀';
        prev.addEventListener('click', () => this.render(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)));
        
        const next = document.createElement('button');
        next.className = 'btn-icon';
        next.textContent = '▶';
        next.addEventListener('click', () => this.render(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)));
        
        nav.appendChild(prev);
        nav.appendChild(next);
        
        const title = document.createElement('div');
        title.className = 'month-title';
        title.textContent = this.currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
        
        header.appendChild(title);
        header.appendChild(nav);
        this.calendarEl.appendChild(header);
    }

    renderWeekdays() {
        const weekdays = document.createElement('div');
        weekdays.className = 'weekdays';
        ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(d => {
            const w = document.createElement('div');
            w.textContent = d;
            weekdays.appendChild(w);
        });
        this.calendarEl.appendChild(weekdays);
    }

    renderDays() {
        const days = document.createElement('div');
        days.className = 'days';
        
        const first = this.startOfMonth(this.currentDate);
        const last = this.endOfMonth(this.currentDate);
        const startWeek = (first.getDay() + 6) % 7;
        const prevLast = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
        
        // Previous month
        for (let i = 0; i < startWeek; i++) {
            const d = document.createElement('div');
            d.className = 'day out';
            d.textContent = (prevLast - startWeek + 1 + i);
            days.appendChild(d);
        }
        
        // Current month
        for (let d = 1; d <= last.getDate(); d++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'day';
            dayEl.textContent = d;
            const thisDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), d);
            
            // Today
            const today = new Date();
            if (thisDate.toDateString() === today.toDateString()) {
                dayEl.style.boxShadow = '0 8px 20px rgba(91,124,255,0.12)';
            }
            
            dayEl.addEventListener('click', () => this.selectDate(thisDate));
            days.appendChild(dayEl);
        }
        
        // Next month
        const totalCells = startWeek + last.getDate();
        const after = (7 - (totalCells % 7)) % 7;
        for (let i = 1; i <= after; i++) {
            const d = document.createElement('div');
            d.className = 'day out';
            d.textContent = i;
            days.appendChild(d);
        }

        this.calendarEl.appendChild(days);
    }

    selectDate(date) {
        document.querySelectorAll('.day.selected').forEach(n => n.classList.remove('selected'));
        event.target.classList.add('selected');
        
        const formatted = Utils.formatDate(date);
        const dateInput = document.getElementById('newDate');
        const currentValue = dateInput.value.trim();
        
        if (currentValue && currentValue.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/)) {
            const time = currentValue.split(' ')[1] || '00:00';
            dateInput.value = `${formatted} ${time}`;
        } else {
            dateInput.value = `${formatted} 12:00`;
        }
    }

    startOfMonth(d) {
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }

    endOfMonth(d) {
        return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }
}
