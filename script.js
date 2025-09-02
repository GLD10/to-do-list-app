document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('add-task-form');
    const taskList = document.getElementById('task-list');
    const descriptionInput = document.getElementById('task-description');
    const prioritySelect = document.getElementById('task-priority');
    const filterSelect = document.getElementById('filter-tasks');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const emptyState = document.getElementById('empty-state');

    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        renderTasks(tasks);
        updateAnalytics(tasks);
    }

    function renderTasks(tasks) {
        const currentFilter = filterSelect.value;
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        taskList.innerHTML = '';
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.dataset.id = task.id;

                const priorityClass = `priority-${task.priority}`;
                const priorityText = {
                    'high': 'High Priority',
                    'medium': 'Medium Priority',
                    'low': 'Low Priority'
                }[task.priority];

                li.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="toggle-complete">
                    <div class="task-content">
                        <p class="description ${task.completed ? 'completed' : ''}">${task.description}</p>
                        <span class="priority-badge ${priorityClass}">${priorityText}</span>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn" data-action="delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }
    }

    function updateAnalytics(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? ((completed / total) * 100).toFixed(0) : 0;

        document.getElementById('total-tasks-stat').textContent = total;
        document.getElementById('completed-tasks-stat').textContent = completed;
        document.getElementById('pending-tasks-stat').textContent = pending;
        document.getElementById('completion-rate-stat').textContent = `${completionRate}%`;
    }

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = descriptionInput.value.trim();
        const priority = prioritySelect.value;
        if (description) {
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const newTask = {
                id: Date.now(),
                description,
                priority,
                completed: false
            };
            tasks.push(newTask);
            saveTasks(tasks);
            loadTasks();
            descriptionInput.value = '';
            prioritySelect.value = 'low';
        }
    });

    taskList.addEventListener('click', (e) => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const action = e.target.dataset.action || e.target.closest('button')?.dataset.action;
        const taskId = e.target.closest('.task-item')?.dataset.id;
        
        if (!taskId) return;

        if (action === 'toggle-complete') {
            const updatedTasks = tasks.map(task =>
                task.id == taskId ? { ...task, completed: !task.completed } : task
            );
            saveTasks(updatedTasks);
            loadTasks();
        } else if (action === 'delete') {
            const updatedTasks = tasks.filter(task => task.id != taskId);
            saveTasks(updatedTasks);
            loadTasks();
        }
    });

    filterSelect.addEventListener('change', () => {
        loadTasks();
    });

    clearCompletedBtn.addEventListener('click', () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const updatedTasks = tasks.filter(task => !task.completed);
        saveTasks(updatedTasks);
        loadTasks();
    });

    loadTasks();
});