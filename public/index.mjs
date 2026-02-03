import { loginUser, deleteUser } from "./apiClient.mjs";

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const userSection = document.getElementById("user-section");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const showRegisterLink = document.getElementById("show-register");

const logoutBtn = document.getElementById("logout-btn");
const deleteBtn = document.getElementById("delete-account-btn");

const displayEmail = document.getElementById("display-email");
const displayCreated = document.getElementById("display-created");

let currentUser = null;

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message " + type;
}

function hideMessage(element) {
  element.className = "message";
  element.textContent = "";
}

function showSection(sectionToShow) {
  loginSection.classList.add("hidden");
  registerSection.classList.add("hidden");
  userSection.classList.add("hidden");
  sectionToShow.classList.remove("hidden");
}

function showUserSection(user) {
  showSection(userSection);
  displayEmail.textContent = user.email;
  displayCreated.textContent = new Date(user.createdAt).toLocaleDateString("en-US");
  currentUser = user;
}

showRegisterLink.addEventListener("click", function (event) {
  event.preventDefault();
  showSection(registerSection);
  hideMessage(loginMessage);
});

registerSection.addEventListener("show-login", function () {
  showSection(loginSection);
});

registerSection.addEventListener("user-created", function (event) {
  showUserSection(event.detail.user);
});

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const user = await loginUser(email, password);
    showMessage(loginMessage, "Login successful!", "success");

    setTimeout(function () {
      showUserSection(user);
      loginForm.reset();
      hideMessage(loginMessage);
    }, 1000);
  } catch (error) {
    showMessage(loginMessage, error.message, "error");
  }
});

logoutBtn.addEventListener("click", function () {
  currentUser = null;
  showSection(loginSection);
});

deleteBtn.addEventListener("click", async function () {
  const confirmed = confirm(
    "Are you sure you want to delete your account?\n\nThis cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteUser(currentUser.id);
    alert("Your account has been deleted. Thank you for using Donesy Kanban.");
    currentUser = null;
    showSection(loginSection);
  } catch (error) {
    alert("Error deleting account: " + error.message);
  }
});

