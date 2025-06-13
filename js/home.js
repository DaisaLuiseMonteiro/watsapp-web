import { router } from "./route";
import { renderNewDiscussion } from "./new-discussion";

export function renderHome() {
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
                    <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold uppercase" title="Mon profil">X</div>
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
                            <button title="Options" class="text-gray-600 hover:text-green-500 text-lg">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                    <input id="searchInput" type="text" placeholder="Rechercher un contact"
                        class="mt-1 w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
                </div>
                <!-- Boutons de filtrage -->
                <div class="px-4 py-2 border-b border-gray-200 flex space-x-2">
                    <button class="text-sm text-gray-700 px-3 py-1 rounded-full bg-gray-100 hover:bg-green-100">Toutes</button>
                    <button class="text-sm text-gray-700 px-3 py-1 rounded-full bg-gray-100 hover:bg-green-100">Non lues</button>
                    <button class="text-sm text-gray-700 px-3 py-1 rounded-full bg-gray-100 hover:bg-green-100">Favoris</button>
                    <button class="text-sm text-gray-700 px-3 py-1 rounded-full bg-gray-100 hover:bg-green-100">Groupes</button>
                </div>

                <!-- Liste des contacts -->
                <ul id="contactsList" class="overflow-y-auto flex-1 p-0 pr-1"
                    style="scrollbar-width: thin; scrollbar-color: #f3f4f6 transparent;"></ul>
            </div>

            <!-- PARTIE 3 -->
            <div id="partie3" class="bg-white flex flex-col h-full w-[65%]">
                <!-- En-tête du chat -->
                <div id="chatHeader" class="bg-white p-4 border-b flex items-center justify-between hidden">
                    <div class="flex items-center space-x-3">
                        <img id="chatAvatar" src="" class="w-10 h-10 rounded-full object-cover">
                        <div>
                            <p id="chatName" class="font-semibold text-gray-900"></p>
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
                <div id="messageInputArea" class="p-3 bg-white border-t border-gray-200 flex items-center space-x-2 hidden">
                    <input id="messageInput" type="text" placeholder="Écrire un message"
                        class="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <button id="sendMessage"
                        class="bg-green-500 text-white px-3 py-2 rounded-full hover:bg-green-600 transition">
                        <i class="fas fa-microphone text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Charger les contacts au démarrage
    loadContacts();

    // Ajouter un gestionnaire d'événements pour le filtrage
    const searchInput = element.querySelector("#searchInput");
    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.trim().toLowerCase();
        loadContacts(query); // Charger les contacts en fonction de la recherche
    });

    element.querySelector("#newDiscussionBtn").addEventListener("click", () => {
        const partie2 = document.getElementById("partie2");
        partie2.innerHTML = ""; 
        partie2.appendChild(renderNewDiscussion()); 
    });

    element.addEventListener("input", () => {
        const input = element.querySelector("#messageInput");
        const sendButton = element.querySelector("#sendMessage");
        if (!input || !sendButton) return;
        sendButton.innerHTML = input.value.trim()
            ? `<i class="fas fa-paper-plane text-sm"></i>`
            : `<i class="fas fa-microphone text-sm"></i>`;
    });

    return element;
}

async function loadContacts(query = "") {
    try {
        const contactsResponse = await fetch("https://json-server-vpom.onrender.com/contacts");
        const messagesResponse = await fetch("https://json-server-vpom.onrender.com/messages");
        const contacts = await contactsResponse.json();
        const messages = await messagesResponse.json();

        const contactsList = document.getElementById("contactsList");
        contactsList.innerHTML = ""; // Vider la liste des contacts

        // Filtrer les contacts en fonction de la recherche
        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(query) || contact.phone.includes(query)
        );

        // Trier et afficher les contacts
        const sortedContacts = filteredContacts
            .map(contact => {
                const msgs = messages.filter(msg => msg.senderId === contact.id || msg.receiverId === contact.id);
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

function openChat(user) {
    const header = document.getElementById("chatHeader");
    const messagesDiv = document.getElementById("messages");
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendMessage");
    const messageInputArea = document.getElementById("messageInputArea");

    header.classList.remove("hidden");
    messageInputArea.classList.remove("hidden");
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

    messagesDiv.innerHTML = "";
    input.value = "";
    sendButton.innerHTML = `<i class="fas fa-microphone text-sm"></i>`;
    loadMessages(user.id);

    sendButton.onclick = () => sendMessage(user.id);
}

export async function loadMessages(userId) {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/messages");
        const allMessages = await response.json();
        const messagesDiv = document.getElementById("messages");

        messagesDiv.innerHTML = ""; 

        allMessages
            .filter(msg => msg.senderId === userId || msg.receiverId === userId)
            .sort((a, b) => a.timestamp - b.timestamp)
            .forEach(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const div = document.createElement("div");
                div.className = `flex ${msg.senderId === userId ? 'justify-start' : 'justify-end'} mb-3`;
                div.innerHTML = `
                    <div class="max-w-xs px-4 py-2 rounded-lg shadow-sm ${msg.senderId === userId ? 'bg-white border border-gray-200 text-gray-800' : 'bg-green-500 text-white'}">
                        <p>${msg.content}</p>
                        <div class="text-right text-xs mt-1 opacity-70">${time}</div>
                    </div>
                `;
                messagesDiv.appendChild(div);
            });

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error("Erreur chargement messages :", error); 
    }
}

async function sendMessage(receiverId) {
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendMessage");
    const content = input.value.trim();

    if (!content) return; 

    try {
        await fetch("https://json-server-vpom.onrender.com/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                senderId: "currentUser", 
                receiverId,
                content,
                timestamp: Date.now(),
                status: "sent"
            })
        });

        input.value = "";
        sendButton.innerHTML = `<i class="fas fa-microphone text-sm"></i>`;

        loadMessages(receiverId);
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
    }
}

async function getCurrentUser() {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/contacts");
        const contacts = await response.json();

        // Remplacez "currentUser" par l'ID ou le numéro de téléphone de l'utilisateur connecté
        const currentUser = contacts.find(contact => contact.id === "currentUser");
        return currentUser;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur connecté :", error);
        return null;
    }
}

