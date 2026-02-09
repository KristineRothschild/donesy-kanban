import { loginUser } from "./services/apiClient.mjs";

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const showRegisterLink = document.getElementById("show-register");

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
  sectionToShow.classList.remove("hidden");
}

function goToAdmin(user) {
  sessionStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "/admin.html";
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
  goToAdmin(event.detail.user);
});

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const user = await loginUser(email, password);
    showMessage(loginMessage, "Login successful!", "success");

    setTimeout(function () {
      goToAdmin(user);
    }, 1000);
  } catch (error) {
    showMessage(loginMessage, error.message, "error");
  }
});
