import { updateUser } from "../apiClient.mjs";

class UserEdit extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <div class="auth-card">
        <h2>EDIT NAME</h2>

        <form id="edit-form">
          <div class="input-group">
            <input type="text" id="edit-name" name="name" placeholder="New name" required />
          </div>

          <button type="submit" class="auth-btn">SAVE CHANGES</button>
        </form>

        <div id="edit-message" class="message"></div>
      </div>
    `;
  }

  setupEventListeners() {
    const form = this.querySelector("#edit-form");
    form.addEventListener("submit", (event) => this.handleSubmit(event));
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
}

customElements.define("user-edit", UserEdit);
