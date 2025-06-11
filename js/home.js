import { router } from "./route";

export function renderHome() {
    const element = document.createElement("div");
    element.innerHTML = `
        <div id="message" class="flex w-screen h-screen overflow-hidden">
            <!-- PARTIE 1 -->
            <div id="partie1" class="bg-gray-50 h-full w-[5%] flex flex-col justify-between items-center py-4">
                <div class="flex flex-col items-center space-y-6">
                    <button title="Discussions" class="text-gray-600 hover:text-green-500 text-xl"><i class="fas fa-comments"></i></button>
                    <button title="Actus" class="text-gray-600 hover:text-green-500 text-xl"><i class="fas fa-newspaper"></i></button>
                    <button title="Communautés" class="text-gray-600 hover:text-green-500 text-xl"><i class="fas fa-users"></i></button>
                    <button title="Appels" class="text-gray-600 hover:text-green-500 text-xl"><i class="fas fa-phone"></i></button>
                </div>
                <div class="flex flex-col items-center space-y-6">
                    <div class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold uppercase" title="Mon profil">X</div>
                </div>
            </div>

            <!-- PARTIE 2 -->
            <div id="partie2" class="bg-white border-r border-gray-200 flex flex-col h-full w-[30%]">
                <div id="entete" class="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <h2 class="text-xl font-semibold text-gray-800">WhatsApp</h2>
                    <div class="flex items-center space-x-4">
                        <button class="border px-2 py-1 rounded hover:bg-gray-100 text-gray-600"><i class="fas fa-plus"></i></button>
                        <button class="text-gray-600 hover:text-gray-800"><i class="fas fa-ellipsis-v"></i></button>
                    </div>
                </div>
                <div class="p-3 border-b border-gray-200">
                    <input type="text" placeholder="Rechercher un contact"
                        class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
                </div>
                <ul id="contactsList" class="overflow-y-auto flex-1 p-0 pr-1"
                    style="scrollbar-width: thin; scrollbar-color: #f3f4f6 transparent;"></ul>
            </div>

            <!-- PARTIE 3 -->
            <div id="partie3" class="bg-white flex flex-col h-full w-[65%]">
                <div id="chatHeader" class="bg-white p-4 border-b flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="bg-white px-3 py-1 rounded shadow-sm"></div>
                    </div>
                    <div class="flex items-center space-x-4 text-gray-600">
                        <i class="fas fa-search cursor-pointer"></i>
                        <i class="fas fa-ellipsis-v cursor-pointer"></i>
                    </div>
                </div>
                <div id="messages" class="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50"
                    style="scrollbar-width: thin;">
                    <div id="defaultMessage" class="flex items-center justify-center h-full text-gray-500">
                        <div class="text-center">
                            <p class="text-lg">Sélectionnez un contact pour commencer une conversation</p>
                        </div>
                    </div>
                </div>
                <div id="messageInputArea" class="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
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

    loadContacts();

    // 🎤 Changement du bouton selon l'input
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

// Chargement des contacts
async function loadContacts() {
    try {
        const response = await fetch("http://localhost:3000/users");
        const users = await response.json();
        const contactsList = document.getElementById("contactsList");
        contactsList.innerHTML = "";

        users.forEach(user => {
            const li = document.createElement("li");
            li.className = "flex items-center space-x-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";
            li.innerHTML = `
                <img src="${user.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-900 truncate">${user.name}</p>
                    <p class="text-sm text-gray-500 truncate">${user.status || 'En ligne'}</p>
                </div>
            `;
            li.addEventListener("click", () => openChat(user));
            contactsList.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur chargement contacts :", error);
    }
}

// Ouverture du chat
function openChat(user) {
    const header = document.getElementById("chatHeader");
    const messagesDiv = document.getElementById("messages");
    const sendButton = document.getElementById("sendMessage");

    // Supprime le message de bienvenue s'il existe
    document.getElementById("defaultMessage")?.remove();

    header.innerHTML = `
        <div class="flex items-center space-x-3">
            <img src="${user.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
            <div>
                <p class="font-semibold text-gray-900">${user.name}</p>
                <p class="text-sm text-gray-500">${user.status || 'En ligne'}</p>
            </div>
        </div>
        <div class="flex items-center space-x-4 text-gray-600">
            <i class="fas fa-search cursor-pointer"></i>
            <i class="fas fa-ellipsis-v cursor-pointer"></i>
        </div>
    `;

    messagesDiv.innerHTML = "";
    loadMessages(user.id);

    sendButton.onclick = () => sendMessage(user.id);
}

// Chargement des messages
async function loadMessages(userId) {
    try {
        const response = await fetch("http://localhost:3000/messages");
        const allMessages = await response.json();
        const messagesDiv = document.getElementById("messages");

        messagesDiv.innerHTML = "";

        allMessages
            .filter(msg => msg.senderId === userId || msg.receiverId === userId)
            .forEach(msg => {
                const div = document.createElement("div");
                div.className = `flex ${msg.senderId === userId ? 'justify-start' : 'justify-end'} mb-3`;
                div.innerHTML = `<div class="max-w-xs px-4 py-3 rounded-lg shadow-sm ${msg.senderId === userId ? 'bg-white border border-gray-200 text-gray-800' : 'bg-green-500 text-white'}">${msg.content}</div>`;
                messagesDiv.appendChild(div);
            });

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error("Erreur chargement messages :", error);
    }
}

// Envoi d’un message
async function sendMessage(receiverId) {
    const input = document.getElementById("messageInput");
    const content = input.value.trim();
    if (!content) return;

    await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: "currentUser", receiverId, content, timestamp: Date.now(), status: "sent" })
    });

    input.value = "";
    loadMessages(receiverId);
}
