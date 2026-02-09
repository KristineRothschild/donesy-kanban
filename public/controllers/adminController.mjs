import { getUser, setUser, clearUser, isLoggedIn } from "../models/userModel.mjs";

const displayName = document.getElementById("display-name");
const displayEmail = document.getElementById("display-email");
const logoutBtn = document.getElementById("logout-btn");
const editSection = document.getElementById("edit-section");
const deleteSection = document.getElementById("delete-section");

function showUserInfo(user) {
  displayName.textContent = user.name || "Not set";
  displayEmail.textContent = user.email;

  editSection.setAttribute("user-id", user.id);
  deleteSection.setAttribute("user-id", user.id);
}

function handleLogout() {
  clearUser();
  window.location.href = "/";
}

function handleUserUpdated(event) {
  const updatedUser = event.detail.user;
  setUser(updatedUser);
  showUserInfo(updatedUser);
}

function handleUserDeleted() {
  clearUser();
  alert("Your account has been deleted. Thank you for using Donesy Kanban.");
  window.location.href = "/";
}

function init() {
  if (!isLoggedIn()) {
    window.location.href = "/";
    return;
  }

  const user = getUser();
  showUserInfo(user);

  logoutBtn.addEventListener("click", handleLogout);
  editSection.addEventListener("user-updated", handleUserUpdated);
  deleteSection.addEventListener("user-deleted", handleUserDeleted);
}

init();
