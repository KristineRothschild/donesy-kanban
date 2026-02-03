async function apiRequest(url, method, body) {
  const options = {
    method: method,
    headers: {},
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (method === "DELETE" && response.ok) {
    return true;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Request failed");
  }

  return data;
}

export async function createUser(userData) {
  const data = await apiRequest("/users", "POST", userData);
  return data.user;
}

export async function loginUser(email, password) {
  const data = await apiRequest("/users/login", "POST", { email, password });
  return data.user;
}

export async function updateUser(userId, userData) {
  const data = await apiRequest("/users/" + userId, "PUT", userData);
  return data.user;
}

export async function deleteUser(userId) {
  return await apiRequest("/users/" + userId, "DELETE", null);
}
