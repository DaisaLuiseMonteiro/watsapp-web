import { router } from "./route";
import { loadMessages } from "./home";
import { renderNewContact } from "./new-contact";
import { renderNewGroupe } from "./new-groupe"; // ← AJOUT DE CETTE LIGNE

export function renderNewDiscussion() {
    const partie2 = document.getElementById("partie2"); 
    if (!partie2) {
        console.error("Élément 'partie2' introuvable.");
        return;
    }

    partie2.innerHTML = `
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

    const searchInput = partie2.querySelector("#searchInput");
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length >= 2) {
            filterContacts(query);
        } else {
            loadContacts(); 
        }
    });

    partie2.querySelector("#backToHomeBtn").addEventListener("click", () => {
        // Recharger seulement la partie 2 sans toucher à la partie 3
        const partie2 = document.getElementById("partie2");
        if (partie2) {
            // Restaurer le contenu original de la partie 2 (accueil)
            partie2.innerHTML = `
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
                <!-- Boutons de filtrage -->
                <div class="px-4 py-2 border-b border-gray-200 flex space-x-2">
                    <button id="allContactsBtn" class="text-sm text-gray-700 px-3 py-1 rounded-full bg-gray-100 hover:bg-green-100">Toutes</button>
                    <button id="unreadContactsBtn" class="text-sm text-gray-700 px-3 py-1 rounded-full bg-gray-100 hover:bg-green-100">Non lues</button>
                    <button id="favoriteContactsBtn" class="text-sm text-gray-700 px-3 py-1 rounded-full bg-gray-100 hover:bg-green-100">Favoris</button>
                    <button id="groupsBtn" class="text-sm text-gray-700 px-3 py-1 rounded-full bg-gray-100 hover:bg-green-100">Groupes</button>
                </div>
                <!-- Liste des contacts -->
                <ul id="contactsList" class="overflow-y-auto flex-1 p-0 pr-1"
                    style="scrollbar-width: thin; scrollbar-color: #f3f4f6 transparent;"></ul>
            `;
            
            // Recharger les contacts et réattacher les event listeners
            loadContactsForHome();
            attachHomeEventListeners();
        }
    });

    partie2.querySelector("#newGroupBtn").addEventListener("click", () => {
        console.log("Bouton Nouveau groupe cliqué"); // Debug
        renderNewGroupe(); // Maintenant cette fonction est importée
    });

    partie2.querySelector("#newContactBtn").addEventListener("click", () => {
        renderNewContact(); 
    });
}

// Reste du code inchangé...
async function loadContacts() {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/contacts");
        const contacts = await response.json();
        const contactsList = document.getElementById("contactsList");

        contactsList.innerHTML = ""; 

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }

        contacts.forEach(contact => {
            const isCurrentUser = contact.phone === currentUser.phone;

            const li = document.createElement("li");
            li.className = "flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer";
            li.innerHTML = `
                <img src="${contact.avatar || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">
                        ${contact.name} ${isCurrentUser ? '<span class="text-green-500">(vous)</span>' : ''}
                    </p>
                    <p class="text-sm text-gray-500">${contact.status || 'Aucun statut disponible'}</p>
                </div>
            `;

            li.addEventListener("click", () => openChat(contact)); 

            contactsList.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur chargement contacts :", error);
    }
}

async function filterContacts(query) {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/contacts");
        const contacts = await response.json();
        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(query) || contact.phone?.toLowerCase().includes(query)
        );

        const contactsList = document.getElementById("contactsList");
        contactsList.innerHTML = ""; 

        filteredContacts.forEach(contact => {
            const li = document.createElement("li");
            li.className = "flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer";
            li.innerHTML = `
                <img src="${contact.avatar || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">${contact.name}</p>
                    <p class="text-sm text-gray-500">${contact.status || 'Aucun statut disponible'}</p>
                </div>
            `;

            li.addEventListener("click", () => openChat(contact)); 

            contactsList.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur filtrage contacts :", error);
    }
}

async function openChat(contact) {
    const header = document.getElementById("chatHeader");
    const messagesDiv = document.getElementById("messages");
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendMessage");
    const messageInputArea = document.getElementById("messageInputArea");

    header.classList.remove("hidden");
    messageInputArea.classList.remove("hidden");

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.error("Utilisateur connecté introuvable.");
        return;
    }

    // Afficher le nom et les détails du contact dans l'en-tête
    header.innerHTML = `
        <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-3">
                <img src="${contact.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
                <div>
                    <p class="font-semibold text-gray-900">${contact.name} ${contact.phone === currentUser.phone ? '<span class="text-green-500">(vous)</span>' : ''}</p>
                    <p class="text-sm text-gray-500">${contact.isOnline ? "En ligne" : "Hors ligne"}</p>
                </div>
            </div>
        </div>
    `;

    messagesDiv.innerHTML = "";

    const response = await fetch("https://json-server-vpom.onrender.com/messages");
    const allMessages = await response.json();

    const conversationMessages = allMessages.filter(
        msg => (msg.senderId === contact.id && msg.receiverId === currentUser.id) ||
               (msg.senderId === currentUser.id && msg.receiverId === contact.id)
    );

    conversationMessages
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach(msg => {
            const isMe = msg.senderId === currentUser.id;
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const div = document.createElement("div");
            div.className = `flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`;
            div.innerHTML = `
                <div class="max-w-xs px-4 py-2 rounded-lg shadow-sm ${isMe ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}">
                    <p>${msg.content}</p>
                    <div class="text-right text-xs mt-1 opacity-70">${time}</div>
                </div>
            `;
            messagesDiv.appendChild(div);
        });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    input.addEventListener("input", () => {
        sendButton.innerHTML = input.value.trim()
            ? `<i class="fas fa-paper-plane text-sm"></i>`
            : `<i class="fas fa-microphone text-sm"></i>`;
    });

    sendButton.onclick = async () => {
        const messageContent = input.value.trim();
        if (!messageContent) return;

        const newMessage = {
            senderId: currentUser.id,
            receiverId: contact.id,
            content: messageContent,
            timestamp: Date.now(),
        };

        // Envoyer le message au serveur
        await fetch("https://json-server-vpom.onrender.com/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMessage),
        });

        // Ajouter le message directement à la partie 3
        const div = document.createElement("div");
        div.className = `flex justify-end mb-3`;
        div.innerHTML = `
            <div class="max-w-xs px-4 py-2 rounded-lg shadow-sm bg-green-500 text-white">
                <p>${newMessage.content}</p>
                <div class="text-right text-xs mt-1 opacity-70">${new Date(newMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Réinitialiser le champ de saisie
        input.value = "";
    };
}

async function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// Fonction pour charger les contacts dans la vue d'accueil
async function loadContactsForHome() {
    try {
        const contactsResponse = await fetch("https://json-server-vpom.onrender.com/contacts");
        const messagesResponse = await fetch("https://json-server-vpom.onrender.com/messages");
        const contacts = await contactsResponse.json();
        const messages = await messagesResponse.json();

        const contactsList = document.getElementById("contactsList");
        if (!contactsList) return;

        contactsList.innerHTML = "";

        const currentUser = await getCurrentUser();
        if (!currentUser) return;

        const sortedContacts = contacts
            .map(contact => {
                const contactMessages = messages.filter(msg =>
                    (msg.senderId === contact.id && msg.receiverId === currentUser.id) ||
                    (msg.senderId === currentUser.id && msg.receiverId === contact.id)
                );
                const lastMessage = contactMessages[contactMessages.length - 1];
                return {
                    contact,
                    lastMessage,
                    lastTimestamp: lastMessage ? lastMessage.timestamp : 0
                };
            })
            .sort((a, b) => b.lastTimestamp - a.lastTimestamp);

        sortedContacts.forEach(({ contact, lastMessage }) => {
            const lastMessageText = lastMessage
                ? (lastMessage.content.length > 30
                    ? lastMessage.content.substring(0, 30) + "..."
                    : lastMessage.content)
                : "Aucun message";

            const lastTime = lastMessage
                ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : "";

            const li = document.createElement("li");
            li.className = "flex items-center justify-between space-x-2 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";

            li.innerHTML = `
                <img src="${contact.avatar || 'https://via.placeholder.com/50'}" 
                     class="w-10 h-10 rounded-full object-cover">
                <div class="flex-1 min-w-0 ml-3">
                    <div class="flex justify-between items-center">
                        <p class="font-semibold text-gray-900 truncate">${contact.name} ${contact.phone === currentUser.phone ? '<span class="text-green-500">(vous)</span>' : ''}</p>
                        <span class="text-xs text-gray-400">${lastTime}</span>
                    </div>
                    <p class="text-sm text-gray-500 truncate">${lastMessageText}</p>
                </div>
            `;

            li.addEventListener("click", () => openChat(contact));
            contactsList.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des contacts :", error);
    }
}

// Fonction pour attacher les event listeners de la vue d'accueil
function attachHomeEventListeners() {
    const newDiscussionBtn = document.getElementById("newDiscussionBtn");
    if (newDiscussionBtn) {
        newDiscussionBtn.addEventListener("click", () => {
            renderNewDiscussion();
        });
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            const query = event.target.value.trim().toLowerCase();
            // Ici vous pouvez ajouter la logique de recherche si nécessaire
        });
    }
}