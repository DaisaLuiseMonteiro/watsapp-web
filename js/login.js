import { router } from "./route";

export function renderLogin() {
    const element = document.createElement("div");
    element.innerHTML = `
        <div class="flex flex-col items-center justify-center h-screen bg-gray-100 overflow-hidden">
            <div class="bg-white p-6 rounded-lg w-full max-w-sm text-center shadow-lg relative">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp Logo" class="w-16 mx-auto mb-4">
                <h2 id="formTitle" class="text-xl font-semibold mb-2">Connexion à WhatsApp</h2>
                <p id="formDescription" class="text-gray-600 text-sm mb-4">Entrez votre numéro de téléphone</p>

                <form id="loginForm" class="space-y-4">
                    <label for="phone" class="block text-left text-gray-700 font-medium">Numéro de téléphone :</label>
                    <input type="tel" id="phone" placeholder="775312571" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                    <button type="submit" id="submitButton" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">Se connecter</button>
                </form>

                <a href="#" id="registerLink" class="text-blue-500 text-sm mt-4 block">Créer un compte</a>

                <!-- Pop-up de message -->
                <div id="popupMessage" class="absolute left-0 right-0 mx-auto mt-2 px-4 py-2 rounded-lg shadow-lg opacity-0 transition-opacity duration-500 hidden max-w-sm w-full text-white text-sm font-medium text-center">
                    <span id="popupText"></span>
                </div>
            </div>
        </div>
    `;

    element.querySelector("#loginForm").addEventListener("submit", handleLogin);
    element.querySelector("#registerLink").addEventListener("click", (event) => {
        event.preventDefault();
        router("/register");
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

async function handleLogin(event) {
    event.preventDefault();
    let phoneNumber = document.getElementById("phone").value.trim();

    if (!/^\+?[0-9\s]+$/.test(phoneNumber)) {
        showMessage("Le numéro ne doit contenir que des chiffres ou commencer par '+'.", "error");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/users?phone=${phoneNumber}`);
        const users = await response.json();

        if (users.length > 0) {
            document.getElementById("formTitle").textContent = "Vérification du code";
            document.getElementById("formDescription").textContent = "Entrez le code de vérification reçu.";
            document.getElementById("loginForm").innerHTML = `
                <label for="code" class="block text-left text-gray-700 font-medium">Code de vérification :</label>
                <input type="text" id="code" placeholder="266666" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                <button type="submit" id="verifyButton" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">Valider</button>
            `;
            document.getElementById("loginForm").addEventListener("submit", handleVerify);
        } else {
            showMessage("Numéro introuvable. Veuillez vous inscrire.", "error");
        }
    } catch (error) {
        console.error("Erreur de connexion :", error);
        showMessage("Erreur serveur.", "error");
    }
}
function handleVerify(event) {
    event.preventDefault();
    const code = document.getElementById("code").value.trim();

    if (code === "266666") {
        showMessage("Code correct ! Connexion réussie.", "success");
        setTimeout(() => router("/home"));
    } else {
        showMessage("Code incorrect. Veuillez réessayer.", "error");
    }
}
