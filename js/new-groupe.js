import { renderNewDiscussion } from "./new-discussion";

export function renderNewGroupe() {
    const container = document.createElement("div");
    container.id = "newGroupForm";
    container.className = "bg-white border-r border-gray-200 flex flex-col h-full w-full p-4";

    container.innerHTML = `
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
                <ul id="contactsList" class="max-h-48 overflow-y-auto border p-2 rounded bg-gray-50 text-sm space-y-1">
                    <!-- Les contacts seront affichés ici -->
                </ul>
            </div>

            <div id="messageContainer" class="text-sm text-red-500 mt-2"></div>

            <button type="submit"
                class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-full transition duration-200">
                Créer le groupe
            </button>
        </form>
    `;

    container.querySelector("#backToNewDiscussionBtn").addEventListener("click", () => {
        const partie2 = document.getElementById("partie2");
        partie2.innerHTML = "";
        partie2.appendChild(renderNewDiscussion());
    });

    container.querySelector("#groupForm").addEventListener("submit", handleNewGroup);

    // Charger la liste des contacts
    loadContactsList();

    return container;
}

async function loadContactsList() {
    const listEl = document.getElementById("contactsList");
    if (!listEl) {
        console.error("Élément DOM 'contactsList' introuvable.");
        return;
    }

    try {
        const response = await fetch("https://json-server-vpom.onrender.com/contacts");
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const contacts = await response.json();
        console.log("Contacts récupérés :", contacts);

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            console.error("Utilisateur connecté introuvable.");
            return;
        }

        listEl.innerHTML = ""; // Réinitialise la liste des contacts

        contacts.forEach(contact => {
            if (!contact.name || !contact.phone) {
                console.warn("Contact invalide :", contact);
                return;
            }

            // Ajouter chaque contact directement dans la liste
            listEl.innerHTML += `
                <li class="flex items-center space-x-2">
                    <input type="checkbox" id="contact-${contact.id}" value="${contact.phone}" class="accent-green-500">
                    <label for="contact-${contact.id}" class="text-gray-700">${contact.name}</label>
                </li>
            `;
        });

        // Ajouter l'utilisateur connecté comme membre par défaut
        const currentUserCheckbox = document.querySelector(`#contact-${currentUser.id}`);
        if (currentUserCheckbox) {
            currentUserCheckbox.checked = true;
            currentUserCheckbox.disabled = true;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des contacts :", error);
        listEl.innerHTML = `<li class="text-red-500">Erreur lors du chargement des contacts.</li>`;
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

        const partie2 = document.getElementById("partie2");
        partie2.innerHTML = "";
        partie2.appendChild(renderNewDiscussion());
    } catch (error) {
        console.error("Erreur lors de l'enregistrement du groupe :", error);
        messageContainer.textContent = "Une erreur est survenue. Veuillez réessayer.";
    }
}
