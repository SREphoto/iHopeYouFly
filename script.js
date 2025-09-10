document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

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
            tasks.push({
                text: li.querySelector('span').textContent,
                completed: li.classList.contains('completed')
            });
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

    // --- Event Listeners ---

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // --- Initial Load ---

    loadTasks();
});
