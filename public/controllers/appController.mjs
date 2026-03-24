import {
  fetchCurrentUser,
  fetchBoards,
  fetchBoard,
  fetchBoardColumns,
  fetchBoardTasks,
  createBoard,
  createBoardInvite,
  createTask,
  acceptBoardInvite,
  updateTask,
  deleteTask,
  loginUser,
  logoutUser,
} from "../services/apiClient.mjs";
import { getUser, setUser, clearUser } from "../models/userModel.mjs";
import { registerView, navigateTo, onNavigate } from "../services/router.mjs";
import { ready, t, translatePage } from "../services/i18n.mjs";

const loginView = document.getElementById("login-view");
const boardsView = document.getElementById("boards-view");
const boardView = document.getElementById("board-view");
const accountView = document.getElementById("account-view");

registerView("login", loginView);
registerView("boards", boardsView);
registerView("board", boardView);
registerView("account", accountView);

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const showRegisterLink = document.getElementById("show-register");

const displayName = document.getElementById("display-name");
const displayEmail = document.getElementById("display-email");
const openAccountBtn = document.getElementById("open-account-btn");
const boardAccountBtn = document.getElementById("board-account-btn");
const boardBackBtn = document.getElementById("board-back-btn");
const backToBoardsBtn = document.getElementById("back-to-boards-btn");
const logoutBtn = document.getElementById("logout-btn");
const editSection = document.getElementById("edit-section");
const deleteSection = document.getElementById("delete-section");
const toggleBoardFormBtn = document.getElementById("toggle-board-form-btn");
const cancelBoardFormBtn = document.getElementById("cancel-board-form-btn");
const createBoardForm = document.getElementById("create-board-form");
const createBoardNameInput = document.getElementById("create-board-name");
const createBoardDescriptionInput = document.getElementById("create-board-description");
const createBoardVisibilityInput = document.getElementById("create-board-visibility");
const boardMessage = document.getElementById("board-message");
const boardsEmpty = document.getElementById("boards-empty");
const boardsList = document.getElementById("boards-list");
const boardDetailMessage = document.getElementById("board-detail-message");
const toggleSharePanelBtn = document.getElementById("toggle-share-panel-btn");
const closeSharePanelBtn = document.getElementById("close-share-panel-btn");
const sharePanel = document.getElementById("share-panel");
const shareBoardForm = document.getElementById("share-board-form");
const shareRoleInput = document.getElementById("share-role");
const shareMessage = document.getElementById("share-message");
const shareLinkBox = document.getElementById("share-link-box");
const shareLinkInput = document.getElementById("share-link-input");
const boardPageTitle = document.getElementById("board-page-title");
const boardDetailName = document.getElementById("board-detail-name");
const boardDetailDescription = document.getElementById("board-detail-description");
const boardDetailVisibility = document.getElementById("board-detail-visibility");
const boardColumns = document.getElementById("board-columns");

let pendingInviteToken = new URLSearchParams(window.location.search).get("invite");
let boardListState = [];
let selectedBoardId = null;
let currentBoardState = null;
let currentBoardColumnsState = [];
let currentBoardTasksState = [];
let activeCreateColumnId = null;
let editingTaskId = null;

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message " + type;
}

function hideMessage(element) {
  element.className = "message";
  element.textContent = "";
}

function showLoginSection() {
  loginSection.classList.remove("hidden");
  registerSection.classList.add("hidden");
}

function showRegisterSection() {
  loginSection.classList.add("hidden");
  registerSection.classList.remove("hidden");
}

function showUserInfo(user) {
  displayName.textContent = user.name || t("account.not_set");
  displayEmail.textContent = user.email;

  editSection.setAttribute("user-id", user.id);
  deleteSection.setAttribute("user-id", user.id);
}

function handleShowRegister(event) {
  event.preventDefault();
  showRegisterSection();
  hideMessage(loginMessage);
}

function handleShowLogin() {
  showLoginSection();
}

function formatBoardVisibility(visibility) {
  if (visibility === "shared") {
    return t("boards.visibility_shared");
  }

  return t("boards.visibility_private");
}

function formatBoardRole(role) {
  if (role === "editor") {
    return t("share.role_editor");
  }

  if (role === "viewer") {
    return t("share.role_viewer");
  }

  return t("share.role_owner");
}

function formatBoardMeta(board) {
  const parts = [formatBoardVisibility(board.visibility)];

  if (board.role) {
    parts.push(formatBoardRole(board.role));
  }

  return parts.join(" · ");
}

function formatDateValue(value) {
  return value ? value.slice(0, 10) : "";
}

function canEditCurrentBoard() {
  return currentBoardState?.role === "owner" || currentBoardState?.role === "editor";
}

function canShareCurrentBoard() {
  return currentBoardState?.role === "owner";
}

function setBoardFormVisibility(isVisible) {
  createBoardForm.classList.toggle("hidden", !isVisible);
  toggleBoardFormBtn.classList.toggle("hidden", isVisible);

  if (!isVisible) {
    createBoardForm.reset();
    createBoardVisibilityInput.value = "private";
  }
}

function populateColumnSelect(selectElement, selectedColumnId) {
  selectElement.innerHTML = "";

  currentBoardColumnsState.forEach((column) => {
    const option = document.createElement("option");
    option.value = column.id;
    option.textContent = column.name;

    if (selectedColumnId !== null && selectedColumnId !== undefined && column.id === selectedColumnId) {
      option.selected = true;
    }

    selectElement.appendChild(option);
  });
}

function resetTaskUiState() {
  activeCreateColumnId = null;
  editingTaskId = null;
}

function setSharePanelVisibility(isVisible) {
  sharePanel.classList.toggle("hidden", !isVisible);

  if (!isVisible) {
    shareBoardForm.reset();
    shareRoleInput.value = "viewer";
    shareLinkBox.classList.add("hidden");
    shareLinkInput.value = "";
    hideMessage(shareMessage);
  }
}

function clearInviteTokenFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("invite");
  pendingInviteToken = null;
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function renderCurrentBoard() {
  if (!currentBoardState) {
    return;
  }

  renderBoardDetail(currentBoardState, currentBoardColumnsState, currentBoardTasksState);
}

function focusCreateTaskForm(columnId) {
  const input = boardColumns.querySelector(`.task-create-form[data-column-id="${columnId}"] input[name="title"]`);
  if (input) {
    input.focus();
  }
}

function focusEditTaskForm(taskId) {
  const input = boardColumns.querySelector(`.task-edit-form[data-task-id="${taskId}"] input[name="title"]`);
  if (input) {
    input.focus();
  }
}

function getTaskFormValues(form) {
  const title = form.querySelector('[name="title"]').value.trim();
  const description = form.querySelector('[name="description"]').value.trim();
  const dueDate = form.querySelector('[name="dueDate"]').value;
  const reviewRequested = form.querySelector('[name="reviewRequested"]').checked;

  return {
    title,
    description: description || null,
    dueDate: dueDate || null,
    reviewRequested,
  };
}

function clearBoardsView() {
  boardListState = [];
  selectedBoardId = null;
  currentBoardState = null;
  currentBoardColumnsState = [];
  currentBoardTasksState = [];
  resetTaskUiState();
  setBoardFormVisibility(false);
  setSharePanelVisibility(false);
  boardsList.innerHTML = "";
  boardColumns.innerHTML = "";
  boardPageTitle.textContent = "";
  boardDetailName.textContent = "";
  boardDetailDescription.textContent = "";
  boardDetailVisibility.textContent = "";
  boardsEmpty.classList.remove("hidden");
  hideMessage(boardMessage);
  hideMessage(boardDetailMessage);
  toggleSharePanelBtn.classList.add("hidden");
}

function buildTaskEditForm(task) {
  const form = document.createElement("form");
  form.className = "task-edit-form";
  form.dataset.taskId = task.id;

  const grid = document.createElement("div");
  grid.className = "task-form-grid";

  const titleGroup = document.createElement("div");
  titleGroup.className = "input-group";
  const titleLabel = document.createElement("label");
  titleLabel.textContent = t("tasks.title_label");
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.name = "title";
  titleInput.required = true;
  titleInput.maxLength = 120;
  titleInput.value = task.title;
  titleGroup.appendChild(titleLabel);
  titleGroup.appendChild(titleInput);

  const columnGroup = document.createElement("div");
  columnGroup.className = "input-group";
  const columnLabel = document.createElement("label");
  columnLabel.textContent = t("tasks.column_label");
  const columnSelect = document.createElement("select");
  columnSelect.name = "columnId";
  populateColumnSelect(columnSelect, task.columnId);
  columnGroup.appendChild(columnLabel);
  columnGroup.appendChild(columnSelect);

  const descriptionGroup = document.createElement("div");
  descriptionGroup.className = "input-group task-form-wide";
  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = t("tasks.description_label");
  const descriptionInput = document.createElement("textarea");
  descriptionInput.name = "description";
  descriptionInput.rows = 3;
  descriptionInput.placeholder = t("tasks.description_placeholder");
  descriptionInput.value = task.description || "";
  descriptionGroup.appendChild(descriptionLabel);
  descriptionGroup.appendChild(descriptionInput);

  const dueDateGroup = document.createElement("div");
  dueDateGroup.className = "input-group";
  const dueDateLabel = document.createElement("label");
  dueDateLabel.textContent = t("tasks.due_date_label");
  const dueDateInput = document.createElement("input");
  dueDateInput.type = "date";
  dueDateInput.name = "dueDate";
  dueDateInput.value = formatDateValue(task.dueDate);
  dueDateGroup.appendChild(dueDateLabel);
  dueDateGroup.appendChild(dueDateInput);

  const reviewLabel = document.createElement("label");
  reviewLabel.className = "checkbox-group task-review-checkbox";
  const reviewInput = document.createElement("input");
  reviewInput.type = "checkbox";
  reviewInput.name = "reviewRequested";
  reviewInput.checked = task.reviewRequested;
  const reviewText = document.createElement("span");
  reviewText.textContent = t("tasks.review_requested_label");
  reviewLabel.appendChild(reviewInput);
  reviewLabel.appendChild(reviewText);

  grid.appendChild(titleGroup);
  grid.appendChild(columnGroup);
  grid.appendChild(descriptionGroup);
  grid.appendChild(dueDateGroup);
  grid.appendChild(reviewLabel);
  form.appendChild(grid);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "task-action-btn";
  saveButton.textContent = t("tasks.save_button");

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "task-action-btn";
  cancelButton.dataset.taskAction = "cancel-edit";
  cancelButton.dataset.taskId = task.id;
  cancelButton.textContent = t("tasks.cancel_button");

  actions.appendChild(saveButton);
  actions.appendChild(cancelButton);
  form.appendChild(actions);

  return form;
}

function buildTaskCreateForm(column) {
  const form = document.createElement("form");
  form.className = "task-create-form";
  form.dataset.columnId = column.id;

  const grid = document.createElement("div");
  grid.className = "task-form-grid";

  const titleGroup = document.createElement("div");
  titleGroup.className = "input-group";
  const titleLabel = document.createElement("label");
  titleLabel.textContent = t("tasks.title_label");
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.name = "title";
  titleInput.required = true;
  titleInput.maxLength = 120;
  titleInput.placeholder = t("tasks.title_placeholder");
  titleGroup.appendChild(titleLabel);
  titleGroup.appendChild(titleInput);

  const descriptionGroup = document.createElement("div");
  descriptionGroup.className = "input-group task-form-wide";
  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = t("tasks.description_label");
  const descriptionInput = document.createElement("textarea");
  descriptionInput.name = "description";
  descriptionInput.rows = 3;
  descriptionInput.placeholder = t("tasks.description_placeholder");
  descriptionGroup.appendChild(descriptionLabel);
  descriptionGroup.appendChild(descriptionInput);

  const dueDateGroup = document.createElement("div");
  dueDateGroup.className = "input-group";
  const dueDateLabel = document.createElement("label");
  dueDateLabel.textContent = t("tasks.due_date_label");
  const dueDateInput = document.createElement("input");
  dueDateInput.type = "date";
  dueDateInput.name = "dueDate";
  dueDateGroup.appendChild(dueDateLabel);
  dueDateGroup.appendChild(dueDateInput);

  const reviewLabel = document.createElement("label");
  reviewLabel.className = "checkbox-group task-review-checkbox";
  const reviewInput = document.createElement("input");
  reviewInput.type = "checkbox";
  reviewInput.name = "reviewRequested";
  const reviewText = document.createElement("span");
  reviewText.textContent = t("tasks.review_requested_label");
  reviewLabel.appendChild(reviewInput);
  reviewLabel.appendChild(reviewText);

  grid.appendChild(titleGroup);
  grid.appendChild(descriptionGroup);
  grid.appendChild(dueDateGroup);
  grid.appendChild(reviewLabel);
  form.appendChild(grid);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const createButton = document.createElement("button");
  createButton.type = "submit";
  createButton.className = "task-action-btn";
  createButton.textContent = t("tasks.create_button");

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "task-action-btn";
  cancelButton.dataset.taskAction = "cancel-create";
  cancelButton.dataset.columnId = column.id;
  cancelButton.textContent = t("tasks.cancel_button");

  actions.appendChild(createButton);
  actions.appendChild(cancelButton);
  form.appendChild(actions);

  return form;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-item";
  item.dataset.taskId = task.id;

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;
  item.appendChild(title);

  if (task.description) {
    const description = document.createElement("p");
    description.className = "task-description-text";
    description.textContent = task.description;
    item.appendChild(description);
  }

  if (task.dueDate) {
    const dueDate = document.createElement("p");
    dueDate.className = "task-meta";
    dueDate.textContent = t("boards.task_due") + ": " + formatDateValue(task.dueDate);
    item.appendChild(dueDate);
  }

  if (task.reviewRequested) {
    const reviewBadge = document.createElement("span");
    reviewBadge.className = "task-badge";
    reviewBadge.textContent = t("boards.review_requested");
    item.appendChild(reviewBadge);
  }

  if (canEditCurrentBoard()) {
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "task-action-btn";
    editButton.dataset.taskAction = "edit";
    editButton.dataset.taskId = task.id;
    editButton.textContent = t("tasks.edit_button");

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "task-action-btn task-delete-btn";
    deleteButton.dataset.taskAction = "delete";
    deleteButton.dataset.taskId = task.id;
    deleteButton.textContent = t("tasks.delete_button");

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    item.appendChild(actions);
  }

  if (canEditCurrentBoard() && editingTaskId === task.id) {
    item.appendChild(buildTaskEditForm(task));
  }

  return item;
}

function renderBoardColumns(columns, tasks) {
  boardColumns.innerHTML = "";

  if (columns.length === 0) {
    const emptyText = document.createElement("p");
    emptyText.className = "empty-state board-empty-state";
    emptyText.textContent = t("boards.no_columns");
    boardColumns.appendChild(emptyText);
    return;
  }

  const tasksByColumn = new Map();

  tasks.forEach((task) => {
    if (!tasksByColumn.has(task.columnId)) {
      tasksByColumn.set(task.columnId, []);
    }
    tasksByColumn.get(task.columnId).push(task);
  });

  columns.forEach((column) => {
    const columnCard = document.createElement("article");
    columnCard.className = "column-card";

    const columnHeader = document.createElement("div");
    columnHeader.className = "column-header";

    const columnTitle = document.createElement("h3");
    columnTitle.className = "column-title";
    columnTitle.textContent = column.name;
    columnHeader.appendChild(columnTitle);

    if (canEditCurrentBoard()) {
      const createButton = document.createElement("button");
      createButton.type = "button";
      createButton.className = "column-create-btn";
      createButton.dataset.taskAction = "show-create";
      createButton.dataset.columnId = column.id;
      createButton.textContent = t("tasks.new_task_button");
      columnHeader.appendChild(createButton);
    }

    columnCard.appendChild(columnHeader);

    if (canEditCurrentBoard() && activeCreateColumnId === column.id) {
      columnCard.appendChild(buildTaskCreateForm(column));
    }

    const columnTasks = tasksByColumn.get(column.id) || [];

    if (columnTasks.length === 0) {
      const emptyText = document.createElement("div");
      emptyText.className = "column-empty column-empty-state";
      emptyText.textContent = t("boards.no_tasks");
      columnCard.appendChild(emptyText);
    } else {
      const taskList = document.createElement("ul");
      taskList.className = "task-list";

      columnTasks.forEach((task) => {
        taskList.appendChild(createTaskElement(task));
      });

      columnCard.appendChild(taskList);
    }

    boardColumns.appendChild(columnCard);
  });
}

function renderBoardDetail(board, columns, tasks) {
  boardPageTitle.textContent = board.name;
  boardDetailName.textContent = board.name;
  boardDetailDescription.textContent = board.description || t("boards.no_description");
  boardDetailVisibility.textContent = formatBoardMeta(board);
  toggleSharePanelBtn.classList.toggle("hidden", !canShareCurrentBoard());
  if (!canShareCurrentBoard()) {
    setSharePanelVisibility(false);
  }
  renderBoardColumns(columns, tasks);
}

function createBoardListItem(board) {
  const listItem = document.createElement("li");
  listItem.className = "board-list-item";

  if (board.id === selectedBoardId) {
    listItem.classList.add("active");
  }

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "board-list-button";
  openButton.dataset.boardId = board.id;

  const content = document.createElement("div");
  content.className = "board-list-content";

  const name = document.createElement("p");
  name.className = "board-name";
  name.textContent = board.name;
  content.appendChild(name);

  const meta = document.createElement("p");
  meta.className = "board-meta";
  meta.textContent = formatBoardMeta(board);
  content.appendChild(meta);

  if (board.description) {
    const description = document.createElement("p");
    description.className = "board-description";
    description.textContent = board.description;
    content.appendChild(description);
  }

  const action = document.createElement("span");
  action.className = "board-open-label";
  action.textContent = t("boards.open_button");

  openButton.appendChild(content);
  openButton.appendChild(action);
  listItem.appendChild(openButton);

  return listItem;
}

function renderBoards(boards) {
  boardsList.innerHTML = "";

  if (boards.length === 0) {
    boardsEmpty.classList.remove("hidden");
    return;
  }

  boardsEmpty.classList.add("hidden");

  boards.forEach((board) => {
    boardsList.appendChild(createBoardListItem(board));
  });
}

async function loadBoardDetail(boardId) {
  selectedBoardId = boardId;
  renderBoards(boardListState);

  const board = await fetchBoard(boardId);
  const [columns, tasks] = await Promise.all([
    fetchBoardColumns(boardId),
    fetchBoardTasks(boardId),
  ]);

  currentBoardState = board;
  currentBoardColumnsState = columns;
  currentBoardTasksState = tasks;
  renderBoardDetail(board, columns, tasks);
}

async function loadBoards() {
  const boards = await fetchBoards();
  boardListState = boards;

  if (boards.length === 0) {
    clearBoardsView();
    renderBoards([]);
    return;
  }

  renderBoards(boards);
}

function setAuthenticatedUser(user) {
  setUser(user);
  showUserInfo(user);
}

async function handlePendingInviteAfterAuth() {
  if (!pendingInviteToken) {
    return false;
  }

  try {
    const board = await acceptBoardInvite(pendingInviteToken);
    clearInviteTokenFromUrl();
    await loadBoards();
    await loadBoardDetail(board.id);
    navigateTo("board");
    showMessage(boardDetailMessage, t("share.join_success"), "success");
    return true;
  } catch (error) {
    clearInviteTokenFromUrl();
    showMessage(boardMessage, error.message, "error");
    return false;
  }
}

async function goToBoards(user) {
  hideMessage(loginMessage);
  setAuthenticatedUser(user);

  const joinedBoard = await handlePendingInviteAfterAuth();
  if (joinedBoard) {
    return;
  }

  navigateTo("boards");
}

function goToAccount() {
  navigateTo("account");
}

function goToLogin({ resetForm = false } = {}) {
  clearUser();
  clearBoardsView();
  hideMessage(loginMessage);
  showLoginSection();
  if (resetForm) {
    loginForm.reset();
  }
  navigateTo("login");
}

async function handleUserCreated(event) {
  await goToBoards(event.detail.user);
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const user = await loginUser(email, password);
    await goToBoards(user);
  } catch (error) {
    showMessage(loginMessage, error.message, "error");
  }
}

async function handleLogout() {
  try {
    await logoutUser();
    goToLogin({ resetForm: true });
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function handleUserUpdated(event) {
  const updatedUser = event.detail.user;
  setAuthenticatedUser(updatedUser);
}

function handleUserDeleted() {
  goToLogin({ resetForm: true });
  alert(t("account.deleted"));
}

function handleOpenAccount() {
  goToAccount();
}

function handleBoardAccount() {
  goToAccount();
}

function handleBoardBack() {
  navigateTo("boards");
}

function handleBackToBoards() {
  navigateTo("boards");
}

function handleShowBoardForm() {
  hideMessage(boardMessage);
  setBoardFormVisibility(true);
  createBoardNameInput.focus();
}

function handleHideBoardForm() {
  hideMessage(boardMessage);
  setBoardFormVisibility(false);
}

function handleShowSharePanel() {
  hideMessage(shareMessage);
  setSharePanelVisibility(true);
}

function handleHideSharePanel() {
  setSharePanelVisibility(false);
}

async function handleCreateBoard(event) {
  event.preventDefault();
  hideMessage(boardMessage);

  const name = createBoardNameInput.value.trim();
  const description = createBoardDescriptionInput.value.trim();
  const visibility = createBoardVisibilityInput.value;

  try {
    const board = await createBoard({
      name,
      description,
      visibility,
    });

    createBoardForm.reset();
    createBoardVisibilityInput.value = "private";
    setBoardFormVisibility(false);
    showMessage(boardMessage, t("boards.create_success"), "success");
    await loadBoards();
    await loadBoardDetail(board.id);
    navigateTo("board");
  } catch (error) {
    showMessage(boardMessage, error.message, "error");
  }
}

async function handleCreateShareLink(event) {
  event.preventDefault();
  hideMessage(shareMessage);

  if (!selectedBoardId) {
    return;
  }

  try {
    const invite = await createBoardInvite(selectedBoardId, shareRoleInput.value);
    shareLinkInput.value = invite.inviteUrl;
    shareLinkBox.classList.remove("hidden");
    showMessage(shareMessage, t("share.create_success"), "success");
    await loadBoards();
    await loadBoardDetail(selectedBoardId);
  } catch (error) {
    showMessage(shareMessage, error.message, "error");
  }
}

function handleBoardsListClick(event) {
  const button = event.target.closest("[data-board-id]");
  if (!button) {
    return;
  }

  const boardId = Number.parseInt(button.dataset.boardId, 10);
  if (!Number.isFinite(boardId)) {
    return;
  }

  hideMessage(boardDetailMessage);
  loadBoardDetail(boardId)
    .then(() => {
      navigateTo("board");
    })
    .catch((error) => {
      showMessage(boardMessage, error.message, "error");
    });
}

async function handleBoardColumnsClick(event) {
  const actionButton = event.target.closest("[data-task-action]");
  if (!actionButton) {
    return;
  }

  if (!canEditCurrentBoard()) {
    return;
  }

  if (actionButton.dataset.taskAction === "show-create") {
    const columnId = Number.parseInt(actionButton.dataset.columnId, 10);
    if (!Number.isFinite(columnId)) {
      return;
    }

    hideMessage(boardDetailMessage);
    activeCreateColumnId = columnId;
    editingTaskId = null;
    renderCurrentBoard();
    focusCreateTaskForm(columnId);
    return;
  }

  if (actionButton.dataset.taskAction === "cancel-create") {
    hideMessage(boardDetailMessage);
    activeCreateColumnId = null;
    renderCurrentBoard();
    return;
  }

  const taskId = Number.parseInt(actionButton.dataset.taskId, 10);
  if (!Number.isFinite(taskId)) {
    return;
  }

  if (actionButton.dataset.taskAction === "edit") {
    hideMessage(boardDetailMessage);
    activeCreateColumnId = null;
    editingTaskId = taskId;
    renderCurrentBoard();
    focusEditTaskForm(taskId);
    return;
  }

  if (actionButton.dataset.taskAction === "cancel-edit") {
    hideMessage(boardDetailMessage);
    editingTaskId = null;
    renderCurrentBoard();
    return;
  }

  if (actionButton.dataset.taskAction === "delete") {
    const confirmed = confirm(t("tasks.delete_confirm"));
    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(taskId);
      editingTaskId = null;
      await loadBoardDetail(selectedBoardId);
      showMessage(boardDetailMessage, t("tasks.delete_success"), "success");
    } catch (error) {
      showMessage(boardDetailMessage, error.message, "error");
    }
  }
}

async function handleBoardColumnsSubmit(event) {
  const form = event.target.closest(".task-create-form, .task-edit-form");
  if (!form) {
    return;
  }

  event.preventDefault();

  if (!canEditCurrentBoard()) {
    return;
  }

  const taskValues = getTaskFormValues(form);

  try {
    if (form.classList.contains("task-create-form")) {
      const columnId = Number.parseInt(form.dataset.columnId, 10);
      if (!Number.isFinite(columnId) || !selectedBoardId) {
        return;
      }

      const task = await createTask(selectedBoardId, {
        title: taskValues.title,
        description: taskValues.description,
        dueDate: taskValues.dueDate,
        columnId,
      });

      if (taskValues.reviewRequested) {
        await updateTask(task.id, { reviewRequested: true });
      }

      activeCreateColumnId = null;
      await loadBoardDetail(selectedBoardId);
      showMessage(boardDetailMessage, t("tasks.create_success"), "success");
      return;
    }

    const taskId = Number.parseInt(form.dataset.taskId, 10);
    if (!Number.isFinite(taskId)) {
      return;
    }

    await updateTask(taskId, {
      title: taskValues.title,
      description: taskValues.description,
      dueDate: taskValues.dueDate,
      columnId: form.querySelector('[name="columnId"]').value,
      reviewRequested: taskValues.reviewRequested,
    });

    editingTaskId = null;
    await loadBoardDetail(selectedBoardId);
    showMessage(boardDetailMessage, t("tasks.update_success"), "success");
  } catch (error) {
    showMessage(boardDetailMessage, error.message, "error");
  }
}

function handleNavigation(viewName) {
  const currentUser = getUser();

  if ((viewName === "boards" || viewName === "board" || viewName === "account") && !currentUser) {
    navigateTo("login");
    return;
  }

  if (viewName === "login" && currentUser) {
    navigateTo("boards");
    return;
  }

  if (viewName === "boards") {
    setSharePanelVisibility(false);
    showUserInfo(currentUser);
    loadBoards().catch((error) => {
      showMessage(boardMessage, error.message, "error");
    });
  }

  if (viewName === "board") {
    showUserInfo(currentUser);

    if (!selectedBoardId) {
      navigateTo("boards");
      return;
    }

    loadBoardDetail(selectedBoardId).catch((error) => {
      showMessage(boardMessage, error.message, "error");
      navigateTo("boards");
    });
  }

  if (viewName === "account") {
    setSharePanelVisibility(false);
    showUserInfo(currentUser);
  }
}

async function init() {
  await ready;
  translatePage();

  showRegisterLink.addEventListener("click", handleShowRegister);
  registerSection.addEventListener("show-login", handleShowLogin);
  registerSection.addEventListener("user-created", handleUserCreated);
  loginForm.addEventListener("submit", handleLogin);

  openAccountBtn.addEventListener("click", handleOpenAccount);
  boardAccountBtn.addEventListener("click", handleBoardAccount);
  boardBackBtn.addEventListener("click", handleBoardBack);
  backToBoardsBtn.addEventListener("click", handleBackToBoards);
  logoutBtn.addEventListener("click", handleLogout);
  editSection.addEventListener("user-updated", handleUserUpdated);
  deleteSection.addEventListener("user-deleted", handleUserDeleted);
  toggleBoardFormBtn.addEventListener("click", handleShowBoardForm);
  cancelBoardFormBtn.addEventListener("click", handleHideBoardForm);
  toggleSharePanelBtn.addEventListener("click", handleShowSharePanel);
  closeSharePanelBtn.addEventListener("click", handleHideSharePanel);
  createBoardForm.addEventListener("submit", handleCreateBoard);
  shareBoardForm.addEventListener("submit", handleCreateShareLink);
  boardsList.addEventListener("click", handleBoardsListClick);
  boardColumns.addEventListener("click", handleBoardColumnsClick);
  boardColumns.addEventListener("submit", handleBoardColumnsSubmit);
  setBoardFormVisibility(false);
  setSharePanelVisibility(false);
  resetTaskUiState();

  try {
    const user = await fetchCurrentUser();
    if (user) {
      await goToBoards(user);
    } else {
      goToLogin();
    }
  } catch (error) {
    goToLogin();
  }

  onNavigate(handleNavigation);
}

init();
