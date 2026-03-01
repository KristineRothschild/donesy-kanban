import { loginUser } from "../services/apiClient.mjs";
import { getUser, setUser, clearUser, isLoggedIn } from "../models/userModel.mjs";
import { registerView, navigateTo, onNavigate } from "../services/router.mjs";

const loginView = document.getElementById("login-view");
const accountView = document.getElementById("account-view");

registerView("login", loginView);
registerView("account", accountView);

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const showRegisterLink = document.getElementById("show-register");

const displayName = document.getElementById("display-name");
const displayEmail = document.getElementById("display-email");
const logoutBtn = document.getElementById("logout-btn");
const editSection = document.getElementById("edit-section");
const deleteSection = document.getElementById("delete-section");

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
  displayName.textContent = user.name || "Not set";
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

function goToAccount(user) {
  setUser(user);
  showUserInfo(user);
  navigateTo("account");
}

function handleUserCreated(event) {
  goToAccount(event.detail.user);
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const user = await loginUser(email, password);
    showMessage(loginMessage, "Login successful!", "success");

    setTimeout(function () {
      goToAccount(user);
    }, 1000);
  } catch (error) {
    showMessage(loginMessage, error.message, "error");
  }
}

function handleLogout() {
  clearUser();
  loginForm.reset();
  hideMessage(loginMessage);
  showLoginSection();
  navigateTo("login");
}

function handleUserUpdated(event) {
  const updatedUser = event.detail.user;
  setUser(updatedUser);
  showUserInfo(updatedUser);
}

function handleUserDeleted() {
  clearUser();
  alert("Your account has been deleted. Thank you for using Donesy Kanban.");
  navigateTo("login");
}

function handleNavigation(viewName) {
  if (viewName === "account" && !isLoggedIn()) {
    navigateTo("login");
    return;
  }

  if (viewName === "account" && isLoggedIn()) {
    showUserInfo(getUser());
  }
}

function init() {
  showRegisterLink.addEventListener("click", handleShowRegister);
  registerSection.addEventListener("show-login", handleShowLogin);
  registerSection.addEventListener("user-created", handleUserCreated);
  loginForm.addEventListener("submit", handleLogin);

  logoutBtn.addEventListener("click", handleLogout);
  editSection.addEventListener("user-updated", handleUserUpdated);
  deleteSection.addEventListener("user-deleted", handleUserDeleted);

  if (isLoggedIn()) {
    navigateTo("account");
  } else {
    navigateTo("login");
  }

  onNavigate(handleNavigation);
}

init();
