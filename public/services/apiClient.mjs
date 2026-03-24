async function apiRequest(url, method, body, requestOptions = {}) {
  const { allowUnauthorized = false } = requestOptions;
  const options = {
    method,
    headers: {},
    credentials: "include",
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (allowUnauthorized && response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(data.error?.message || "Request failed");
  }

  return data;
}

export async function fetchCurrentUser() {
  const data = await apiRequest("/users/me", "GET", null, {
    allowUnauthorized: true,
  });
  return data?.user || null;
}

export async function createUser(userData) {
  const data = await apiRequest("/users", "POST", userData);
  return data.user;
}

export async function loginUser(email, password) {
  const data = await apiRequest("/users/login", "POST", { email, password });
  return data.user;
}

export async function logoutUser() {
  await apiRequest("/users/logout", "POST", null);
}

export async function updateUser(userId, userData) {
  const data = await apiRequest(`/users/${userId}`, "PUT", userData);
  return data.user;
}

export async function deleteUser(userId) {
  return apiRequest(`/users/${userId}`, "DELETE", null);
}

export async function fetchBoards() {
  const data = await apiRequest("/boards", "GET", null);
  return data.boards;
}

export async function createBoard(boardData) {
  const data = await apiRequest("/boards", "POST", boardData);
  return data.board;
}

export async function deleteBoard(boardId) {
  await apiRequest(`/boards/${boardId}`, "DELETE", null);
}

export async function fetchBoard(boardId) {
  const data = await apiRequest(`/boards/${boardId}`, "GET", null);
  return data.board;
}

export async function fetchBoardColumns(boardId) {
  const data = await apiRequest(`/boards/${boardId}/columns`, "GET", null);
  return data.columns;
}

export async function fetchBoardTasks(boardId) {
  const data = await apiRequest(`/boards/${boardId}/tasks`, "GET", null);
  return data.tasks;
}

export async function createTask(boardId, taskData) {
  const data = await apiRequest(`/boards/${boardId}/tasks`, "POST", taskData);
  return data.task;
}

export async function createBoardInvite(boardId, role) {
  const data = await apiRequest(`/boards/${boardId}/invites`, "POST", { role });
  return data.invite;
}

export async function acceptBoardInvite(token) {
  const data = await apiRequest(`/boards/invites/${token}/accept`, "POST", null);
  return data.board;
}

export async function updateTask(taskId, taskData) {
  const data = await apiRequest(`/tasks/${taskId}`, "PUT", taskData);
  return data.task;
}

export async function deleteTask(taskId) {
  await apiRequest(`/tasks/${taskId}`, "DELETE", null);
}
