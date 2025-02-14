const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskDeadline = document.getElementById("taskDeadline");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const viewActive = document.getElementById("viewActive");

// Load tasks from local storage
document.addEventListener("DOMContentLoaded", loadTasks);

// Form submission event
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();  // Prevent page refresh

    let isValidTitle = validateForm(taskTitle, 5, 25);
    let isValidDesc = validateForm(taskDesc, 20, 100);
    let isValidDeadline = validateDeadline(taskDeadline);

    if (isValidTitle && isValidDesc && isValidDeadline) {
        addTask(taskTitle.value, taskDesc.value, taskDeadline.value);
        taskForm.reset();
        loadTasks();  // Refresh UI
    } else {
        console.log("Form validation failed. Task not added.");
    }
});

// Form validation function
function validateForm(input, min, max) {
    const errorDiv = input.nextElementSibling;
    if (input.value.length < min || input.value.length > max) {
        errorDiv.textContent = "Must be between " + min + " and " + max + " characters.";
        input.classList.add("is-invalid");
        return false;
    } else {
        errorDiv.textContent = "";
        input.classList.remove("is-invalid");
        return true;
    }
}

// Deadline validation function
function validateDeadline(input) {
    let errorDiv = input.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains("error-message")) {
        errorDiv = document.createElement("div");
        errorDiv.classList.add("error-message");
        errorDiv.style.color = "red";
        input.parentNode.appendChild(errorDiv);
    }

    const currentTime = new Date();
    const inputTime = new Date(input.value);

    if (input.value === "") {
        errorDiv.textContent = "Please select a deadline.";
        input.classList.add("is-invalid");
        return false;
    }

    if (inputTime <= currentTime) {
        errorDiv.textContent = "Deadline must be later than the current time.";
        input.classList.add("is-invalid");
        return false;
    }

    errorDiv.textContent = "";
    input.classList.remove("is-invalid");
    return true;
}

// Add task funtion
function addTask(title, desc, deadline) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const newTask = {
        title: title,
        desc: desc,
        deadline: deadline,
        completed: false
    };
    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

// Load task function
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    taskList.innerHTML = "";

    const currentTime = new Date();

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const taskDeadline = new Date(task.deadline);
        let overdue = false;

        if (task.deadline && taskDeadline < currentTime && !task.completed) {
            overdue = true;
        }

        const li = document.createElement("li");
        li.className = "list-group-item";

        let taskHTML = '<div class="task-content">';
        taskHTML += '<span';

        if (task.completed) {
            taskHTML += ' class="completed"';
        }

        taskHTML += '>';

        if (task.completed) {
            taskHTML += '<strong>[DONE]  </strong> ';
        }

        taskHTML += '<strong>' + task.title + '</strong> - ' + task.desc;

        if (task.deadline) {
            taskHTML += ' (Deadline: ' + task.deadline + ')';
        }

        if (overdue) {
            taskHTML += ' <span class="text-danger fw-bold">Overdue!</span>';
        }

        taskHTML += '</span>';

        taskHTML += '<div>';
        taskHTML += '<button class="btn btn-success btn-sm ms-2" onclick="markDone(' + i + ')">Done</button>';
        taskHTML += '<button class="btn btn-warning btn-sm ms-2" onclick="toggleEdit(' + i + ')">Edit</button>';
        taskHTML += '<button class="btn btn-danger btn-sm ms-2" onclick="deleteTask(' + i + ')">Delete</button>';
        taskHTML += '</div></div>';

        // Edit box
        taskHTML += '<div class="edit-box" id="editBox-' + i + '" style="display: none;">';
        taskHTML += '<input type="text" id="editTitle-' + i + '" class="form-control my-2" value="' + task.title + '">';
        taskHTML += '<div class="text-danger small" id="editTitleError-' + i + '"></div>';

        taskHTML += '<textarea id="editDesc-' + i + '" class="form-control my-2">' + task.desc + '</textarea>';
        taskHTML += '<div class="text-danger small" id="editDescError-' + i + '"></div>';

        taskHTML += '<input type="datetime-local" id="editDeadline-' + i + '" class="form-control my-2" value="' + task.deadline + '">';
        taskHTML += '<div class="text-danger small" id="editDeadlineError-' + i + '"></div>';

        taskHTML += '<button class="btn btn-primary btn-sm ms-2" onclick="saveEdit(' + i + ')">Save</button>';
        taskHTML += '<button class="btn btn-secondary btn-sm ms-2" onclick="toggleEdit(' + i + ')">Cancel</button>';
        taskHTML += '</div>';

        li.innerHTML = taskHTML;
        taskList.appendChild(li);
    }
}

// Toggle edit function
function toggleEdit(index) {
    const editBox = document.getElementById("editBox-" + index);
    if (editBox.style.display === "none") {
        editBox.style.display = "block";
    } else {
        editBox.style.display = "none";
    }
}

// Save edit function
function saveEdit(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks"));

    const newTitle = document.getElementById("editTitle-" + index);
    const newDesc = document.getElementById("editDesc-" + index);
    const newDeadline = document.getElementById("editDeadline-" + index);

    const titleError = document.getElementById("editTitleError-" + index);
    const descError = document.getElementById("editDescError-" + index);
    const deadlineError = document.getElementById("editDeadlineError-" + index);

    let valid = true;

    if (newTitle.value.length < 5 || newTitle.value.length > 25) {
        titleError.textContent = "Title must be between 5 and 25 characters.";
        newTitle.classList.add("is-invalid");
        valid = false;
    } else {
        titleError.textContent = "";
        newTitle.classList.remove("is-invalid");
    }

    if (newDesc.value.length < 20 || newDesc.value.length > 100) {
        descError.textContent = "Description must be between 20 and 100 characters.";
        newDesc.classList.add("is-invalid");
        valid = false;
    } else {
        descError.textContent = "";
        newDesc.classList.remove("is-invalid");
    }

    const currentTime = new Date();
    const inputTime = new Date(newDeadline.value);

    if (newDeadline.value === "") {
        deadlineError.textContent = "Please select a deadline.";
        newDeadline.classList.add("is-invalid");
        valid = false;
    } else if (inputTime < currentTime) { 
        deadlineError.textContent = "Deadline must be later than the current time.";
        newDeadline.classList.add("is-invalid");
        valid = false;
    } else {
        deadlineError.textContent = "";
        newDeadline.classList.remove("is-invalid");
    }

    if (valid) {
        tasks[index].title = newTitle.value.trim();
        tasks[index].desc = newDesc.value.trim();
        tasks[index].deadline = newDeadline.value;

        localStorage.setItem("tasks", JSON.stringify(tasks));
        loadTasks();
    }
}

// Complete task function
function markDone(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks[index].completed = !tasks[index].completed; 
    localStorage.setItem("tasks", JSON.stringify(tasks));

    if (viewActive.textContent === "Show All Tasks") {
        viewActive.click(); 
    } 
    else if (searchInput.value.trim() !== "") {
        loadTasks(); 
        applySearchFilter();
    } 
    else {
        loadTasks();
    }
}

// Delete task function
function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

// Search task event
searchInput.addEventListener("input", function () {
    const searchText = searchInput.value.toLowerCase();
    const tasks = document.querySelectorAll(".list-group-item");

    for (let i = 0; i < tasks.length; i++) {
        const taskText = tasks[i].innerText.toLowerCase();
        if (taskText.includes(searchText)) {
            tasks[i].style.display = "flex";
        } else {
            tasks[i].style.display = "none";
        }
    }
});

// Search task function after complete task
function applySearchFilter() {
    const searchText = searchInput.value.toLowerCase();
    const tasks = document.querySelectorAll(".list-group-item");

    for (let i = 0; i < tasks.length; i++) {
        const taskText = tasks[i].innerText.toLowerCase();
        if (taskText.includes(searchText)) {
            tasks[i].style.display = "flex";
        } else {
            tasks[i].style.display = "none";
        }
    }
}

// Active task event
viewActive.addEventListener("click", function () {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const currentTime = new Date();
    const isFiltering = viewActive.textContent === "View Active Tasks";

    taskList.innerHTML = ""; // Clear task list

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const taskDeadline = new Date(task.deadline);
        let overdue = false;

        if (task.deadline && taskDeadline < currentTime && !task.completed) {
            overdue = true;
        }

        if (!isFiltering || (!task.completed && !overdue)) {
            const li = document.createElement("li");
            li.className = "list-group-item";

            let taskHTML = '<div class="task-content">';
            taskHTML += '<span';
            if (task.completed) {
                taskHTML += ' class="completed"';
            }

            taskHTML += '>';

            if (task.completed) {
                taskHTML += '<strong>[DONE]  </strong> ';
            }

            taskHTML += '<strong>' + task.title + '</strong> - ' + task.desc;

            if (task.deadline) {
                taskHTML += ' (Deadline: ' + task.deadline + ')';
            }

            if (overdue) {
                taskHTML += ' <span class="text-danger fw-bold">Overdue!</span>';
            }

            taskHTML += '</span>';
            taskHTML += '<div>';
            taskHTML += '<button class="btn btn-success btn-sm ms-2" onclick="markDone(' + i + ')">Done</button>';
            taskHTML += '<button class="btn btn-warning btn-sm ms-2" onclick="toggleEdit(' + i + ')">Edit</button>';
            taskHTML += '<button class="btn btn-danger btn-sm ms-2" onclick="deleteTask(' + i + ')">Delete</button>';
            taskHTML += '</div></div>';

            taskHTML += '<div class="edit-box" id="editBox-' + i + '" style="display: none;">';
            taskHTML += '<input type="text" id="editTitle-' + i + '" class="form-control my-2" value="' + task.title + '">';
            taskHTML += '<div class="text-danger small" id="editTitleError-' + i + '"></div>';

            taskHTML += '<textarea id="editDesc-' + i + '" class="form-control my-2">' + task.desc + '</textarea>';
            taskHTML += '<div class="text-danger small" id="editDescError-' + i + '"></div>';

            taskHTML += '<input type="datetime-local" id="editDeadline-' + i + '" class="form-control my-2" value="' + task.deadline + '">';
            taskHTML += '<div class="text-danger small" id="editDeadlineError-' + i + '"></div>';

            taskHTML += '<button class="btn btn-primary btn-sm ms-2" onclick="saveEdit(' + i + ')">Save</button>';
            taskHTML += '<button class="btn btn-secondary btn-sm ms-2" onclick="toggleEdit(' + i + ')">Cancel</button>';
            taskHTML += '</div>';

            li.innerHTML = taskHTML;
            taskList.appendChild(li);
        }
    }

    if (isFiltering) {
        viewActive.textContent = "Show All Tasks";
    } else {
        viewActive.textContent = "View Active Tasks";
    }
});

// Clock function
function updateClock() {
    const currentTime = new Date();
    const clock = document.getElementById("clock");
    clock.innerText = currentTime.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}
setInterval(updateClock, 1000);
updateClock();
