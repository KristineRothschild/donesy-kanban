const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "/";
}

const displayName = document.getElementById("display-name");
const displayEmail = document.getElementById("display-email");
const displayCreated = document.getElementById("display-created");
const logoutBtn = document.getElementById("logout-btn");
const editSection = document.getElementById("edit-section");
const deleteSection = document.getElementById("delete-section");

function showUserInfo(user) {
  displayName.textContent = user.name || "Not set";
  displayEmail.textContent = user.email;
  displayCreated.textContent = new Date(user.createdAt).toLocaleDateString("en-US");

  editSection.setAttribute("user-id", user.id);
  deleteSection.setAttribute("user-id", user.id);
}

showUserInfo(currentUser);

logoutBtn.addEventListener("click", function () {
  sessionStorage.removeItem("currentUser");
  window.location.href = "/";
});

editSection.addEventListener("user-updated", function (event) {
  const updatedUser = event.detail.user;
  sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
  showUserInfo(updatedUser);
});

deleteSection.addEventListener("user-deleted", function () {
  sessionStorage.removeItem("currentUser");
  alert("Your account has been deleted. Thank you for using Donesy Kanban.");
  window.location.href = "/";
});
