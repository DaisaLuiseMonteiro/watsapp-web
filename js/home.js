import { renderLogin } from "./login";
import { renderNewDiscussion } from "./new-discussion";

let currentUser = null;

export const router = {
    navigate(path) {
        const app = document.getElementById("app");
        app.innerHTML = ""; 

        if (path === "/login") {
            app.appendChild(renderLogin());
        } else if (path === "/home") {
            app.appendChild(renderHome(
          
            ));
        }
    }
};

export function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
}

export async function getCurrentUser() {
    try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);

            const response = await fetch(`https://json-server-vpom.onrender.com/contacts?phone=${encodeURIComponent(user.phone)}`);
            const contacts = await response.json();

            if (contacts.length > 0) {
                return contacts[0]; 
            } else {
                console.error("Utilisateur connecté introuvable dans l'API.");
                return null;
            }
        } else {
            console.error("Aucun utilisateur connecté trouvé dans localStorage.");
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur connecté :", error);
        return null;
    }
}

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
                <div id="userProfile" class="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold uppercase cursor-pointer" title="Mon profil - Maina">
                    <img id="currentUserAvatar" src="https://example.com/avatar.jpg" class="w-10 h-10 rounded-full object-cover">
                    <span id="currentUserInitials" class="hidden">M</span>
                </div>
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
                <div class="flex items-center space-x-4 text-gray-600 ml-auto relative">
                    <i id="optionsButton" class="fas fa-ellipsis-v cursor-pointer"></i>
                    <!-- Menu contextuel -->
                    <div id="optionsMenu" class="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg hidden">
                        <button id="archiveButton" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Archiver</button>
                        <button id="deleteButton" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Supprimer</button>
                    </div>
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

    initializeCurrentUser();

    loadContacts();

    const searchInput = element.querySelector("#searchInput");
    searchInput.addEventListener("input", async (event) => {
        const query = event.target.value.trim().toLowerCase();
        await loadContacts(query); // Charger les contacts filtrés
    });

    element.querySelector("#newDiscussionBtn").addEventListener("click", () => {
        const partie2 = document.getElementById("partie2");
        partie2.innerHTML = ""; 
        partie2.appendChild(renderNewDiscussion()); 
    });

    element.querySelector("#logoutBtn").addEventListener("click", () => {
        localStorage.removeItem('currentUser'); // Supprimer l'utilisateur actuel du stockage local
        currentUser = null; // Réinitialiser la variable utilisateur
        router.navigate("/login"); // Rediriger vers la page de connexion
    });

    element.querySelector("#groupsBtn").addEventListener("click", async () => {
        const contactsList = document.getElementById("contactsList");
        if (!contactsList) {
            console.error("Élément DOM 'contactsList' introuvable.");
            return;
        }

        contactsList.innerHTML = ""; // Vider la liste des conversations

        try {
            const response = await fetch("https://json-server-vpom.onrender.com/groups");
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const groups = await response.json();

            if (groups.length === 0) {
                contactsList.innerHTML = `
                    <li class="text-center text-gray-500 py-8">
                        <i class="fas fa-users text-4xl mb-2"></i>
                        <p>Aucun groupe trouvé</p>
                    </li>
                `;
                return;
            }

            groups.forEach(group => {
                const li = document.createElement("li");
                li.className = "flex items-center justify-between space-x-2 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";

                li.innerHTML = `
                    <img src="${group.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
                    <div class="flex-1 min-w-0 ml-3">
                        <div class="flex justify-between items-center">
                            <p class="font-semibold text-gray-900 truncate">${group.name}</p>
                            <span class="text-xs text-gray-400">${new Date(group.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p class="text-sm text-gray-500 truncate">${group.lastMessage || "Aucun message"}</p>
                    </div>
                `;

                li.addEventListener("click", () => openGroupChat(group)); // Ouvrir la conversation du groupe
                contactsList.appendChild(li);
            });
        } catch (error) {
            console.error("Erreur lors du chargement des groupes :", error);
            contactsList.innerHTML = `
                <li class="text-center text-red-500 py-8">
                    <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                    <p>Erreur lors du chargement des groupes</p>
                </li>
            `;
        }
    });

    element.querySelector("#allContactsBtn").addEventListener("click", () => {
        const contactsList = document.getElementById("contactsList");
        if (!contactsList) {
            console.error("Élément DOM 'contactsList' introuvable.");
            return;
        }

        contactsList.innerHTML = ""; // Vider la liste des groupes

        // Recharger la liste des contacts
        loadContacts();
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

async function initializeCurrentUser() {
    try {
        let user = await getCurrentUser();
        
        if (!user) {
            const response = await fetch("https://json-server-vpom.onrender.com/contacts");
            const contacts = await response.json();
            
            user = contacts[0];
            
            if (user) {
                setCurrentUser(user);
            }
        }
        
        updateUserProfile(user);
        
    } catch (error) {
        console.error("Erreur lors de l'initialisation de l'utilisateur :", error);
    }
}

function updateUserProfile(user) {
    const avatarImg = document.getElementById("currentUserAvatar");
    const initialsSpan = document.getElementById("currentUserInitials");
    const profileDiv = document.getElementById("userProfile");

    if (!avatarImg || !initialsSpan || !profileDiv) {
        console.error("Éléments DOM pour le profil utilisateur introuvables.");
        return;
    }

    if (user && user.avatar) {
        avatarImg.src = user.avatar;
        avatarImg.classList.remove("hidden");
        initialsSpan.classList.add("hidden");
        profileDiv.title = `Mon profil - ${user.name}`;
    } else if (user && user.name) {
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        initialsSpan.textContent = initials;
        avatarImg.classList.add("hidden");
        initialsSpan.classList.remove("hidden");
        profileDiv.title = `Mon profil - ${user.name}`;
    } else {
        initialsSpan.textContent = "X";
        avatarImg.classList.add("hidden");
        initialsSpan.classList.remove("hidden");
        profileDiv.title = "Mon profil";
    }
}

async function loadContacts(query = "") {
    try {
        const contactsResponse = await fetch("https://json-server-vpom.onrender.com/contacts");
        const messagesResponse = await fetch("https://json-server-vpom.onrender.com/messages");
        const contacts = await contactsResponse.json();
        const messages = await messagesResponse.json();

        const contactsList = document.getElementById("contactsList");
        if (!contactsList) {
            console.error("Élément DOM 'contactsList' introuvable.");
            return;
        }

        contactsList.innerHTML = "";

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }

        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(query.toLowerCase()) || contact.phone.includes(query)
        );

        const sortedContacts = filteredContacts
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

    if (!header.dataset.initialized || header.dataset.contactId !== contact.id) {
        header.innerHTML = `
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center space-x-3">
                    <img src="${contact.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
                    <div>
                        <p class="font-semibold text-gray-900">${contact.name}</p>
                        <p class="text-sm text-gray-500">${contact.isOnline ? "En ligne" : "Hors ligne"}</p>
                    </div>
                </div>
            </div>
        `;
        header.dataset.initialized = "true";
        header.dataset.contactId = contact.id;
    }

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

    sendButton.onclick = () => sendMessage(contact.id);
}

export async function loadMessages(contactId) {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/messages");
        const allMessages = await response.json();
        const messagesDiv = document.getElementById("messages");

        if (!messagesDiv) {
            console.error("Élément DOM 'messages' introuvable.");
            return;
        }

        messagesDiv.innerHTML = "";

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }

        const conversationMessages = allMessages.filter(
            msg => (msg.senderId === contactId && msg.receiverId === currentUser.id) ||
                   (msg.senderId === currentUser.id && msg.receiverId === contactId)
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
    } catch (error) {
        console.error("Erreur chargement messages :", error);
    }
}

async function sendMessage(contactId) {
    const input = document.getElementById("messageInput");
    const content = input.value.trim();

    if (!content) return;

    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }

        const messageData = {
            id: `msg${Date.now()}`,
            senderId: currentUser.id,
            receiverId: contactId,
            content,
            timestamp: Date.now(),
            status: "sent"
        };

        const response = await fetch("https://json-server-vpom.onrender.com/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        input.value = "";

        await loadMessages(contactId);

        await loadContacts();
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
    }
}

async function deleteMessages(userId) {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/messages");
        const allMessages = await response.json();
        
        const user = getCurrentUser();
        const currentUserId = user ? user.id : "currentUser";

        const messagesToDelete = allMessages.filter(
            msg => (msg.senderId === userId && msg.receiverId === currentUserId) ||
                   (msg.senderId === currentUserId && msg.receiverId === userId)
        );

        for (const message of messagesToDelete) {
            await fetch(`https://json-server-vpom.onrender.com/messages/${message.id}`, {
                method: "DELETE"
            });
        }
    } catch (error) {
        console.error("Erreur lors de la suppression des messages :", error);
    }
}

async function archiveChat(userId) {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/messages");
        const allMessages = await response.json();
        
        const user = getCurrentUser();
        const currentUserId = user ? user.id : "currentUser";

        const messagesToArchive = allMessages.filter(
            msg => (msg.senderId === userId && msg.receiverId === currentUserId) ||
                   (msg.senderId === currentUserId && msg.receiverId === userId)
        );

        for (const message of messagesToArchive) {
            await fetch(`https://json-server-vpom.onrender.com/messages/${message.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: true })
            });
        }
    } catch (error) {
        console.error("Erreur lors de l'archivage des messages :", error);
    }
}

async function createTestMessages() {
    const user = getCurrentUser();
    const currentUserId = user ? user.id : "currentUser";
    
    const testMessages = [
        {
            senderId: "1",
            receiverId: currentUserId,
            content: "Salut ! Comment ça va ?",
            timestamp: Date.now() - 3600000,
            status: "delivered"
        },
        {
            senderId: currentUserId,
            receiverId: "1",
            content: "Ça va bien, merci ! Et toi ?",
            timestamp: Date.now() - 3000000,
            status: "delivered"
        },
        {
            senderId: "2",
            receiverId: currentUserId,
            content: "Tu es disponible pour une réunion demain ?",
            timestamp: Date.now() - 1800000,
            status: "sent"
        }
    ];

    for (const message of testMessages) {
        try {
            await fetch("https://json-server-vpom.onrender.com/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(message)
            });
        } catch (error) {
            console.error("Erreur lors de la création des messages de test :", error);
        }
    }
}

window.addEventListener("load", async () => {
    await initializeCurrentUser();
    
    const user = getCurrentUser();
    if (user) {
        console.log("Utilisateur courant :", user);
        loadContacts();
    } else {
        console.error("Utilisateur courant non trouvé");
    }
});

async function markMessagesAsRead(userId) {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/messages");
        const allMessages = await response.json();
        
        const user = getCurrentUser();
        const currentUserId = user ? user.id : "currentUser";

        const unreadMessages = allMessages.filter(msg => 
            msg.senderId === userId && 
            msg.receiverId === currentUserId && 
            msg.status !== "read"
        );
        
        for (const message of unreadMessages) {
            await fetch(`https://json-server-vpom.onrender.com/messages/${message.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "read" })
            });
        }
    } catch (error) {
        console.error("Erreur lors du marquage des messages comme lus:", error);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const phoneInput = document.getElementById("phone");
    if (!phoneInput) {
        console.error("Élément DOM 'phone' introuvable.");
        return;
    }

    const phoneNumber = phoneInput.value.trim();

    if (!/^\+?[0-9\s]+$/.test(phoneNumber)) {
        showMessage("Le numéro ne doit contenir que des chiffres ou commencer par '+'.", "error");
        return;
    }

    try {
        const response = await fetch(`https://json-server-vpom.onrender.com/contacts?phone=${encodeURIComponent(phoneNumber)}`);
        const contacts = await response.json();

        if (contacts.length > 0) {
            const contact = contacts[0];
            setCurrentUser(contact); 
            updateUserProfile(contact); 
            showMessage("Connexion réussie !", "success");
            setTimeout(() => router.navigate("/home"), 2000);
        } else {
            showMessage("Numéro introuvable. Veuillez vous inscrire.", "error");
        }
    } catch (error) {
        console.error("Erreur de connexion :", error);
        showMessage("Erreur serveur.", "error");
    }
}

async function loadGroups() {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/groups");
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const groups = await response.json();
        const contactsList = document.getElementById("contactsList");
        if (!contactsList) {
            console.error("Élément DOM 'contactsList' introuvable.");
            return;
        }

        contactsList.innerHTML = ""; 

        groups.forEach(group => {
            const li = document.createElement("li");
            li.className = "flex items-center justify-between space-x-2 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";

            li.innerHTML = `
                <img src="${group.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
                <div class="flex-1 min-w-0 ml-3">
                    <div class="flex justify-between items-center">
                        <p class="font-semibold text-gray-900 truncate">${group.name}</p>
                        <span class="text-xs text-gray-400">${new Date(group.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="text-sm text-gray-500 truncate">${group.lastMessage || "Aucun message"}</p>
                </div>
            `;

            li.addEventListener("click", () => openGroupChat(group));
            contactsList.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des groupes :", error);
    }
}

async function sendGroupMessage(groupId) {
    const input = document.getElementById("messageInput");
    const content = input.value.trim();

    if (!content) return;

    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }

        const messageData = {
            id: `msg${Date.now()}`,
            senderId: currentUser.id,
            receiverId: groupId,
            content,
            timestamp: Date.now(),
            status: "sent"
        };

        const response = await fetch("https://json-server-vpom.onrender.com/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        input.value = "";

        await openGroupChat({ id: groupId });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
    }
}

async function openGroupChat(group) {
    const chatHeader = document.getElementById("chatHeader");
    const messagesDiv = document.getElementById("messages");
    const messageInputArea = document.getElementById("messageInputArea");
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendMessage");

    // Afficher l'aen-tête du groupe
    chatHeader.classList.remove("hidden");
    chatHeader.innerHTML = `
        <div class="flex items-center space-x-3">
            <img src="${group.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
            <div>
                <p class="font-semibold text-gray-900">${group.name}</p>
                <p class="text-sm text-gray-500">${group.description || "Aucun détail disponible"}</p>
            </div>
        </div>
    `;

    // Afficher la zone des messages
    messagesDiv.innerHTML = ""; // Vider les messages précédents
    messageInputArea.classList.remove("hidden");

    try {
        const response = await fetch(`https://json-server-vpom.onrender.com/messages?groupId=${group.id}`);
        const messages = await response.json();

        messages.forEach(msg => {
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
    } catch (error) {
        console.error("Erreur lors du chargement des messages du groupe :", error);
    }

    sendButton.onclick = async () => {
        const messageContent = input.value.trim();
        if (!messageContent) return;

        const newMessage = {
            groupId: group.id,
            senderId: currentUser.id,
            content: messageContent,
            timestamp: Date.now(),
        };

        await fetch("https://json-server-vpom.onrender.com/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMessage),
        });

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

        input.value = "";
    };
}