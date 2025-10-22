// Управление задачами
class TaskManager {
    constructor() {
        this.tasksEl = document.getElementById('tasks');
        this.searchEl = document.getElementById('search');
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        
        ['newId', 'newDesc', 'newDate'].forEach(id => {
            document.getElementById(id).addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        });

        this.searchEl.addEventListener('input', () => this.applySearch());
    }

    load() {
        const raw = localStorage.getItem(authManager.getUserKey());
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    save(data) {
        localStorage.setItem(authManager.getUserKey(), JSON.stringify(data));
        syncManager.syncWith1C();
    }

    render() {
        if (!authManager.currentUser) return;
        
        this.tasksEl.innerHTML = '';
        const data = this.load();
        
        if (data.length === 0) {
            const e = document.createElement('div');
            e.className = 'sub';
            e.textContent = 'Список задач пуст — добавьте задачу слева.';
            this.tasksEl.appendChild(e);
            this.updateCounts();
            return;
        }
        
        data.forEach(task => this.renderTask(task));
        this.applySearch();
        this.updateCounts();
    }

    renderTask(task) {
        const card = document.createElement('div');
        card.className = `task ${task.completed ? 'completed' : ''}`;
        
        card.innerHTML = `
            <div class="left">
                <div class="checkbox ${task.completed ? 'checked' : ''}" role="button" tabindex="0"></div>
            </div>
            <div class="body">
                <div class="title">${this.escapeHtml(task.desc)}</div>
                <div class="meta">
                    <span>#${task.id}</span>
                    <span>${task.date}</span>
                    <span class="sub">${task.completed ? 'Выполнено' : 'В процессе'}</span>
                </div>
                <div class="time-row">
                    <div class="time-input-wrapper">
                        <input type="number" class="time-input" id="time-${task.id}" value="${task.time || 0}" step="0.5" min="0">
                        <div class="time-arrows">
                            <div class="arrow-up"></div>
                            <div class="arrow-down"></div>
                        </div>
                    </div>
                    <button class="btn-save">Сохранить</button>
                </div>
                <div class="action-buttons">
                    <button class="btn-edit">Редактировать</button>
                    <button class="btn-delete">Удалить</button>
                </div>
            </div>
        `;

        this.attachTaskEventListeners(card, task.id);
        this.tasksEl.appendChild(card);
    }

    attachTaskEventListeners(card, taskId) {
        // Checkbox
        card.querySelector('.checkbox').addEventListener('click', () => this.toggle(taskId));
        
        // Time input
        const timeInput = card.querySelector('.time-input');
        const arrowUp = card.querySelector('.arrow-up');
        const arrowDown = card.querySelector('.arrow-down');
        
        timeInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                timeInput.stepUp();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                timeInput.stepDown();
            }
        });
        
        arrowUp.addEventListener('click', () => {
            timeInput.stepUp();
            timeInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        arrowDown.addEventListener('click', () => {
            timeInput.stepDown();
            timeInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        // Buttons
        card.querySelector('.btn-save').addEventListener('click', () => this.saveTime(taskId));
        card.querySelector('.btn-edit').addEventListener('click', () => this.editTask(taskId));
        card.querySelector('.btn-delete').addEventListener('click', () => this.deleteTask(taskId));
    }

    addTask() {
        const id = document.getElementById('newId').value.trim();
        const desc = document.getElementById('newDesc').value.trim();
        const date = document.getElementById('newDate').value.trim();
        
        if (!id || !desc || !date) {
            alert('Заполните ID, описание и дату');
            return;
        }
        
        const data = this.load();
        if (data.some(x => String(x.id) === String(id))) {
            alert('Задача с таким ID уже существует');
            return;
        }
        
        data.push({ id, desc, date, completed: false, time: 0 });
        this.save(data);
        
        document.getElementById('newId').value = '';
        document.getElementById('newDesc').value = '';
        document.getElementById('newDate').value = '';
        this.render();
    }

    toggle(id) {
        const data = this.load();
        const idx = data.findIndex(x => String(x.id) === String(id));
        if (idx === -1) return;
        
        data[idx].completed = !data[idx].completed;
        this.save(data);
        this.render();
    }

    saveTime(id) {
        const data = this.load();
        const idx = data.findIndex(x => String(x.id) === String(id));
        if (idx === -1) return;
        
        const input = document.getElementById('time-' + id);
        const v = parseFloat(input.value);
        
        if (!Utils.validateTime(v)) {
            alert('Время должно быть положительным числом, кратным 0.5');
            return;
        }
        
        data[idx].time = v;
        this.save(data);
        this.render();
        alert('Время сохранено');
    }

    editTask(id) {
        const data = this.load();
        const idx = data.findIndex(x => String(x.id) === String(id));
        if (idx === -1) return;
        
        const newDesc = prompt('Введите новое описание задачи:', data[idx].desc);
        if (newDesc !== null && newDesc.trim() !== '') {
            data[idx].desc = newDesc.trim();
            this.save(data);
            this.render();
        }
    }

    deleteTask(id) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            const data = this.load();
            const idx = data.findIndex(x => String(x.id) === String(id));
            if (idx === -1) return;
            
            data.splice(idx, 1);
            this.save(data);
            this.render();
        }
    }

    applySearch() {
        const q = this.searchEl.value.trim().toLowerCase();
        Array.from(document.querySelectorAll('.task')).forEach(card => {
            const txt = card.innerText.toLowerCase();
            card.style.display = q ? (txt.indexOf(q) >= 0 ? '' : 'none') : '';
        });
    }

    updateCounts() {
        const data = this.load();
        const total = data.length;
        const done = data.filter(x => x.completed).length;
        const hours = data.reduce((s, x) => s + (parseFloat(x.time) || 0), 0);
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('doneCount').textContent = done;
        document.getElementById('hoursCount').textContent = hours.toFixed(1);
        document.getElementById('statActive').textContent = total - done;
        document.getElementById('statDone').textContent = done;
        document.getElementById('statHours').textContent = hours.toFixed(1);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

const taskManager = new TaskManager();
