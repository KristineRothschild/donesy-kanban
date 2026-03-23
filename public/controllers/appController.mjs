import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
} from "../services/apiClient.mjs";
import { getUser, setUser, clearUser } from "../models/userModel.mjs";
import { registerView, navigateTo, onNavigate } from "../services/router.mjs";
import { ready, t, translatePage } from "../services/i18n.mjs";

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

function setAuthenticatedUser(user) {
  setUser(user);
  showUserInfo(user);
}

function goToAccount(user) {
  hideMessage(loginMessage);
  setAuthenticatedUser(user);
  navigateTo("account");
}

function goToLogin({ resetForm = false } = {}) {
  clearUser();
  hideMessage(loginMessage);
  showLoginSection();
  if (resetForm) {
    loginForm.reset();
  }
  navigateTo("login");
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
    goToAccount(user);
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

function handleNavigation(viewName) {
  const currentUser = getUser();

  if (viewName === "account" && !currentUser) {
    navigateTo("login");
    return;
  }

  if (viewName === "login" && currentUser) {
    navigateTo("account");
    return;
  }

  if (viewName === "account") {
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

  logoutBtn.addEventListener("click", handleLogout);
  editSection.addEventListener("user-updated", handleUserUpdated);
  deleteSection.addEventListener("user-deleted", handleUserDeleted);

  try {
    const user = await fetchCurrentUser();
    if (user) {
      goToAccount(user);
    } else {
      goToLogin();
    }
  } catch (error) {
    goToLogin();
  }

  onNavigate(handleNavigation);
}

init();
