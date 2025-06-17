import { renderNewDiscussion } from "./new-discussion";

export function renderNewGroupe() {
    const partie2 = document.getElementById("partie2");
    if (!partie2) {
        console.error("Élément 'partie2' introuvable.");
        return;
    }

    partie2.innerHTML = `
        <!-- FORMULAIRE DE NOUVEAU GROUPE -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <button id="backToNewDiscussionBtn" class="text-gray-600 hover:text-green-500 text-lg">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2 class="text-xl font-semibold text-gray-800">Nouveau groupe</h2>
            </div>
        </div>

        <form id="groupForm" class="flex flex-col space-y-4">
            <div>
                <label for="groupName" class="block text-sm text-gray-700 mb-1">Nom du groupe <span class="text-red-500">*</span></label>
                <input type="text" id="groupName" name="groupName" required
                    class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
            </div>

            <div>
                <label for="groupDesc" class="block text-sm text-gray-700 mb-1">Description <span class="text-red-500">*</span></label>
                <textarea id="groupDesc" name="groupDesc" rows="2" required
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"></textarea>
            </div>

            <div>
                <label class="block text-sm text-gray-700 mb-2">Membres du groupe <span class="text-red-500">*</span></label>
                <p class="text-sm text-gray-500 mb-2">Liste des contacts :</p>
                <div id="loadingContacts" class="text-sm text-blue-500 mb-2">Chargement des contacts...</div>
                <ul id="contactsList" class="max-h-48 overflow-y-auto border p-2 rounded bg-gray-50 text-sm space-y-1 hidden">
                    <!-- Les contacts seront affichés ici -->
                </ul>
                <div id="contactsError" class="text-sm text-red-500 mb-2 hidden"></div>
            </div>

            <div id="messageContainer" class="text-sm text-red-500 mt-2"></div>

            <button type="submit"
                class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-full transition duration-200">
                Créer le groupe
            </button>
        </form>
    `;

    // Ajouter les event listeners
    partie2.querySelector("#backToNewDiscussionBtn").addEventListener("click", () => {
        const partie2 = document.getElementById("partie2");
        partie2.innerHTML = "";
        partie2.appendChild(renderNewDiscussion());
    });

    partie2.querySelector("#groupForm").addEventListener("submit", handleNewGroup);

    // Charger la liste des contacts après que le container soit ajouté au DOM
    setTimeout(() => {
        loadContactsList();
    }, 100);
}

async function loadContactsList() {
    const listEl = document.getElementById("contactsList");
    const loadingEl = document.getElementById("loadingContacts");
    const errorEl = document.getElementById("contactsError");
    
    if (!listEl) {
        console.error("Élément DOM 'contactsList' introuvable.");
        return;
    }

    try {
        // Afficher le loading
        if (loadingEl) loadingEl.classList.remove("hidden");
        if (errorEl) errorEl.classList.add("hidden");
        listEl.classList.add("hidden");

        console.log("Début du chargement des contacts...");
        
        const response = await fetch("https://json-server-vpom.onrender.com/contacts");
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const contacts = await response.json();
        console.log("Contacts récupérés :", contacts);

        // Vérifier si on a des contacts
        if (!contacts || contacts.length === 0) {
            throw new Error("Aucun contact trouvé");
        }

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            throw new Error("Utilisateur non connecté");
        }

        // Masquer le loading et afficher la liste
        if (loadingEl) loadingEl.classList.add("hidden");
        listEl.classList.remove("hidden");
        listEl.innerHTML = ""; // Réinitialise la liste des contacts

        let contactsAdded = 0;

        contacts.forEach((contact, index) => {
            if (!contact.name || !contact.phone) {
                console.warn("Contact invalide :", contact);
                return;
            }

            // Créer l'élément li
            const listItem = document.createElement("li");
            listItem.className = "flex items-center space-x-2";
            
            listItem.innerHTML = `
                <input type="checkbox" id="contact-${contact.id || index}" value="${contact.phone}" class="accent-green-500">
                <label for="contact-${contact.id || index}" class="text-gray-700">${contact.name} (${contact.phone})</label>
            `;

            listEl.appendChild(listItem);
            contactsAdded++;
        });

        console.log(`${contactsAdded} contacts ajoutés à la liste`);

        // Cocher l'utilisateur connecté par défaut (si il existe dans la liste)
        const currentUserCheckbox = document.querySelector(`input[value="${currentUser.phone}"]`);
        if (currentUserCheckbox) {
            currentUserCheckbox.checked = true;
            currentUserCheckbox.disabled = true;
            console.log("Utilisateur connecté coché par défaut");
        } else {
            console.log("L'utilisateur connecté n'est pas dans la liste des contacts");
        }

        // Si aucun contact n'a été ajouté
        if (contactsAdded === 0) {
            listEl.innerHTML = `<li class="text-gray-500 italic">Aucun contact disponible</li>`;
        }

    } catch (error) {
        console.error("Erreur lors de la récupération des contacts :", error);
        
        // Masquer le loading et afficher l'erreur
        if (loadingEl) loadingEl.classList.add("hidden");
        if (errorEl) {
            errorEl.textContent = `Erreur: ${error.message}`;
            errorEl.classList.remove("hidden");
        }
        
        listEl.classList.remove("hidden");
        listEl.innerHTML = `<li class="text-red-500">Erreur lors du chargement des contacts: ${error.message}</li>`;
    }
}

async function handleNewGroup(event) {
    event.preventDefault();

    const name = document.getElementById("groupName").value.trim();
    const description = document.getElementById("groupDesc").value.trim();
    const contactCheckboxes = document.querySelectorAll("#contactsList input[type='checkbox']:checked");
    const selectedPhones = Array.from(contactCheckboxes).map(cb => cb.value);

    const messageContainer = document.getElementById("messageContainer");
    messageContainer.textContent = "";

    // Validation : Vérifiez que le nom du groupe est renseigné
    if (!name) {
        messageContainer.textContent = "Veuillez saisir un nom de groupe.";
        return;
    }

    // Validation : Vérifiez que la description est renseignée
    if (!description) {
        messageContainer.textContent = "Veuillez saisir une description pour le groupe.";
        return;
    }

    // Validation : Vérifiez qu'il y a au moins 2 membres
    if (selectedPhones.length < 2) {
        messageContainer.textContent = "Un groupe doit avoir au moins 2 membres.";
        return;
    }

    try {
        const response = await fetch("https://json-server-vpom.onrender.com/groups");
        const groups = await response.json();

        const groupExists = groups.some(group => group.name.toLowerCase() === name.toLowerCase());
        if (groupExists) {
            messageContainer.textContent = "Un groupe avec ce nom existe déjà.";
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }
        if (!selectedPhones.includes(currentUser.phone)) {
            selectedPhones.push(currentUser.phone);
        }

        const initials = name
            .split(" ")
            .map(word => word.charAt(0).toUpperCase())
            .join("")
            .substring(0, 2);
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=25d366&color=fff`;

        const newGroup = {
            id: `group${groups.length + 1}`,
            name,
            description, // Ajout de la description
            avatar: avatarUrl,
            members: selectedPhones,
            createdAt: Date.now(),
            lastMessage: "Bienvenue dans le groupe !",
            lastMessageTime: Date.now(),
        };

        const saveResponse = await fetch("https://json-server-vpom.onrender.com/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newGroup),
        });

        if (!saveResponse.ok) {
            throw new Error("Erreur lors de l'enregistrement du groupe.");
        }

        console.log("Groupe créé avec succès:", newGroup);
        
        const partie2 = document.getElementById("partie2");
        partie2.innerHTML = "";
        partie2.appendChild(renderNewDiscussion());
        
    } catch (error) {
        console.error("Erreur lors de l'enregistrement du groupe :", error);
        messageContainer.textContent = "Une erreur est survenue. Veuillez réessayer.";
    }
}