export async function createUser(userData) {
  const response = await fetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not create user");
  }

  return data.user;
}

export async function loginUser(email, password) {
  const response = await fetch("/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not login");
  }

  return data.user;
}

export async function deleteUser(userId) {
  const response = await fetch("/users/" + userId, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Could not delete user");
  }

  return true;
}
