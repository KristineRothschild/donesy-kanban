import { deleteUser } from "../services/apiClient.mjs";
import { ready, t, translatePage } from "../services/i18n.mjs";

class UserDelete extends HTMLElement {
  async connectedCallback() {
    await ready;
    await this.render();
    translatePage(this);
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
      this.showMessage(t("delete.no_user"), "error");
      return;
    }

    const confirmed = confirm(t("delete.confirm"));

    if (!confirmed) {
      return;
    }

    try {
      await deleteUser(userId);

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
