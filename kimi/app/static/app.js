const API_BASE = "";
const TOKEN_KEY = "task_manager_token";
const EMAIL_KEY = "task_manager_email";

let currentFilter = "all";
let editingTaskId = null;

const authView = document.getElementById("auth-view");
const appView = document.getElementById("app-view");
const authError = document.getElementById("auth-error");
const taskError = document.getElementById("task-error");

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(token, email) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

async function apiFetch(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (options.body) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    showAuthView();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch (_) {}
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  if (res.status === 204) return null;
  return res.json();
}

function showAuthView() {
  authView.classList.remove("hidden");
  appView.classList.add("hidden");
}

function showAppView() {
  authView.classList.add("hidden");
  appView.classList.remove("hidden");
  document.getElementById("user-email").textContent = localStorage.getItem(EMAIL_KEY) || "";
  loadTasks();
}

function setError(el, message) {
  if (!message) {
    el.classList.add("hidden");
    el.textContent = "";
    return;
  }
  el.textContent = message;
  el.classList.remove("hidden");
}

// ---- Auth tabs ----
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  setError(authError, "");
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  setError(authError, "");
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(authError, "");
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSession(data.access_token, email);
    showAppView();
  } catch (err) {
    setError(authError, err.message);
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(authError, "");
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSession(data.access_token, email);
    showAppView();
  } catch (err) {
    setError(authError, err.message);
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  clearSession();
  showAuthView();
});

// ---- Tasks ----
const taskForm = document.getElementById("task-form");
const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title");
const taskDescInput = document.getElementById("task-description");
const taskStatusInput = document.getElementById("task-status");
const taskSubmitBtn = document.getElementById("task-submit-btn");
const taskCancelBtn = document.getElementById("task-cancel-btn");
const taskListEl = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    loadTasks();
  });
});

function resetTaskForm() {
  editingTaskId = null;
  taskIdInput.value = "";
  taskTitleInput.value = "";
  taskDescInput.value = "";
  taskStatusInput.value = "pending";
  taskSubmitBtn.textContent = "Add Task";
  taskCancelBtn.classList.add("hidden");
}

taskCancelBtn.addEventListener("click", resetTaskForm);

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(taskError, "");
  const payload = {
    title: taskTitleInput.value.trim(),
    description: taskDescInput.value.trim() || null,
    status: taskStatusInput.value,
  };
  try {
    if (editingTaskId) {
      await apiFetch(`/tasks/${editingTaskId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    resetTaskForm();
    loadTasks();
  } catch (err) {
    setError(taskError, err.message);
  }
});

function startEdit(task) {
  editingTaskId = task.id;
  taskIdInput.value = task.id;
  taskTitleInput.value = task.title;
  taskDescInput.value = task.description || "";
  taskStatusInput.value = task.status;
  taskSubmitBtn.textContent = "Save Changes";
  taskCancelBtn.classList.remove("hidden");
  taskTitleInput.focus();
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  try {
    await apiFetch(`/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  } catch (err) {
    setError(taskError, err.message);
  }
}

function statusLabel(status) {
  return { pending: "Pending", in_progress: "In Progress", completed: "Completed" }[status] || status;
}

function renderTasks(tasks) {
  taskListEl.innerHTML = "";
  const filtered = currentFilter === "all" ? tasks : tasks.filter((t) => t.status === currentFilter);

  emptyState.classList.toggle("hidden", filtered.length > 0);

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.status === "completed" ? "completed" : ""}`;
    li.innerHTML = `
      <div class="task-main">
        <div class="task-title"></div>
        <div class="task-desc"></div>
      </div>
      <span class="status-badge ${task.status}">${statusLabel(task.status)}</span>
      <div class="task-actions">
        <button class="icon-btn edit">Edit</button>
        <button class="icon-btn delete">Delete</button>
      </div>
    `;
    li.querySelector(".task-title").textContent = task.title;
    li.querySelector(".task-desc").textContent = task.description || "";
    li.querySelector(".edit").addEventListener("click", () => startEdit(task));
    li.querySelector(".delete").addEventListener("click", () => deleteTask(task.id));
    taskListEl.appendChild(li);
  });
}

async function loadTasks() {
  setError(taskError, "");
  try {
    const tasks = await apiFetch("/tasks");
    renderTasks(tasks);
  } catch (err) {
    setError(taskError, err.message);
  }
}

// ---- Init ----
if (getToken()) {
  showAppView();
} else {
  showAuthView();
}
