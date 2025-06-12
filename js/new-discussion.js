import { router } from "./route";
import { loadMessages } from "./home"; // Importez la fonction de chargement des messages depuis home.js

export function renderNewDiscussion() {
    const newDiscussionElement = document.createElement("div");
    newDiscussionElement.innerHTML = `
        <!-- PARTIE 2 (nouvelle discussion) -->
        <div id="newDiscussionPage" class="bg-white border-r border-gray-200 flex flex-col h-full w-full">
            <div id="entete" class="p-4 pb-2 flex flex-col bg-white">
                <div class="flex items-center space-x-3">
                    <button id="backToHomeBtn" class="text-gray-600 hover:text-green-500 text-lg">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2 class="text-xl font-semibold text-gray-800">Nouvelle discussion</h2>
                </div>
                <input type="text" id="searchInput" placeholder="Rechercher un nom ou un numéro"
                    class="mt-2 w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
            </div>
            <div class="px-4 py-2 border-b border-gray-200 flex flex-col space-y-2">
                <button id="newGroupBtn" class="text-sm text-gray-700 px-3 py-2 rounded-full bg-gray-100 hover:bg-green-100 w-full text-left">
                    <i class="fas fa-users mr-2"></i> Nouveau groupe
                </button>
                <button id="newContactBtn" class="text-sm text-gray-700 px-3 py-2 rounded-full bg-gray-100 hover:bg-green-100 w-full text-left">
                    <i class="fas fa-user-plus mr-2"></i> Nouveau contact
                </button>
            </div>
            <ul id="contactsList" class="overflow-y-auto flex-1 p-2"
                style="scrollbar-width: thin; scrollbar-color: #f3f4f6 transparent; max-height: calc(100vh - 200px);"></ul>
        </div>
    `;

    loadContacts();

    // Gestion de la recherche
    const searchInput = newDiscussionElement.querySelector("#searchInput");
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length >= 2) {
            filterContacts(query);
        } else {
            loadContacts(); // Recharge tous les contacts si la recherche est vide ou trop courte
        }
    });

    // Gestion du retour à la page home.js
    newDiscussionElement.querySelector("#backToHomeBtn").addEventListener("click", () => {
        router("/home"); // Retourne à la page home.js
    });

    newDiscussionElement.querySelector("#newGroupBtn").addEventListener("click", () => {
        router("/new-groupe");
    });

    newDiscussionElement.querySelector("#newContactBtn").addEventListener("click", () => {
        router("/new-contact");
    });

    return newDiscussionElement;
}

// Chargement des contacts
async function loadContacts() {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/users");
        const users = await response.json();
        const contactsList = document.getElementById("contactsList");

        contactsList.innerHTML = "";
        users.forEach(user => {
            const li = document.createElement("li");
            li.className = "flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer";
            li.innerHTML = `
                <img src="${user.avatar || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">${user.name}</p>
                    <p class="text-sm text-gray-500">${user.status || 'Salut ! J\'utilise WhatsApp.'}</p>
                </div>
            `;

            // Ajoutez un gestionnaire d'événements pour afficher les messages dans la partie 3
            li.addEventListener("click", () => {
                const header = document.getElementById("chatHeader");
                const messagesDiv = document.getElementById("messages");
                const messageInputArea = document.getElementById("messageInputArea");

                // Affichez la partie 3
                header.classList.remove("hidden");
                messageInputArea.classList.remove("hidden");

                // Mettez à jour l'en-tête de la partie 3 avec les informations du contact
                header.innerHTML = `
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center space-x-3">
                            <img src="${user.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <p class="font-semibold text-gray-900">${user.name}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4 text-gray-600">
                            <i class="fas fa-search cursor-pointer"></i>
                            <i class="fas fa-ellipsis-v cursor-pointer"></i>
                        </div>
                    </div>
                `;

                // Chargez les messages du contact dans la partie 3
                messagesDiv.innerHTML = ""; // Videz les messages existants
                loadMessages(user.id); // Chargez les messages du contact
            });

            contactsList.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur chargement contacts :", error);
    }
}

// Filtrer les contacts en fonction de la recherche
async function filterContacts(query) {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/users");
        const users = await response.json();
        const filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(query) || user.phone?.toLowerCase().includes(query)
        );

        const contactsList = document.getElementById("contactsList");
        contactsList.innerHTML = "";
        filteredUsers.forEach(user => {
            const li = document.createElement("li");
            li.className = "flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer";
            li.innerHTML = `
                <img src="${user.avatar || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">${user.name}</p>
                    <p class="text-sm text-gray-500">${user.status || 'Salut ! J\'utilise WhatsApp.'}</p>
                </div>
            `;
            contactsList.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur filtrage contacts :", error);
    }
}
