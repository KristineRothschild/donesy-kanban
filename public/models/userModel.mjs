const listeners = [];
let currentUser = null;

function loadFromStorage() {
  const saved = sessionStorage.getItem("currentUser");
  if (saved) {
    currentUser = JSON.parse(saved);
  }
}

function saveToStorage() {
  if (currentUser) {
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
  } else {
    sessionStorage.removeItem("currentUser");
  }
}

function notifyListeners() {
  for (let i = 0; i < listeners.length; i++) {
    listeners[i](currentUser);
  }
}

export function subscribe(callback) {
  listeners.push(callback);
}

export function getUser() {
  return currentUser;
}

export function setUser(user) {
  currentUser = user;
  saveToStorage();
  notifyListeners();
}

export function clearUser() {
  currentUser = null;
  saveToStorage();
  notifyListeners();
}

export function isLoggedIn() {
  return currentUser !== null;
}

loadFromStorage();
