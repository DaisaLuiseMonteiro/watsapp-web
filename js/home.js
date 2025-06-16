import { renderLogin } from "./login";
import { renderNewDiscussion } from "./new-discussion";

// Variable globale pour stocker l'utilisateur connecté
let currentUser = null;

export const router = {
    navigate(path) {
        const app = document.getElementById("app");
        app.innerHTML = ""; 

        if (path === "/login") {
            app.appendChild(renderLogin());
        } else if (path === "/home") {
            app.appendChild(renderHome());
        }
    }
};

// Fonction pour définir l'utilisateur connecté
export function setCurrentUser(user) {
    currentUser = user;
    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Fonction pour récupérer l'utilisateur connecté
export async function getCurrentUser() {
    try {
        // Récupérer l'utilisateur connecté depuis localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);

            // Vérifier si l'utilisateur existe dans l'API
            const response = await fetch(`https://json-server-vpom.onrender.com/contacts?phone=${encodeURIComponent(user.phone)}`);
            const contacts = await response.json();

            if (contacts.length > 0) {
                return contacts[0]; // Retourner l'utilisateur trouvé
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

    // Initialiser l'utilisateur connecté et mettre à jour le profil
    initializeCurrentUser();

    // Charger les contacts au démarrage
    loadContacts();

    // Ajouter un gestionnaire d'événements pour le filtrage
    const searchInput = element.querySelector("#searchInput");
    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.trim().toLowerCase();
        loadContacts(query);
    });

    element.querySelector("#newDiscussionBtn").addEventListener("click", () => {
        const partie2 = document.getElementById("partie2");
        partie2.innerHTML = ""; 
        partie2.appendChild(renderNewDiscussion()); 
    });

    element.querySelector("#logoutBtn").addEventListener("click", () => {
        // Supprimer les données de l'utilisateur connecté
        localStorage.removeItem('currentUser');
        currentUser = null;
        router.navigate("/login");
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

// Fonction pour initialiser l'utilisateur connecté
async function initializeCurrentUser() {
    try {
        // Récupérer l'utilisateur connecté
        let user = await getCurrentUser();
        
        if (!user) {
            const response = await fetch("https://json-server-vpom.onrender.com/contacts");
            const contacts = await response.json();
            
            // Utiliser le premier contact comme utilisateur connecté par défaut
            user = contacts[0];
            
            if (user) {
                setCurrentUser(user);
            }
        }
        
        // Mettre à jour l'affichage du profil
        updateUserProfile(user);
        
    } catch (error) {
        console.error("Erreur lors de l'initialisation de l'utilisateur :", error);
    }
}

// Fonction pour mettre à jour l'affichage du profil utilisateur
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

        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(query.toLowerCase()) || contact.phone.includes(query)
        );

        // Récupérer l'utilisateur connecté
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }

        const sortedContacts = filteredContacts
            .map(contact => {
                const contactMessages = messages.filter(
                    msg => (msg.senderId === contact.id && msg.receiverId === currentUser.id) ||
                           (msg.senderId === currentUser.id && msg.receiverId === contact.id)
                );

                const lastMessage = contactMessages.length > 0 ? contactMessages[contactMessages.length - 1] : null;
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

            // Vérifier si le contact est l'utilisateur connecté
            const isCurrentUser = contact.phone === currentUser.phone;

            const li = document.createElement("li");
            li.className = "flex items-center justify-between space-x-2 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";

            li.innerHTML = `
                <img src="${contact.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
                <div class="flex-1 min-w-0 ml-3">
                    <div class="flex justify-between items-center">
                        <p class="font-semibold text-gray-900 truncate">
                            ${contact.name} ${isCurrentUser ? '<span class="text-green-500">(vous)</span>' : ''}
                        </p>
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

function openChat(contact) {
    const header = document.getElementById("chatHeader");
    const messagesDiv = document.getElementById("messages");
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendMessage");
    const messageInputArea = document.getElementById("messageInputArea");

    // Afficher l'en-tête et la zone de saisie
    header.classList.remove("hidden");
    messageInputArea.classList.remove("hidden");

    // Récupérer l'utilisateur connecté depuis l'API
    getCurrentUser().then(currentUser => {
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }

        const isCurrentUser = contact.phone === currentUser.phone; // Vérifier si c'est l'utilisateur connecté

        // Mettre à jour l'en-tête avec les informations du contact
        header.innerHTML = `
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center space-x-3">
                    <img src="${contact.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
                    <div>
                        <p class="font-semibold text-gray-900">
                            ${contact.name} ${isCurrentUser ? '<span class="text-green-500">(vous)</span>' : ''}
                        </p>
                        <p class="text-sm text-gray-500">
                            ${contact.isOnline ? '<span class="text-green-400">En ligne</span>' : 'Hors ligne'}
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 text-gray-600">
                    <i class="fas fa-search cursor-pointer"></i>
                    <i class="fas fa-ellipsis-v cursor-pointer"></i>
                </div>
            </div>
        `;

        // Réinitialiser la zone des messages et le champ de saisie
        messagesDiv.innerHTML = "";
        input.value = "";
        sendButton.innerHTML = `<i class="fas fa-microphone text-sm"></i>`;

        // Charger les messages pour ce contact
        loadMessages(contact.phone); // Utiliser le numéro de téléphone comme contactId
    });

    // Ajouter les événements pour l'input et l'envoi
    input.addEventListener("input", () => {
        sendButton.innerHTML = input.value.trim()
            ? `<i class="fas fa-paper-plane text-sm"></i>`
            : `<i class="fas fa-microphone text-sm"></i>`;
    });

    // Événement pour envoyer avec Enter
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage(contact.phone); // Utiliser le numéro de téléphone comme contactId
        }
    });

    // Ajouter un événement pour envoyer un message
    sendButton.onclick = () => sendMessage(contact.phone);
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

        // Récupérer l'utilisateur connecté
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }

        // Filtrer les messages pour le contact actuel
        const conversationMessages = allMessages.filter(msg => msg.contactId === contactId);

        console.log(`Messages pour la conversation avec ${contactId}:`, conversationMessages);

        // Trier les messages par timestamp
        conversationMessages
            .sort((a, b) => a.timestamp - b.timestamp)
            .forEach(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isMe = msg.status === "sent"; // Déterminer si le message est envoyé ou reçu

                const div = document.createElement("div");
                div.className = `flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`;
                div.innerHTML = `
                    <div class="max-w-xs px-4 py-2 rounded-lg shadow-sm ${isMe ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}">
                        <p>${msg.content}</p>
                        <div class="text-right text-xs mt-1 opacity-70">${time}</div>
                        ${isMe ? '<span class="text-green-500">(vous)</span>' : ''}
                    </div>
                `;
                messagesDiv.appendChild(div);
            });

        // Faire défiler vers le bas pour afficher le dernier message
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error("Erreur chargement messages :", error);
    }
}

async function sendMessage(contactId) {
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendMessage");
    const content = input.value.trim();

    if (!content) return;

    try {
        const messageData = {
            id: `msg${Date.now()}`, // Générer un ID unique
            contactId, // Utiliser contactId pour identifier le contact
            content,
            timestamp: Date.now(),
            status: "sent" // Statut par défaut pour les messages envoyés
        };

        console.log("Données envoyées :", messageData); // Debugging

        // Envoyer le message à JSON Server
        const response = await fetch("https://json-server-vpom.onrender.com/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Réponse du serveur :", responseData);

        // Réinitialiser le champ de saisie
        input.value = "";
        sendButton.innerHTML = `<i class="fas fa-microphone text-sm"></i>`;

        // Recharger les messages pour la discussion actuelle
        await loadMessages(contactId);
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
    // Initialiser l'utilisateur connecté
    await initializeCurrentUser();
    
    // Créer des messages de test (à faire une seule fois)
    // await createTestMessages();

    // Charger les contacts
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
            setCurrentUser(contact); // Définir l'utilisateur connecté
            updateUserProfile(contact); // Mettre à jour l'avatar dans la partie 1
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