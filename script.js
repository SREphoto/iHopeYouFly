document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    // --- Core Functions ---

    function createTaskElement(task) {
        const li = document.createElement('li');

        // Add span for the task text to avoid including button text
        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;
        li.appendChild(taskTextSpan);

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
        if (taskText === '') {
            taskInput.classList.add('input-error');
            setTimeout(() => {
                taskInput.classList.remove('input-error');
            }, 500);
            return;
        }

        const task = { text: taskText, completed: false };
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);

        // Animate the new task
        setTimeout(() => {
            taskElement.classList.add('visible');
        }, 10);

        taskInput.value = '';
        saveTasks();
    }

    // --- Local Storage Functions ---

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#task-list li').forEach(li => {
            const taskTextElement = li.querySelector('span') || li.querySelector('input[type="text"]');
            if (taskTextElement) {
                tasks.push({
                    text: taskTextElement.textContent || taskTextElement.value,
                    completed: li.classList.contains('completed')
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

    // --- Event Listeners ---

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // --- Initial Load ---

    loadTasks();
});
