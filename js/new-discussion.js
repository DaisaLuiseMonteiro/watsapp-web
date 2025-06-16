import { router } from "./route";
import { loadMessages } from "./home";
import { renderNewContact } from "./new-contact";

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
        router("/home"); 
    });

    partie2.querySelector("#newGroupBtn").addEventListener("click", () => {
        router("/new-groupe"); 
    });

    partie2.querySelector("#newContactBtn").addEventListener("click", () => {
        renderNewContact(); 
    });
}

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
    const messagesResponse = await fetch("https://json-server-vpom.onrender.com/messages");
    const messages = await messagesResponse.json();

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        console.error("Utilisateur connecté introuvable.");
        return;
    }

    const isCurrentUser = contact.phone === currentUser.phone; 

    const partie3 = document.getElementById("partie3");
    partie3.innerHTML = `
        <!-- En-tête du chat -->
        <div id="chatHeader" class="bg-white p-4 border-b flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <img src="${contact.avatar || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full object-cover">
                <div>
                    <p id="chatName" class="font-semibold text-gray-900">
                        ${contact.name} ${isCurrentUser ? '<span class="text-green-500">(vous)</span>' : ''}
                    </p>
                    <p class="text-sm text-gray-500">${contact.status || 'Aucun statut disponible'}</p>
                </div>
            </div>
            <div class="flex items-center space-x-4 text-gray-600 ml-auto">
                <i class="fas fa-search cursor-pointer"></i>
                <i class="fas fa-ellipsis-v cursor-pointer"></i>
            </div>
        </div>

        <!-- Zone des messages -->
        <div id="messages" class="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50"
            style="scrollbar-width: thin; overflow-x: hidden;">
        </div>

        <!-- Zone de saisie du message -->
        <div id="messageInputArea" class="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
            <input id="messageInput" type="text" placeholder="Écrire un message"
                class="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
            <button id="sendMessage"
                class="bg-green-500 text-white px-3 py-2 rounded-full hover:bg-green-600 transition">
                <i class="fas fa-paper-plane text-sm"></i>
            </button>
        </div>
    `;

    const contactMessages = messages.filter(
        msg => msg.senderId === contact.id || msg.receiverId === contact.id
    );

    const messagesDiv = document.getElementById("messages");

    contactMessages
        .sort((a, b) => a.timestamp - b.timestamp) 
        .forEach(msg => {
            const isSentByCurrentUser = msg.senderId === currentUser.id; 
            const messageDiv = document.createElement("div");
            messageDiv.className = `flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'} mb-3`;
            messageDiv.innerHTML = `
                <div class="max-w-xs px-4 py-2 rounded-lg shadow-sm ${
                    isSentByCurrentUser
                        ? 'bg-green-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                }">
                    <p>${msg.content}</p>
                    <div class="text-right text-xs mt-1 opacity-70">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
            messagesDiv.appendChild(messageDiv);
        });

    const sendButton = document.getElementById("sendMessage");
    const input = document.getElementById("messageInput");
    sendButton.addEventListener("click", async () => {
        const content = input.value.trim();
        if (!content) return;

        await fetch("https://json-server-vpom.onrender.com/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                senderId: currentUser.id, 
                receiverId: contact.id,
                content,
                timestamp: Date.now(),
                status: "sent"
            })
        });

        input.value = "";
        openChat(contact);
    });
}
