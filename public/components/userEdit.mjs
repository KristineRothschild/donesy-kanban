import { updateUser } from "../apiClient.mjs";

class UserEdit extends HTMLElement {
  connectedCallback() {
    this.isEditing = false;
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <div id="edit-view">
        <button id="edit-btn" class="auth-btn edit-btn">Edit</button>
      </div>
      <div id="edit-form-view" class="hidden">
        <form id="edit-form">
          <div class="input-group">
            <input type="text" id="edit-name" name="name" placeholder="New name" required />
          </div>
          <div class="edit-buttons">
            <button type="submit" class="auth-btn small-btn">Save</button>
            <button type="button" id="cancel-btn" class="auth-btn small-btn cancel-btn">Cancel</button>
          </div>
        </form>
        <div id="edit-message" class="message"></div>
      </div>
    `;
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
      this.showMessage("No user selected", "error");
      return;
    }

    try {
      const user = await updateUser(userId, { name: name });

      this.showMessage("Name updated!", "success");
      this.querySelector("#edit-form").reset();

      setTimeout(() => {
        this.hideEditForm();
        this.hideMessage();
      }, 1000);

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
