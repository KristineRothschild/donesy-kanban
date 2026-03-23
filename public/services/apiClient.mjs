async function apiRequest(url, method, body, requestOptions = {}) {
  const { allowUnauthorized = false } = requestOptions;
  const options = {
    method: method,
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
  const data = await apiRequest("/users/" + userId, "PUT", userData);
  return data.user;
}

export async function deleteUser(userId) {
  return apiRequest("/users/" + userId, "DELETE", null);
}
