import { createUser } from "../apiClient.mjs";

class UserCreate extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <div class="auth-card">
        <h2>REGISTER</h2>

        <form id="register-form">
          <div class="input-group">
            <input type="email" id="register-email" name="email" required placeholder="E-mail" />
          </div>

          <div class="input-group">
            <input type="password" id="register-password" name="password" required placeholder="Password" />
          </div>

          <div class="input-group">
            <input type="password" id="register-confirm-password" name="confirmPassword" required placeholder="Confirm Password" />
          </div>

          <div class="consent-section">
            <div class="checkbox-group">
              <input type="checkbox" id="accept-tos" name="acceptTos" required />
              <label for="accept-tos">
                I accept the <a href="terms-of-service.html" target="_blank">Terms of Service</a>
              </label>
            </div>

            <div class="checkbox-group">
              <input type="checkbox" id="accept-privacy" name="acceptPrivacy" required />
              <label for="accept-privacy">
                I accept the <a href="privacy-policy.html" target="_blank">Privacy Policy</a>
              </label>
            </div>
          </div>

          <button type="submit" class="auth-btn">CREATE ACCOUNT</button>
        </form>

        <div id="register-message" class="message"></div>

        <p class="switch-text">
          Already have an account?
          <a href="#" id="show-login">Login here</a>
        </p>
      </div>
    `;
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
