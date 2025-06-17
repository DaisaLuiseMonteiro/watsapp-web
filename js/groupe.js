export function renderGroupe() {
    const container = document.createElement("div");
    container.id = "groupePage";
    container.className = "bg-white border-r border-gray-200 flex flex-col h-full w-full";

    container.innerHTML = `
        <!-- En-tête -->
        <div class="p-4 pb-2 flex flex-col bg-white border-b border-gray-200">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-800">Groupes</h2>
                <button id="backToContactsBtn" title="Retour aux contacts" class="text-gray-600 hover:text-blue-500 text-lg">
                    <i class="fas fa-arrow-left"></i>
                </button>
            </div>
        </div>
        
        <!-- Liste des groupes -->
        <ul id="groupsList" class="overflow-y-auto flex-1 p-2"
            style="scrollbar-width: thin; scrollbar-color: #f3f4f6 transparent;"></ul>
    `;

    // Ajouter un gestionnaire pour revenir aux contacts
    container.querySelector("#backToContactsBtn").addEventListener("click", () => {
        const partie2 = document.getElementById("partie2");
        partie2.innerHTML = ""; 
        loadContacts(); // Recharger la liste des contacts
    });

    loadGroups(container.querySelector("#groupsList")); // Charger la liste des groupes
    return container;
}

export async function loadGroups(container) {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/groups");
        const groups = await response.json();

        container.innerHTML = ""; // Vider le conteneur avant d'ajouter les groupes

        if (groups.length === 0) {
            container.innerHTML = `
                <li class="text-center text-gray-500 py-8">
                    <i class="fas fa-users text-4xl mb-2"></i>
                    <p>Aucun groupe trouvé</p>
                </li>
            `;
            return;
        }

        groups.forEach(group => {
            const li = document.createElement("li");
            li.className = "flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer";
            li.innerHTML = `
                <img src="${group.avatar || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">${group.name}</p>
                    <p class="text-sm text-gray-500">${group.description || 'Aucun détail disponible'}</p>
                </div>
            `;

            li.addEventListener("click", () => {
                openGroupChat(group); // Ouvrir la conversation du groupe
            });

            container.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur chargement groupes :", error);
        container.innerHTML = `
            <li class="text-center text-red-500 py-8">
                <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                <p>Erreur lors du chargement des groupes</p>
            </li>
        `;
    }
}

async function openGroupChat(group) {
    const chatHeader = document.getElementById("chatHeader");
    const messagesDiv = document.getElementById("messages");
    const messageInputArea = document.getElementById("messageInputArea");
    const input = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendMessage");

    // Afficher l'en-tête du groupe
    chatHeader.classList.remove("hidden");
    chatHeader.innerHTML = `
        <div class="flex items-center space-x-3">
            <img src="${group.avatar || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full">
            <div>
                <p class="font-semibold text-gray-900">${group.name}</p>
                <p class="text-sm text-gray-500">${group.description || 'Aucun détail disponible'}</p>
            </div>
        </div>
    `;

    // Afficher la zone des messages
    messagesDiv.innerHTML = ""; // Vider les messages précédents
    messageInputArea.classList.remove("hidden");

    // Charger les messages du groupe
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

    // Ajouter un gestionnaire pour envoyer des messages
    sendButton.onclick = async () => {
        const messageContent = input.value.trim();
        if (!messageContent) return;

        const newMessage = {
            groupId: group.id,
            senderId: currentUser.id,
            content: messageContent,
            timestamp: Date.now(),
        };

        // Envoyer le message au serveur
        await fetch("https://json-server-vpom.onrender.com/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMessage),
        });

        // Ajouter le message directement à la conversation
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