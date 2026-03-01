import { deleteUser } from "../services/apiClient.mjs";

class UserDelete extends HTMLElement {
  async connectedCallback() {
    await this.render();
    this.setupEventListeners();
  }

  async render() {
    const response = await fetch("/templates/userDelete.html");
    this.innerHTML = await response.text();
  }

  setupEventListeners() {
    const deleteBtn = this.querySelector("#delete-btn");
    deleteBtn.addEventListener("click", () => this.handleDelete());
  }

  async handleDelete() {
    const userId = this.getAttribute("user-id");

    if (!userId) {
      this.showMessage("No user selected", "error");
      return;
    }

    const confirmed = confirm("Are you sure you want to delete your account?\n\nThis cannot be undone.");

    if (!confirmed) {
      return;
    }

    try {
      await deleteUser(userId);

      this.showMessage("Account deleted", "success");

      this.dispatchEvent(new CustomEvent("user-deleted", {
        detail: { userId: userId },
        bubbles: true,
      }));
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  showMessage(text, type) {
    const messageEl = this.querySelector("#delete-message");
    messageEl.textContent = text;
    messageEl.className = "message " + type;
  }
}

customElements.define("user-delete", UserDelete);
