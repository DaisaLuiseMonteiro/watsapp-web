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

                    <label for="status" class="block text-left text-gray-700 font-medium">Statut :</label>
                    <select id="status" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                        <option value="" disabled selected>Sélectionnez un statut</option>
                        <option value="Disponible">Disponible</option>
                        <option value="Occupé">Occupé</option>
                        <option value="Absent">Absent</option>
                        <option value="En ligne">En ligne</option>
                    </select>

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

// Fonction pour générer un avatar avec les initiales
function generateAvatarUrl(name) {
    const initials = name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2); // Maximum 2 initiales
    
    // Couleurs de fond variées pour les avatars
    const colors = ['25d366', '007bff', 'dc3545', 'ffc107', '6f42c1', '20c997', 'fd7e14', 'e83e8c'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${randomColor}&color=fff&size=128&font-size=0.6`;
}

// Fonction pour vérifier la connexion au serveur JSON
async function checkServerConnection() {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/contacts", {
            method: 'HEAD'
        });
        return response.ok;
    } catch (error) {
        console.error("Erreur de connexion au serveur:", error);
        return false;
    }
}

// Fonction pour sauvegarder les données avec retry en cas d'échec
async function saveContactWithRetry(contactData, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch("https://json-server-vpom.onrender.com/contacts", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(contactData)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error(`Tentative ${attempt} échouée:`, error);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Attendre avant de réessayer
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phoneNumber = document.getElementById("phone").value.trim();
    const status = document.getElementById("status").value;

    // Validation du nom
    if (name.length < 2) {
        showMessage("Le nom doit contenir au moins 2 caractères.", "error");
        return;
    }

    // Validation du numéro de téléphone : uniquement des chiffres
    if (!/^\d+$/.test(phoneNumber)) {
        showMessage("Le numéro de téléphone doit contenir uniquement des chiffres.", "error");
        return;
    }

    try {
        // Vérifier si le numéro existe déjà
        const response = await fetch("https://json-server-vpom.onrender.com/contacts");
        const contacts = await response.json();
        const contactExists = contacts.some(contact => contact.phone === phoneNumber);

        if (contactExists) {
            showMessage("Ce numéro de téléphone est déjà enregistré.", "error");
            return;
        }

        // Créer l'objet contact avec toutes les données nécessaires
        const newContact = {
            id: Date.now().toString(), // ID unique basé sur timestamp
            name: name,
            phone: phoneNumber,
            status: status,
            avatar: generateAvatarUrl(name),
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            isOnline: true
        };

        // Sauvegarder sur le serveur JSON
        const saveResponse = await fetch("https://json-server-vpom.onrender.com/contacts", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(newContact)
        });

        if (!saveResponse.ok) {
            throw new Error("Erreur lors de la sauvegarde du contact.");
        }

        showMessage("Inscription réussie ! Redirection vers la connexion...", "success");

        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
            router("/login");
        }, 2000);

    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        showMessage("Erreur lors de l'inscription. Veuillez réessayer.", "error");
    }
}

// Fonction pour charger les contacts avec gestion d'erreur améliorée
async function loadContacts(query = "") {
    try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            console.error("Utilisateur non connecté");
            return;
        }

        const [contactsResponse, messagesResponse] = await Promise.all([
            fetch("https://json-server-vpom.onrender.com/contacts"),
            fetch("https://json-server-vpom.onrender.com/messages")
        ]);

        if (!contactsResponse.ok || !messagesResponse.ok) {
            throw new Error("Erreur de chargement des données");
        }

        const contacts = await contactsResponse.json();
        const messages = await messagesResponse.json();

        const contactsList = document.getElementById("contactsList");
        if (!contactsList) return;
        
        contactsList.innerHTML = "";

        // Filtrer et trier les contacts
        const filteredContacts = contacts.filter(contact =>
            contact.phone !== currentUser.phone &&
            (contact.name.toLowerCase().includes(query.toLowerCase()) || 
             contact.phone.includes(query))
        );

        const sortedContacts = filteredContacts
            .map(contact => {
                const contactMessages = messages.filter(msg => 
                    (msg.senderId === contact.phone && msg.receiverId === currentUser.phone) ||
                    (msg.senderId === currentUser.phone && msg.receiverId === contact.phone)
                );
                const lastMessage = contactMessages[contactMessages.length - 1];
                return {
                    contact,
                    lastMessage,
                    lastTimestamp: lastMessage ? lastMessage.timestamp : 0
                };
            })
            .sort((a, b) => b.lastTimestamp - a.lastTimestamp);

        // Afficher les contacts
        sortedContacts.forEach(({ contact, lastMessage }) => {
            const lastMessageText = lastMessage ? 
                (lastMessage.content.length > 30 ? 
                    lastMessage.content.substring(0, 30) + "..." : 
                    lastMessage.content) : 
                "Aucun message";
            
            const lastTime = lastMessage ? 
                new Date(lastMessage.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }) : "";

            const li = document.createElement("li");
            li.className = "flex items-center justify-between space-x-2 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";

            li.innerHTML = `
                <img src="${contact.avatar || generateAvatarUrl(contact.name)}" 
                     class="w-10 h-10 rounded-full object-cover"
                     onerror="this.src='${generateAvatarUrl(contact.name)}'">
                <div class="flex-1 min-w-0 ml-3">
                    <div class="flex justify-between items-center">
                        <p class="font-semibold text-gray-900 truncate">${contact.name}</p>
                        <span class="text-xs text-gray-400">${lastTime}</span>
                    </div>
                    <div class="flex items-center">
                        <p class="text-sm text-gray-500 truncate flex-1">${lastMessageText}</p>
                        ${contact.isOnline ? '<div class="w-2 h-2 bg-green-400 rounded-full ml-2" title="En ligne"></div>' : ''}
                    </div>
                </div>
            `;

            li.addEventListener("click", () => openChat(contact));
            contactsList.appendChild(li);
        });

        // Afficher un message si aucun contact n'est trouvé
        if (sortedContacts.length === 0) {
            const noContactsMessage = document.createElement("li");
            noContactsMessage.className = "p-4 text-center text-gray-500";
            noContactsMessage.textContent = query ? 
                "Aucun contact trouvé pour cette recherche" : 
                "Aucun contact disponible";
            contactsList.appendChild(noContactsMessage);
        }

    } catch (error) {
        console.error("Erreur lors du chargement des contacts:", error);
        const contactsList = document.getElementById("contactsList");
        if (contactsList) {
            contactsList.innerHTML = `
                <li class="p-4 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle mb-2"></i>
                    <p>Erreur de chargement des contacts</p>
                    <button onclick="loadContacts()" class="mt-2 text-blue-500 hover:underline">
                        Réessayer
                    </button>
                </li>
            `;
        }
    }
}

export async function renderHome() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (!currentUser) {
        router("/login");
        return document.createElement("div");
    }

    const element = document.createElement("div");
    element.innerHTML = `
        <div id="message" class="flex w-screen h-screen overflow-hidden">
            <div id="partie1" class="bg-gray-50 h-full w-[5%] flex flex-col justify-between items-center py-4">
                <div class="flex flex-col items-center space-y-6">
                    <button title="Discussions" class="text-gray-600 hover:text-green-500 text-xl">
                        <i class="fas fa-comments"></i>
                    </button>
                    <button title="Actus" class="text-gray-600 hover:text-green-500 text-xl">
                        <i class="fas fa-newspaper"></i>
                    </button>
                    <button title="Communautés" class="text-gray-600 hover:text-green-500 text-xl">
                        <i class="fas fa-users"></i>
                    </button>
                    <button title="Appels" class="text-gray-600 hover:text-green-500 text-xl">
                        <i class="fas fa-phone"></i>
                    </button>
                </div>
                <div class="flex flex-col items-center space-y-4">
                    <button title="Paramètres" class="text-gray-600 hover:text-green-500 text-xl">
                        <i class="fas fa-cog"></i>
                    </button>
                    <div class="relative">
                        <img src="${currentUser.avatar || generateAvatarUrl(currentUser.name)}" 
                             alt="Profil" 
                             class="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                             title="Mon profil">
                        ${currentUser.isOnline ? '<div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>' : ''}
                    </div>
                    <p class="text-xs text-gray-600 font-medium text-center">Vous</p>
                </div>
            </div>
            
            <!-- PARTIE 2 -->
            <div id="partie2" class="bg-white border-r border-gray-200 flex flex-col h-full w-[30%]">
                <!-- En-tête -->
                <div id="entete" class="p-4 pb-2 flex flex-col bg-white border-b border-gray-100">
                    <div class="flex items-center justify-between mb-3">
                        <h2 class="text-xl font-semibold text-gray-800">WhatsApp</h2>
                        <div class="flex items-center space-x-3">
                            <button id="newDiscussionBtn" title="Nouvelle discussion" 
                                    class="text-gray-600 hover:text-green-500 text-lg transition-colors">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button id="refreshBtn" title="Actualiser" 
                                    class="text-gray-600 hover:text-blue-500 text-lg transition-colors">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button id="logoutBtn" title="Déconnexion" 
                                    class="text-gray-600 hover:text-red-500 text-lg transition-colors">
                                <i class="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>
                    <input id="searchInput" type="text" placeholder="Rechercher un contact ou un numéro"
                        class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
                </div>
                
                <!-- Liste des contacts -->
                <ul id="contactsList" class="overflow-y-auto flex-1 p-0 pr-1"
                    style="scrollbar-width: thin; scrollbar-color: #f3f4f6 transparent;">
                    <li class="p-4 text-center text-gray-500">
                        <i class="fas fa-spinner fa-spin mb-2"></i>
                        <p>Chargement des contacts...</p>
                    </li>
                </ul>
            </div>
        </div>
    `;

    // Ajouter les gestionnaires d'événements
    const searchInput = element.querySelector("#searchInput");
    const refreshBtn = element.querySelector("#refreshBtn");
    const logoutBtn = element.querySelector("#logoutBtn");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            loadContacts(e.target.value.trim());
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            loadContacts();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            router("/login");
        });
    }

    // Charger les contacts initialement
    setTimeout(() => loadContacts(), 100);

    return element;
}