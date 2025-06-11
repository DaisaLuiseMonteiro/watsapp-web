window.auth = {
  currentUser: null,

  init() {
    const savedUser = localStorage.getItem("whatsapp_user");
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      window.api.updateUserStatus(this.currentUser.id, true);
      window.app.renderMainApp(); // Rediriger directement si l'utilisateur est connecté
    } else {
      this.renderLoginScreen();
    }
  },

  renderLoginScreen() {
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = ""; // Effacer l'écran actuel
    appContainer.appendChild(this.createLoginScreen());
  },

  createLoginScreen() {
    const loginScreen = document.createElement("div");
    loginScreen.className = "min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4";

    const loginCard = document.createElement("div");
    loginCard.className = "bg-white rounded-lg shadow-xl p-8 w-full max-w-md";

    const header = document.createElement("h1");
    header.className = "text-2xl font-bold text-center mb-6 text-gray-800";
    header.textContent = "Connectez-vous avec votre numéro de téléphone";

    const form = document.createElement("form");
    form.onsubmit = async (e) => {
      e.preventDefault();
      await this.handleLogin();
    };

    const phoneInput = document.createElement("input");
    phoneInput.id = "phone";
    phoneInput.type = "tel";
    phoneInput.placeholder = "Entrez votre numéro";
    phoneInput.className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition";
    submitButton.textContent = "Continuer";

    const signupLink = document.createElement("a");
    signupLink.href = "#";
    signupLink.className = "text-center text-sm text-green-600 hover:text-green-700 block mt-4";
    signupLink.textContent = "Pas encore de compte ? Inscrivez-vous";
    signupLink.onclick = (e) => {
      e.preventDefault();
      this.renderSignupScreen();
    };

    form.appendChild(phoneInput);
    form.appendChild(submitButton);
    form.appendChild(signupLink);

    loginCard.appendChild(header);
    loginCard.appendChild(form);
    loginScreen.appendChild(loginCard);

    return loginScreen;
  },

  renderVerificationScreen(phone) {
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = ""; // Effacer l'écran actuel

    const verificationScreen = document.createElement("div");
    verificationScreen.className = "min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4";

    const verificationCard = document.createElement("div");
    verificationCard.className = "bg-white rounded-lg shadow-xl p-8 w-full max-w-md";

    const header = document.createElement("h1");
    header.className = "text-2xl font-bold text-center mb-6 text-gray-800";
    header.textContent = `Code envoyé au ${phone}`;

    const form = document.createElement("form");
    form.onsubmit = async (e) => {
      e.preventDefault();
      await this.handleVerification(phone);
    };

    const codeInput = document.createElement("input");
    codeInput.id = "verification-code";
    codeInput.type = "text";
    codeInput.placeholder = "Entrez le code reçu";
    codeInput.className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition";
    submitButton.textContent = "Vérifier";

    form.appendChild(codeInput);
    form.appendChild(submitButton);

    verificationCard.appendChild(header);
    verificationCard.appendChild(form);
    verificationScreen.appendChild(verificationCard);

    appContainer.appendChild(verificationScreen);
  },

  renderSignupScreen() {
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = ""; // Effacer l'écran actuel

    const signupScreen = document.createElement("div");
    signupScreen.className = "min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4";

    const signupCard = document.createElement("div");
    signupCard.className = "bg-white rounded-lg shadow-xl p-8 w-full max-w-md";

    const header = document.createElement("h1");
    header.className = "text-2xl font-bold text-center mb-6 text-gray-800";
    header.textContent = "Créer un compte";

    const form = document.createElement("form");
    form.onsubmit = async (e) => {
      e.preventDefault();
      await this.handleProfileSetup();
    };

    const nameInput = document.createElement("input");
    nameInput.id = "full-name";
    nameInput.type = "text";
    nameInput.placeholder = "Entrez votre nom";
    nameInput.className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500";

    const phoneInput = document.createElement("input");
    phoneInput.id = "signup-phone";
    phoneInput.type = "tel";
    phoneInput.placeholder = "Entrez votre numéro";
    phoneInput.className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition";
    submitButton.textContent = "Créer un compte";

    form.appendChild(nameInput);
    form.appendChild(phoneInput);
    form.appendChild(submitButton);

    signupCard.appendChild(header);
    signupCard.appendChild(form);
    signupScreen.appendChild(signupCard);

    appContainer.appendChild(signupScreen);
  },

  async handleLogin() {
    const phoneInput = document.getElementById("phone");
    const phone = phoneInput.value.trim();

    if (phone.length < 8) {
      this.showError("Veuillez entrer un numéro de téléphone valide.");
      return;
    }

    const response = await fetch(`http://localhost:3000/users?phone=${phone}`);
    const users = await response.json();

    if (users.length > 0) {
      this.currentUser = users[0];
      localStorage.setItem("whatsapp_user", JSON.stringify(this.currentUser));
      window.app.renderMainApp();
    } else {
      this.renderVerificationScreen(phone);
    }
  },

  async handleVerification(phone) {
    const codeInput = document.getElementById("verification-code");
    const code = codeInput.value.trim();

    if (code !== "266666") {
      this.showError("Code de vérification incorrect. Utilisez : 266666.");
      return;
    }

    const response = await fetch(`http://localhost:3000/users?phone=${phone}`);
    const users = await response.json();

    if (users.length > 0) {
      this.currentUser = users[0];
      localStorage.setItem("whatsapp_user", JSON.stringify(this.currentUser));
      window.app.renderMainApp();
    } else {
      this.renderSignupScreen();
    }
  },

  async handleProfileSetup() {
    const nameInput = document.getElementById("full-name");
    const phoneInput = document.getElementById("signup-phone");

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || phone.length < 8) {
      this.showError("Veuillez entrer un nom et un numéro de téléphone valide.");
      return;
    }

    const userData = {
      phone: phone,
      name: name,
      status: "Disponible",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=25d366&color=fff`,
      isOnline: true,
      createdAt: Date.now(),
    };

    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const newUser = await response.json();
      this.currentUser = newUser;
      localStorage.setItem("whatsapp_user", JSON.stringify(this.currentUser));
      window.app.renderMainApp();
    } else {
      this.showError("Erreur lors de la création du compte.");
    }
  },

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "text-red-500 text-sm mt-2";
    errorDiv.textContent = message;
    const form = document.querySelector("form:not(.hidden)");
    form.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  window.auth.init();
});
