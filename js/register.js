import { router } from "./route";

export function renderRegister() {
    const element = document.createElement("div");
    element.innerHTML = `
        <div class="flex flex-col items-center justify-center h-screen bg-gray-100 overflow-hidden relative">
            <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center relative">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp Logo" class="w-16 mx-auto mb-4">
                <h2 class="text-xl font-semibold mb-2 text-green-600">Créer un compte WhatsApp</h2>
                <p class="text-gray-600 text-sm mb-4">Entrez votre nom et votre numéro de téléphone pour vous inscrire.</p>

                <form id="registerForm" class="space-y-4">
                    <label for="name" class="block text-left text-gray-700 font-medium">Nom :</label>
                    <input type="text" id="name" placeholder="Votre nom" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>

                    <label for="phone" class="block text-left text-gray-700 font-medium">Numéro de téléphone :</label>
                    <input type="tel" id="phone" placeholder="+221771234567" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>

                    <button type="submit" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">S'inscrire</button>
                </form>

                <a href="#" id="loginLink" class="text-blue-500 text-sm mt-4 block hover:underline">Retour à la connexion</a>

                <!-- Pop-up de message -->
                <div id="popupMessage" class="absolute left-0 right-0 mx-auto mt-2 px-4 py-2 rounded-lg shadow-lg opacity-0 transition-opacity duration-500 hidden max-w-sm w-full text-white text-sm font-medium text-center">
                    <span id="popupText"></span>
                </div>
            </div>
        </div>
    `;

    element.querySelector("#registerForm").addEventListener("submit", handleRegister);
    element.querySelector("#loginLink").addEventListener("click", (event) => {
        event.preventDefault();
        router("/login");
    });

    return element;
}

function showMessage(message, type = "error") {
    const popup = document.getElementById("popupMessage");
    const text = document.getElementById("popupText");

    text.textContent = message;

    popup.classList.remove("bg-red-500", "bg-green-500", "hidden", "opacity-0");
    popup.classList.add(type === "success" ? "bg-green-500" : "bg-red-500", "opacity-100");

    setTimeout(() => {
        popup.classList.remove("opacity-100");
        popup.classList.add("opacity-0");
        setTimeout(() => popup.classList.add("hidden"), 500);
    }, 3000);
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phoneNumber = document.getElementById("phone").value.trim();

    if (!/^\+?\d+$/.test(phoneNumber)) {
        showMessage("Numéro invalide. Seuls les chiffres sont autorisés, avec ou sans '+'.", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/users");
        const users = await response.json();
        const userExists = users.some(u => u.phone === phoneNumber);

        if (userExists) {
            showMessage("Ce numéro est déjà utilisé.", "error");
            return;
        }

        await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone: phoneNumber })
        });

        showMessage("Inscription réussie !", "success");
        setTimeout(() => router("/login"), 2000);
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        showMessage("Erreur serveur.", "error");
    }
}
