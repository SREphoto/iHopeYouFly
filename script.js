document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const priorityInput = document.getElementById('priority-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const sortTasks = document.getElementById('sort-tasks');
    const filterTasks = document.getElementById('filter-tasks');
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const listView = document.getElementById('list-view');
    const calendarView = document.getElementById('calendar-view');
    const monthYear = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // --- Core Functions ---

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.dataset.priority = task.priority;

        // Add span for the task text to avoid including button text
        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;
        li.appendChild(taskTextSpan);

        if (task.dueDate) {
            const dueDateSpan = document.createElement('span');
            dueDateSpan.className = 'due-date';
            dueDateSpan.textContent = task.dueDate;
            li.appendChild(dueDateSpan);
        }

        if (task.completed) {
            li.classList.add('completed');
        }

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        li.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        li.appendChild(deleteBtn);

        // Event listener for completion
        li.addEventListener('click', () => {
            li.classList.toggle('completed');
            saveTasks();
        });

        // Event listener for deletion
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            li.classList.add('removing');
            li.addEventListener('transitionend', () => {
                if (li.parentNode) {
                    taskList.removeChild(li);
                    saveTasks();
                }
            });
        });

        // Event listener for editing
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (editBtn.textContent === 'Edit') {
                const currentText = taskTextSpan.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentText;
                li.insertBefore(input, taskTextSpan);
                li.removeChild(taskTextSpan);
                editBtn.textContent = 'Save';
            } else {
                const input = li.querySelector('input[type="text"]');
                taskTextSpan.textContent = input.value;
                li.insertBefore(taskTextSpan, input);
                li.removeChild(input);
                editBtn.textContent = 'Edit';
                saveTasks();
            }
        });

        return li;
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;

        if (taskText === '') {
            taskInput.classList.add('input-error');
            setTimeout(() => {
                taskInput.classList.remove('input-error');
            }, 500);
            return;
        }

        const task = { text: taskText, completed: false, dueDate: dueDate, priority: priority };
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);

        // Animate the new task
        setTimeout(() => {
            taskElement.classList.add('visible');
        }, 10);

        taskInput.value = '';
        dueDateInput.value = '';
        saveTasks();
    }

    // --- Local Storage Functions ---

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#task-list li').forEach(li => {
            const taskTextElement = li.querySelector('span') || li.querySelector('input[type="text"]');
            const dueDateElement = li.querySelector('.due-date');
            if (taskTextElement) {
                tasks.push({
                    text: taskTextElement.textContent || taskTextElement.value,
                    completed: li.classList.contains('completed'),
                    dueDate: dueDateElement ? dueDateElement.textContent : '',
                    priority: li.dataset.priority
                });
            }
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
            // Make loaded tasks visible without animation delay
            taskElement.classList.add('visible');
        });
    }


    function clearCompletedTasks() {
        document.querySelectorAll('#task-list li.completed').forEach(li => {
            li.classList.add('removing');
            li.addEventListener('transitionend', () => {
                if (li.parentNode) {
                    taskList.removeChild(li);
                    saveTasks();
                }
            });
        });
    }


    function updateTasks() {
        const filterValue = filterTasks.value;
        const sortValue = sortTasks.value;
        const tasks = Array.from(taskList.querySelectorAll('li'));

        // Filtering
        tasks.forEach(task => {
            let show = true;
            if (filterValue === 'completed' && !task.classList.contains('completed')) {
                show = false;
            } else if (filterValue === 'incomplete' && task.classList.contains('completed')) {
                show = false;
            } else if (['high', 'medium', 'low'].includes(filterValue) && task.dataset.priority !== filterValue) {
                show = false;
            }
            task.style.display = show ? 'flex' : 'none';
        });

        // Sorting
        if (sortValue !== 'default') {
            tasks.sort((a, b) => {
                if (sortValue === 'due-date') {
                    const dateA = new Date(a.querySelector('.due-date')?.textContent);
                    const dateB = new Date(b.querySelector('.due-date')?.textContent);
                    return dateA - dateB;
                } else if (sortValue === 'priority') {
                    const priorityA = a.dataset.priority;
                    const priorityB = b.dataset.priority;
                    const priorityOrder = { high: 1, medium: 2, low: 3 };
                    return priorityOrder[priorityA] - priorityOrder[priorityB];
                }
                return 0;
            });
            tasks.forEach(task => taskList.appendChild(task));
        }
    }


    function generateCalendar(month, year) {
        calendarGrid.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        monthYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            calendarGrid.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.textContent = i;
            const tasksForDay = tasks.filter(task => {
                const dueDate = new Date(task.dueDate);
                return dueDate.getDate() === i && dueDate.getMonth() === month && dueDate.getFullYear() === year;
            });
            tasksForDay.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'calendar-task';
                taskElement.textContent = task.text;
                taskElement.dataset.priority = task.priority;
                dayCell.appendChild(taskElement);
            });
            calendarGrid.appendChild(dayCell);
        }
    }

    // --- Event Listeners ---

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    sortTasks.addEventListener('change', updateTasks);
    filterTasks.addEventListener('change', updateTasks);
    toggleViewBtn.addEventListener('click', () => {
        if (listView.style.display !== 'none') {
            listView.style.display = 'none';
            calendarView.style.display = 'block';
            toggleViewBtn.textContent = 'List View';
            generateCalendar(currentMonth, currentYear);
        } else {
            listView.style.display = 'block';
            calendarView.style.display = 'none';
            toggleViewBtn.textContent = 'Calendar View';
        }
    });
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });


    // --- Initial Load ---

    loadTasks();
});
