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

    // Vérifiez si le numéro est valide
    if (!/^\+?\d+$/.test(phoneNumber)) {
        showMessage("Numéro invalide. Seuls les chiffres sont autorisés, avec ou sans '+'.", "error");
        return;
    }

    try {
        // Vérifiez si le numéro existe déjà dans /contacts
        const response = await fetch("https://json-server-vpom.onrender.com/contacts");
        const contacts = await response.json();
        const contactExists = contacts.some(contact => contact.phone === phoneNumber);

        if (contactExists) {
            showMessage("Ce numéro est déjà utilisé.", "error");
            return;
        }

        // Enregistrez le nouveau contact dans /contacts
        const newContact = { name, phone: phoneNumber };
        await fetch("https://json-server-vpom.onrender.com/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newContact)
        });

        // Stockez les informations de l'utilisateur connecté
        localStorage.setItem("currentUser", JSON.stringify(newContact));

        // Affichez un message de succès et redirigez vers la page de connexion
        showMessage("Inscription réussie !", "success");
        setTimeout(() => router("/login"), 2000);
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        showMessage("Erreur serveur.", "error");
    }
}

async function loadContacts(query = "") {
    try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const contactsResponse = await fetch("https://json-server-vpom.onrender.com/contacts");
        const messagesResponse = await fetch("https://json-server-vpom.onrender.com/messages");
        const contacts = await contactsResponse.json();
        const messages = await messagesResponse.json();

        const contactsList = document.getElementById("contactsList");
        contactsList.innerHTML = ""; // Vider la liste des contacts

        // Filtrer les contacts en fonction de la recherche et exclure l'utilisateur connecté
        const filteredContacts = contacts.filter(contact =>
            contact.phone !== currentUser.phone &&
            (contact.name.toLowerCase().includes(query) || contact.phone.includes(query))
        );

        // Trier et afficher les contacts
        const sortedContacts = filteredContacts
            .map(contact => {
                const msgs = messages.filter(msg => msg.senderId === contact.phone || msg.receiverId === contact.phone);
                const lastMessage = msgs[msgs.length - 1];
                return {
                    contact,
                    lastMessage,
                    lastTimestamp: lastMessage ? lastMessage.timestamp : 0
                };
            })
            .sort((a, b) => b.lastTimestamp - a.lastTimestamp);

        sortedContacts.forEach(({ contact, lastMessage }) => {
            const lastMessageText = lastMessage ? lastMessage.content : "Aucun message";
            const lastTime = lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

            const li = document.createElement("li");
            li.className = "flex items-center justify-between space-x-2 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";

            li.innerHTML = `
                <img src="${contact.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
                <div class="flex-1 min-w-0 ml-3">
                    <div class="flex justify-between items-center">
                        <p class="font-semibold text-gray-900 truncate">${contact.name}</p>
                        <span class="text-xs text-gray-400">${lastTime}</span>
                    </div>
                    <p class="text-sm text-gray-500 truncate">${lastMessageText}</p>
                </div>
            `;

            li.addEventListener("click", () => openChat(contact));
            contactsList.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur chargement contacts :", error);
    }
}

export async function renderHome() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const element = document.createElement("div");
    element.innerHTML = `
        <div id="message" class="flex w-screen h-screen overflow-hidden">
            <div id="partie1" class="bg-gray-50 h-full w-[5%] flex flex-col justify-between items-center py-4">
                <div class="flex flex-col items-center space-y-6">
                    <button title="Discussions" class="text-gray-600 hover:text-green-500 text-xl"><i class="fas fa-comments"></i></button>
                    <button title="Actus" class="text-gray-600 hover:text-green-500 text-xl"><i class="fas fa-newspaper"></i></button>
                    <button title="Communautés" class="text-gray-600 hover:text-green-500 text-xl"><i class="fas fa-users"></i></button>
                    <button title="Appels" class="text-gray-600 hover:text-green-500 text-xl"><i class="fas fa-phone"></i></button>
                </div>
                <div class="flex flex-col items-center space-y-6">
                    <button title="Paramètres" class="text-gray-600 hover:text-green-500 text-xl">
                        <i class="fas fa-cog"></i>
                    </button>
                    <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold uppercase" title="Mon profil">
                        <img src="${currentUser.avatar || 'https://via.placeholder.com/50'}" alt="Profil" class="w-full h-full rounded-full object-cover">
                    </div>
                    <p class="text-sm text-gray-600 font-medium">Vous</p>
                </div>
            </div>
            <!-- PARTIE 2 -->
            <div id="partie2" class="bg-white border-r border-gray-200 flex flex-col h-full w-[30%]">
                <!-- En-tête -->
                <div id="entete" class="p-4 pb-2 flex flex-col bg-white">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold text-gray-800">WhatsApp</h2>
                        <div class="flex items-center space-x-3">
                            <button id="newDiscussionBtn" title="Nouvelle discussion" class="text-gray-600 hover:text-green-500 text-lg">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button id="logoutBtn" title="Déconnexion" class="text-gray-600 hover:text-red-500 text-lg">
                                <i class="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>
                    <input id="searchInput" type="text" placeholder="Rechercher un contact"
                        class="mt-1 w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
                </div>
                <!-- Liste des contacts -->
                <ul id="contactsList" class="overflow-y-auto flex-1 p-0 pr-1"
                    style="scrollbar-width: thin; scrollbar-color: #f3f4f6 transparent;"></ul>
            </div>
        </div>
    `;

    // Charger les contacts au démarrage
    loadContacts();

    return element;
}
