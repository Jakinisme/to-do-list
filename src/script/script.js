const searchTask = document.getElementById('search-task-btn');
const searchTaskInput = document.getElementById('search-task');

const addTaskForm = document.getElementById('add-task-form');
const newTaskInput = document.getElementById('new-task-input');
const taskListDiv = document.querySelector('.task-list');

const closeModal = modal.querySelector('.close-modal');
const saveDetailsBtn = modal.querySelector('#save-details');
const cancelDetailsBtn = modal.querySelector('#cancel-details');

let currentTaskIndex = -1;

let isSearch = false

searchTask.addEventListener("click", () => {
    if (searchTaskInput.hidden === true && isSearch === false) {
        isSearch = true
        searchTaskInput.hidden = false
        searchTaskInput.focus();
    } else {
        isSearch = false
        searchTaskInput.hidden = true
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
    
    // Apply status filter first
    if (filter === 'active') filteredTasks = tasks.filter(t => !t.completed);
    if (filter === 'completed') filteredTasks = tasks.filter(t => t.completed);
    
    // Then apply search filter
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => {
            const taskText = task.text.toLowerCase();
            const taskDescription = (task.description || '').toLowerCase();
            return taskText.includes(searchTerm) || taskDescription.includes(searchTerm);
        });
    }
    
    // Show "no results" message if no tasks match
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
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.style.marginRight = '8px';
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            const originalIndex = tasks.indexOf(task);
            tasks[originalIndex].completed = !tasks[originalIndex].completed;
            saveTasks();
            renderTasks(filter, searchTerm);
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
        
        taskDiv.appendChild(checkbox);
        taskDiv.appendChild(taskContent);
        taskDiv.appendChild(delBtn);
        taskListDiv.appendChild(taskDiv);
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
