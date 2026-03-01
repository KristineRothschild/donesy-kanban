import { createUser } from "../services/apiClient.mjs";

class UserCreate extends HTMLElement {
  async connectedCallback() {
    await this.render();
    this.setupEventListeners();
  }

  async render() {
    const response = await fetch("/templates/userCreate.html");
    this.innerHTML = await response.text();
  }

  setupEventListeners() {
    const form = this.querySelector("#register-form");
    const showLoginLink = this.querySelector("#show-login");

    form.addEventListener("submit", (event) => this.handleSubmit(event));

    showLoginLink.addEventListener("click", (event) => {
      event.preventDefault();
      this.dispatchEvent(new CustomEvent("show-login", { bubbles: true }));
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    const password = this.querySelector("#register-password").value;
    const confirmPassword = this.querySelector("#register-confirm-password").value;

    if (password !== confirmPassword) {
      this.showMessage("Passwords do not match", "error");
      return;
    }

    try {
      const user = await createUser({
        name: this.querySelector("#register-name").value,
        email: this.querySelector("#register-email").value,
        password: password,
        acceptedTos: this.querySelector("#accept-tos").checked,
        acceptedPrivacy: this.querySelector("#accept-privacy").checked,
      });

      this.showMessage("Account created!", "success");
      this.querySelector("#register-form").reset();

      this.dispatchEvent(new CustomEvent("user-created", {
        detail: { user: user },
        bubbles: true,
      }));
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  showMessage(text, type) {
    const messageEl = this.querySelector("#register-message");
    messageEl.textContent = text;
    messageEl.className = "message " + type;
  }
}

customElements.define("user-create", UserCreate);
