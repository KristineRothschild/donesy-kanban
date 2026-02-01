import { createUser, loginUser, deleteUser } from "./apiHandler.mjs";

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const userSection = document.getElementById("user-section");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");

const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");

const logoutBtn = document.getElementById("logout-btn");
const deleteBtn = document.getElementById("delete-account-btn");

const displayEmail = document.getElementById("display-email");
const displayCreated = document.getElementById("display-created");

const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerConfirmPassword = document.getElementById("register-confirm-password");
const acceptTosCheckbox = document.getElementById("accept-tos");
const acceptPrivacyCheckbox = document.getElementById("accept-privacy");

let currentUser = null;

function saveRegisterFormData() {
  const formData = {
    email: registerEmail.value,
    password: registerPassword.value,
    confirmPassword: registerConfirmPassword.value,
    acceptTos: acceptTosCheckbox.checked,
    acceptPrivacy: acceptPrivacyCheckbox.checked,
  };
  sessionStorage.setItem("registerFormData", JSON.stringify(formData));
}

function loadRegisterFormData() {
  const savedData = sessionStorage.getItem("registerFormData");
  if (savedData) {
    const formData = JSON.parse(savedData);
    registerEmail.value = formData.email || "";
    registerPassword.value = formData.password || "";
    registerConfirmPassword.value = formData.confirmPassword || "";
    acceptTosCheckbox.checked = formData.acceptTos || false;
    acceptPrivacyCheckbox.checked = formData.acceptPrivacy || false;
    return true;
  }
  return false;
}

function clearRegisterFormData() {
  sessionStorage.removeItem("registerFormData");
}

registerEmail.addEventListener("input", saveRegisterFormData);
registerPassword.addEventListener("input", saveRegisterFormData);
registerConfirmPassword.addEventListener("input", saveRegisterFormData);
acceptTosCheckbox.addEventListener("change", saveRegisterFormData);
acceptPrivacyCheckbox.addEventListener("change", saveRegisterFormData);

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

showLoginLink.addEventListener("click", function (event) {
  event.preventDefault();
  showSection(loginSection);
  hideMessage(registerMessage);
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

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = registerEmail.value;
  const password = registerPassword.value;
  const confirmPassword = registerConfirmPassword.value;
  const acceptTos = acceptTosCheckbox.checked;
  const acceptPrivacy = acceptPrivacyCheckbox.checked;

  if (password !== confirmPassword) {
    showMessage(registerMessage, "Passwords do not match", "error");
    return;
  }

  if (!acceptTos || !acceptPrivacy) {
    showMessage(registerMessage, "You must accept the Terms of Service and Privacy Policy", "error");
    return;
  }

  try {
    const user = await createUser({
      email: email,
      password: password,
      acceptedTos: acceptTos,
      acceptedPrivacy: acceptPrivacy,
    });

    showMessage(registerMessage, "Account created!", "success");
    clearRegisterFormData();

    setTimeout(function () {
      showUserSection(user);
      registerForm.reset();
      hideMessage(registerMessage);
    }, 1000);
  } catch (error) {
    showMessage(registerMessage, error.message, "error");
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

const hasFormData = loadRegisterFormData();
if (hasFormData) {
  showSection(registerSection);
}
