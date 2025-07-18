const searchTask = document.getElementById('search-task-btn');
const searchTaskInput = document.getElementById('search-task');

const addTaskForm = document.getElementById('add-task-form');
const newTaskInput = document.getElementById('new-task-input');
const taskListDiv = document.querySelector('.task-list');

let currentTaskIndex = -1;

const descHeader = document.getElementById('desc-header')
const slogans = [
        "Get things easily with TuDoo",
        "Stay Focused. Stay Done.",
        "Plan Less. Do More.",
        "Your Day, Organized.",
        "Don't Just Plan It. Do It."
    ];
    
let currentSlogan = 0

setInterval(() => {
    descHeader.classList.add('fade-out');

    setTimeout(() => {
        currentSlogan = (currentSlogan + 1) % slogans.length;
        descHeader.innerHTML = slogans[currentSlogan];
        descHeader.classList.remove('fade-out');
        }, 500);
    }, 5000);

searchTask.addEventListener("click", () => {
    searchTaskInput.hidden = !searchTaskInput.hidden;

    if (!searchTaskInput.hidden) {
        searchTaskInput.focus();
    } else {
        searchTaskInput.value = '';
        renderTasks();
    }
})

searchTaskInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    if (searchTerm) {
        renderTasks('all', searchTerm);
    } else {
        renderTasks('all');
    }
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchTaskInput.hidden) {
            isSearch = true;
            searchTaskInput.hidden = false;
            searchTaskInput.focus();
        }
    }
    if (e.key === 'Escape' && !searchTaskInput.hidden) {
        isSearch = false;
        searchTaskInput.hidden = true;
        searchTaskInput.value = '';
        renderTasks();
    }
});

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const modal = document.createElement('div');
modal.className = 'task-modal';
modal.innerHTML = `
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2 id="modal-title">Task Details</h2>
        <div class="modal-body">
            <div class="detail-item">
                <label>Task:</label>
                <span id="modal-task-text"></span>
            </div>
            <div class="detail-item">
                <label>Description:</label>
                <textarea id="modal-description" placeholder="Add description..."></textarea>
            </div>
            <div class="detail-item">
                <label>Status:</label>
                <span id="modal-status"></span>
            </div>
            <div class="detail-item">
                <label>Created:</label>
                <span id="modal-created"></span>
            </div>
        </div>
        <div class="modal-actions">
            <button id="save-details">Save Changes</button>
            <button id="cancel-details">Cancel</button>
        </div>
    </div>
`;
document.body.appendChild(modal);

const closeModal = modal.querySelector('.close-modal');
const saveDetailsBtn = modal.querySelector('#save-details');
const cancelDetailsBtn = modal.querySelector('#cancel-details');

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

cancelDetailsBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

saveDetailsBtn.addEventListener('click', () => {
    if (currentTaskIndex !== -1) {
        const description = modal.querySelector('#modal-description').value;
        tasks[currentTaskIndex].description = description;
        saveTasks();
        modal.style.display = 'none';
        renderTasks();
    }
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showTaskDetails(taskIndex) {
    const task = tasks[taskIndex];
    currentTaskIndex = taskIndex;
    
    modal.querySelector('#modal-task-text').textContent = task.text;
    modal.querySelector('#modal-description').value = task.description || '';
    modal.querySelector('#modal-status').textContent = task.completed ? 'Completed' : 'Active';
    modal.querySelector('#modal-created').textContent = task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown';
    
    modal.style.display = 'block';
}

function renderTasks(filter = 'all', searchTerm = '') {
    taskListDiv.textContent = '';

    let filteredTasks = tasks;
    
    if (filter === 'active') filteredTasks = tasks.filter(t => !t.completed);
    if (filter === 'completed') filteredTasks = tasks.filter(t => t.completed);
    
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => {
            const taskText = task.text.toLowerCase();
            const taskDescription = (task.description || '').toLowerCase();
            return taskText.includes(searchTerm) || taskDescription.includes(searchTerm);
        });
    }
    
    if (filteredTasks.length === 0) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.style.textAlign = 'center';
        noResultsDiv.style.padding = '40px 20px';
        noResultsDiv.style.color = '#666';
        noResultsDiv.style.fontStyle = 'italic';
        
        if (searchTerm) {
            noResultsDiv.innerHTML = `
                <div style="font-size: 1.2rem; margin-bottom: 8px;">🔍</div>
                <div>No tasks found matching "${searchTerm}"</div>
                <div style="font-size: 0.9rem; margin-top: 8px;">Try adjusting your search terms</div>
            `;
        } else if (filter === 'active') {
            noResultsDiv.innerHTML = `
                <div style="font-size: 1.2rem; margin-bottom: 8px;">📝</div>
                <div>No active tasks</div>
                <div style="font-size: 0.9rem; margin-top: 8px;">All your tasks are completed!</div>
            `;
        } else if (filter === 'completed') {
            noResultsDiv.innerHTML = `
                <div style="font-size: 1.2rem; margin-bottom: 8px;">✅</div>
                <div>No completed tasks</div>
                <div style="font-size: 0.9rem; margin-top: 8px;">Start completing some tasks!</div>
            `;
        } else {
            noResultsDiv.innerHTML = `
                <div style="font-size: 1.2rem; margin-bottom: 8px;">📋</div>
                <div>No tasks yet</div>
                <div style="font-size: 0.9rem; margin-top: 8px;">Add your first task above!</div>
            `;
        }
        
        taskListDiv.appendChild(noResultsDiv);
        return;
    }
    
    filteredTasks.forEach((task, idx) => {
        // Create a wrapper for the checkbox
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';
        checkboxWrapper.style.display = 'flex';
        checkboxWrapper.style.alignItems = 'center';
        checkboxWrapper.style.justifyContent = 'center';
        checkboxWrapper.style.marginRight = '12px';
        checkboxWrapper.style.height = '100%';
        checkboxWrapper.style.cursor = 'pointer';

        // Create the custom styled checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'custom-checkbox';
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            const originalIndex = tasks.indexOf(task);
            tasks[originalIndex].completed = !tasks[originalIndex].completed;
            saveTasks();
            renderTasks(filter, searchTerm);
        });
        checkboxWrapper.appendChild(checkbox);
        // Add a span for the custom checkmark
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkboxWrapper.appendChild(checkmark);

        // Task item box
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        taskDiv.style.display = 'flex';
        taskDiv.style.alignItems = 'center';
        taskDiv.style.gap = '8px';
        taskDiv.style.padding = '12px';
        taskDiv.style.border = '1px solid #e1e5e9';
        taskDiv.style.borderRadius = '8px';
        taskDiv.style.marginBottom = '8px';
        taskDiv.style.backgroundColor = '#fff';
        taskDiv.style.cursor = 'pointer';
        taskDiv.style.transition = 'all 0.2s ease';
        taskDiv.style.flex = '1';

        taskDiv.addEventListener('mouseenter', () => {
            taskDiv.style.backgroundColor = '#f8f9fa';
            taskDiv.style.transform = 'translateY(-1px)';
            taskDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        taskDiv.addEventListener('mouseleave', () => {
            taskDiv.style.backgroundColor = '#fff';
            taskDiv.style.transform = 'translateY(0)';
            taskDiv.style.boxShadow = 'none';
        });

        const taskContent = document.createElement('div');
        taskContent.style.flex = '1';
        taskContent.style.display = 'flex';
        taskContent.style.flexDirection = 'column';
        taskContent.style.gap = '4px';

        const span = document.createElement('span');
        span.textContent = task.text;
        span.style.fontWeight = '500';
        if (task.completed) span.style.textDecoration = 'line-through';
        if (task.completed) span.style.color = '#6c757d';
        if (searchTerm) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            span.innerHTML = task.text.replace(regex, '<mark style="background-color: #fff3cd; padding: 1px 2px; border-radius: 3px;">$1</mark>');
        }
        const descriptionPreview = document.createElement('span');
        const descriptionText = task.description ? task.description.substring(0, 50) + (task.description.length > 50 ? '...' : '') : 'No description';
        descriptionPreview.textContent = descriptionText;
        descriptionPreview.style.fontSize = '0.85rem';
        descriptionPreview.style.color = '#6c757d';
        descriptionPreview.style.fontStyle = 'italic';
        if (searchTerm && task.description) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            descriptionPreview.innerHTML = descriptionText.replace(regex, '<mark style="background-color: #fff3cd; padding: 1px 2px; border-radius: 3px;">$1</mark>');
        }
        taskContent.appendChild(span);
        taskContent.appendChild(descriptionPreview);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.style.padding = '6px 12px';
        delBtn.style.backgroundColor = '#dc3545';
        delBtn.style.color = 'white';
        delBtn.style.border = 'none';
        delBtn.style.borderRadius = '4px';
        delBtn.style.cursor = 'pointer';
        delBtn.style.fontSize = '0.85rem';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const originalIndex = tasks.indexOf(task);
            tasks.splice(originalIndex, 1);
            saveTasks();
            renderTasks(filter, searchTerm);
        });
        taskDiv.addEventListener('click', () => {
            const originalIndex = tasks.indexOf(task);
            showTaskDetails(originalIndex);
        });

        // Append in new order: checkbox outside the task item box
        const rowDiv = document.createElement('div');
        rowDiv.style.display = 'flex';
        rowDiv.style.alignItems = 'stretch';
        rowDiv.appendChild(checkboxWrapper);
        rowDiv.appendChild(taskDiv);

        taskDiv.appendChild(taskContent);
        taskDiv.appendChild(delBtn);
        taskListDiv.appendChild(rowDiv);
    });
}

addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = newTaskInput.value.trim();
    if (text) {
        tasks.push({ 
            text, 
            completed: false, 
            description: '',
            createdAt: new Date().toISOString()
        });
        saveTasks();
        renderTasks();
        newTaskInput.value = '';
    }
});

document.getElementById('all-task').addEventListener('click', () => {
    const searchTerm = searchTaskInput.value.toLowerCase().trim();
    renderTasks('all', searchTerm);
});
document.getElementById('active-task').addEventListener('click', () => {
    const searchTerm = searchTaskInput.value.toLowerCase().trim();
    renderTasks('active', searchTerm);
});
document.getElementById('completed-task').addEventListener('click', () => {
    const searchTerm = searchTaskInput.value.toLowerCase().trim();
    renderTasks('completed', searchTerm);
});

renderTasks();
