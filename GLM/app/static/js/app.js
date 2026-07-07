(() => {
  "use strict";

  const API_BASE = "/api";
  const TOKEN_KEY = "tm_token";
  const EMAIL_KEY = "tm_email";

  const STATUS_LABELS = {
    pending: "Pending",
    in_progress: "In progress",
    completed: "Completed",
  };

  const el = (id) => document.getElementById(id);

  const authScreen = el("auth-screen");
  const appScreen = el("app-screen");
  const authError = el("auth-error");
  const loginForm = el("login-form");
  const registerForm = el("register-form");
  const authTabs = document.querySelectorAll(".auth-tab");

  const userEmailEl = el("user-email");
  const logoutBtn = el("logout-btn");
  const filterTabsEl = el("filter-tabs");
  const newTaskBtn = el("new-task-btn");
  const apiErrorEl = el("api-error");
  const taskListEl = el("task-list");
  const emptyStateEl = el("empty-state");
  const loadingStateEl = el("loading-state");

  const taskModal = el("task-modal");
  const taskForm = el("task-form");
  const modalTitle = el("modal-title");
  const modalError = el("modal-error");
  const modalSubmit = el("modal-submit");

  const confirmModal = el("confirm-modal");
  const confirmDelete = el("confirm-delete");
  const toastEl = el("toast");

  let state = {
    tasks: [],
    filter: "all",
    editingId: null,
    deletingId: null,
  };

  // ---------- Auth token helpers ----------

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, email) {
    localStorage.setItem(TOKEN_KEY, token);
    if (email) localStorage.setItem(EMAIL_KEY, email);
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  }

  // ---------- API helper ----------

  async function api(path, options = {}) {
    const token = getToken();
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
      clearSession();
      showAuthScreen();
      throw new Error("Session expired. Please log in again.");
    }

    if (res.status === 204) return null;

    let body = null;
    try {
      body = await res.json();
    } catch (_) {
      body = null;
    }

    if (!res.ok) {
      const detail = (body && body.detail) || "Something went wrong.";
      throw new Error(typeof detail === "string" ? detail : "Something went wrong.");
    }

    return body;
  }

  // ---------- Screen switching ----------

  function showAuthScreen() {
    authScreen.hidden = false;
    appScreen.hidden = true;
  }

  function showAppScreen() {
    authScreen.hidden = true;
    appScreen.hidden = false;
    userEmailEl.textContent = localStorage.getItem(EMAIL_KEY) || "";
    loadTasks();
  }

  // ---------- Auth tab switching ----------

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const isLogin = tab.dataset.tab === "login";
      loginForm.hidden = !isLogin;
      registerForm.hidden = isLogin;
      hideAuthError();
    });
  });

  function showAuthError(message) {
    authError.textContent = message;
    authError.hidden = false;
  }

  function hideAuthError() {
    authError.hidden = true;
    authError.textContent = "";
  }

  function setFormBusy(form, busy) {
    const btn = form.querySelector("button[type=submit]");
    if (btn) btn.disabled = busy;
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAuthError();
    const fd = new FormData(loginForm);
    const email = fd.get("email").trim();
    const password = fd.get("password");

    setFormBusy(loginForm, true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((body && body.detail) || "Login failed.");
      }
      setSession(body.access_token, email);
      loginForm.reset();
      showAppScreen();
    } catch (err) {
      showAuthError(err.message);
    } finally {
      setFormBusy(loginForm, false);
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAuthError();
    const fd = new FormData(registerForm);
    const email = fd.get("email").trim();
    const username = fd.get("username").trim();
    const password = fd.get("password");

    setFormBusy(registerForm, true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((body && body.detail) || "Registration failed.");
      }
      // Auto login after successful registration.
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginBody = await loginRes.json().catch(() => null);
      if (!loginRes.ok) {
        throw new Error((loginBody && loginBody.detail) || "Login failed.");
      }
      setSession(loginBody.access_token, email);
      registerForm.reset();
      showAppScreen();
    } catch (err) {
      showAuthError(err.message);
    } finally {
      setFormBusy(registerForm, false);
    }
  });

  logoutBtn.addEventListener("click", () => {
    clearSession();
    state = { tasks: [], filter: "all", editingId: null, deletingId: null };
    showAuthScreen();
  });

  // ---------- Filter tabs ----------

  filterTabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-tab");
    if (!btn) return;
    filterTabsEl.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("is-active"));
    btn.classList.add("is-active");
    state.filter = btn.dataset.status;
    renderTasks();
  });

  // ---------- Loading tasks ----------

  async function loadTasks() {
    hideApiError();
    loadingStateEl.hidden = false;
    taskListEl.innerHTML = "";
    emptyStateEl.hidden = true;
    try {
      const tasks = await api("/tasks/?limit=500");
      state.tasks = tasks || [];
      renderTasks();
    } catch (err) {
      showApiError(err.message);
    } finally {
      loadingStateEl.hidden = true;
    }
  }

  function showApiError(message) {
    apiErrorEl.textContent = message;
    apiErrorEl.hidden = false;
  }

  function hideApiError() {
    apiErrorEl.hidden = true;
    apiErrorEl.textContent = "";
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toastEl.hidden = true;
    }, 2200);
  }

  // ---------- Rendering ----------

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (_) {
      return "";
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  function renderTasks() {
    const filtered =
      state.filter === "all" ? state.tasks : state.tasks.filter((t) => t.status === state.filter);

    // Sort: newest updated first.
    const sorted = [...filtered].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    taskListEl.innerHTML = "";
    emptyStateEl.hidden = sorted.length > 0;

    sorted.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.dataset.id = task.id;

      const isCompleted = task.status === "completed";

      card.innerHTML = `
        <div class="task-card-main">
          <div class="task-title-row">
            <span class="task-title ${isCompleted ? "is-completed" : ""}">${escapeHtml(task.title)}</span>
            <span class="badge badge-${task.status}">${STATUS_LABELS[task.status] || task.status}</span>
          </div>
          ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ""}
          <div class="task-meta">Updated ${formatDate(task.updated_at)}</div>
        </div>
        <div class="task-actions">
          <button type="button" class="icon-btn" data-action="edit" title="Edit">&#9998;</button>
          <button type="button" class="icon-btn" data-action="delete" title="Delete">&times;</button>
        </div>
      `;

      card.querySelector('[data-action="edit"]').addEventListener("click", () => openEditModal(task));
      card.querySelector('[data-action="delete"]').addEventListener("click", () => openConfirmModal(task.id));

      taskListEl.appendChild(card);
    });
  }

  // ---------- Task modal (create/edit) ----------

  function openCreateModal() {
    state.editingId = null;
    modalTitle.textContent = "New task";
    modalSubmit.textContent = "Create task";
    taskForm.reset();
    taskForm.elements.id.value = "";
    hideModalError();
    taskModal.hidden = false;
    taskForm.elements.title.focus();
  }

  function openEditModal(task) {
    state.editingId = task.id;
    modalTitle.textContent = "Edit task";
    modalSubmit.textContent = "Save changes";
    taskForm.elements.id.value = task.id;
    taskForm.elements.title.value = task.title;
    taskForm.elements.description.value = task.description || "";
    taskForm.elements.status.value = task.status;
    hideModalError();
    taskModal.hidden = false;
    taskForm.elements.title.focus();
  }

  function closeTaskModal() {
    taskModal.hidden = true;
    taskForm.reset();
    state.editingId = null;
  }

  function showModalError(message) {
    modalError.textContent = message;
    modalError.hidden = false;
  }

  function hideModalError() {
    modalError.hidden = true;
    modalError.textContent = "";
  }

  newTaskBtn.addEventListener("click", openCreateModal);
  el("modal-close").addEventListener("click", closeTaskModal);
  el("modal-cancel").addEventListener("click", closeTaskModal);
  taskModal.addEventListener("click", (e) => {
    if (e.target === taskModal) closeTaskModal();
  });

  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideModalError();
    const fd = new FormData(taskForm);
    const payload = {
      title: fd.get("title").trim(),
      description: fd.get("description").trim() || null,
      status: fd.get("status"),
    };

    modalSubmit.disabled = true;
    try {
      if (state.editingId) {
        const updated = await api(`/tasks/${state.editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        const idx = state.tasks.findIndex((t) => t.id === updated.id);
        if (idx !== -1) state.tasks[idx] = updated;
        showToast("Task updated");
      } else {
        const created = await api("/tasks/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        state.tasks.push(created);
        showToast("Task created");
      }
      closeTaskModal();
      renderTasks();
    } catch (err) {
      showModalError(err.message);
    } finally {
      modalSubmit.disabled = false;
    }
  });

  // ---------- Delete confirm modal ----------

  function openConfirmModal(id) {
    state.deletingId = id;
    confirmModal.hidden = false;
  }

  function closeConfirmModal() {
    confirmModal.hidden = true;
    state.deletingId = null;
  }

  el("confirm-cancel").addEventListener("click", closeConfirmModal);
  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) closeConfirmModal();
  });

  confirmDelete.addEventListener("click", async () => {
    const id = state.deletingId;
    if (id == null) return;
    confirmDelete.disabled = true;
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      state.tasks = state.tasks.filter((t) => t.id !== id);
      renderTasks();
      showToast("Task deleted");
      closeConfirmModal();
    } catch (err) {
      showApiError(err.message);
      closeConfirmModal();
    } finally {
      confirmDelete.disabled = false;
    }
  });

  // ---------- Keyboard ----------

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!taskModal.hidden) closeTaskModal();
      if (!confirmModal.hidden) closeConfirmModal();
    }
  });

  // ---------- Init ----------

  if (getToken()) {
    showAppScreen();
  } else {
    showAuthScreen();
  }
})();
