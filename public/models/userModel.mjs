let currentUser = null;

export function getUser() {
  return currentUser;
}

export function setUser(user) {
  currentUser = user;
}

export function clearUser() {
  currentUser = null;
}
