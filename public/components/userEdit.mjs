import { updateUser } from "../services/apiClient.mjs";
import { ready, t, translatePage } from "../services/i18n.mjs";

class UserEdit extends HTMLElement {
  async connectedCallback() {
    this.isEditing = false;
    await ready;
    await this.render();
    translatePage(this);
    this.setupEventListeners();
  }

  async render() {
    const response = await fetch("/templates/userEdit.html");
    this.innerHTML = await response.text();
  }

  setupEventListeners() {
    const editBtn = this.querySelector("#edit-btn");
    const cancelBtn = this.querySelector("#cancel-btn");
    const form = this.querySelector("#edit-form");

    editBtn.addEventListener("click", () => this.showEditForm());
    cancelBtn.addEventListener("click", () => this.hideEditForm());
    form.addEventListener("submit", (event) => this.handleSubmit(event));
  }

  showEditForm() {
    this.querySelector("#edit-view").classList.add("hidden");
    this.querySelector("#edit-form-view").classList.remove("hidden");
  }

  hideEditForm() {
    this.querySelector("#edit-view").classList.remove("hidden");
    this.querySelector("#edit-form-view").classList.add("hidden");
    this.querySelector("#edit-form").reset();
  }

  async handleSubmit(event) {
    event.preventDefault();

    const userId = this.getAttribute("user-id");
    const name = this.querySelector("#edit-name").value;

    if (!userId) {
      this.showMessage(t("edit.no_user"), "error");
      return;
    }

    try {
      const user = await updateUser(userId, { name: name });
      this.querySelector("#edit-form").reset();
      this.hideEditForm();
      this.hideMessage();

      this.dispatchEvent(new CustomEvent("user-updated", {
        detail: { user: user },
        bubbles: true,
      }));
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  showMessage(text, type) {
    const messageEl = this.querySelector("#edit-message");
    messageEl.textContent = text;
    messageEl.className = "message " + type;
  }

  hideMessage() {
    const messageEl = this.querySelector("#edit-message");
    messageEl.className = "message";
    messageEl.textContent = "";
  }
}

customElements.define("user-edit", UserEdit);
