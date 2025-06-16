import { renderNewDiscussion } from "./new-discussion";

export function renderNewGroup() {
    const partie2 = document.getElementById("partie2"); 
    if (!partie2) {
        console.error("Élément 'partie2' introuvable.");
        return;
    }

    partie2.innerHTML = `
        <!-- FORMULAIRE DE CRÉATION DE GROUPE -->
        <div id="newGroupForm" class="bg-white border-l border-gray-200 flex flex-col h-full w-full p-4">
            <!-- En‑tête -->
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-800">Nouveau groupe</h2>
                <button id="closeGroupFormBtn" title="Fermer" class="text-gray-600 hover:text-red-500 text-lg">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Formulaire -->
            <form id="groupForm" class="flex flex-col space-y-4">
                <div>
                    <label for="groupName" class="block text-sm text-gray-700 mb-1">Nom du groupe</label>
                    <input type="text" id="groupName" name="groupName" required
                        class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
                </div>
                <div>
                    <label for="groupDesc" class="block text-sm text-gray-700 mb-1">Description (optionnelle)</label>
                    <textarea id="groupDesc" name="groupDesc" rows="2"
                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"></textarea>
                </div>

                <!-- Liste des contacts chargés via fetch -->
                <div>
                    <h3 class="text-sm font-medium text-gray-800 mb-2">Sélectionner les membres :</h3>
                    <ul id="contactsCheckboxes" class="max-h-48 overflow-y-auto border p-2 rounded bg-gray-50">
                        <!-- Les items seront insérés ici via JS -->
                    </ul>
                </div>

                <button type="submit"
                    class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-full transition duration-200">
                    Créer le groupe
                </button>
            </form>
        </div>
    `;

    // Gestionnaire pour fermer le formulaire
    document.getElementById("closeGroupFormBtn").addEventListener("click", () => {
        renderNewDiscussion(); // Retourner à la page Nouvelle discussion
    });

    // Charger les contacts et gérer la soumission du formulaire
    loadContacts();
    document.getElementById("groupForm").addEventListener("submit", handleGroupCreation);
}

// Charger les contacts depuis le serveur JSON
async function loadContacts() {
    const contactsCheckboxes = document.getElementById("contactsCheckboxes");
    contactsCheckboxes.innerHTML = '<li>Chargement…</li>';

    try {
        const response = await fetch("https://json-server-vpom.onrender.com/contacts");
        const contacts = await response.json();
        const currentUser = JSON.parse(localStorage.getItem("currentUser")); // Utilisateur connecté

        contactsCheckboxes.innerHTML = "";

        contacts.forEach(contact => {
            const li = document.createElement("li");
            li.className = "flex items-center py-1";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `c_${contact.id}`;
            checkbox.value = contact.phone; // Utiliser le numéro de téléphone comme valeur
            checkbox.className = "mr-2";

            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = contact.name;

            // Si c'est l'utilisateur connecté, cocher par défaut et désactiver
            if (contact.phone === currentUser.phone) {
                checkbox.checked = true;
                checkbox.disabled = true;
            }

            li.append(checkbox, label);
            contactsCheckboxes.appendChild(li);
        });
    } catch (error) {
        contactsCheckboxes.innerHTML = '<li class="text-red-500">Erreur de chargement</li>';
        console.error("Erreur lors du chargement des contacts :", error);
    }
}

// Gérer la soumission du formulaire de création de groupe
async function handleGroupCreation(event) {
    event.preventDefault();

    const name = document.getElementById("groupName").value.trim();
    const description = document.getElementById("groupDesc").value.trim();
    const selected = Array.from(document.querySelectorAll("#contactsCheckboxes input:checked"))
        .map(cb => cb.value);

    // Vérifier qu'il y a au moins 2 membres
    if (selected.length < 2) {
        alert("Un groupe doit avoir au moins 2 membres.");
        return;
    }

    try {
        // Vérifier si un groupe avec le même nom existe déjà
        const response = await fetch("https://json-server-vpom.onrender.com/groups");
        const groups = await response.json();
        const groupExists = groups.some(group => group.name.toLowerCase() === name.toLowerCase());

        if (groupExists) {
            alert("Un groupe avec ce nom existe déjà.");
            return;
        }

        // Créer le groupe
        const newGroup = {
            id: `group${groups.length + 1}`,
            name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=25d366&color=fff`,
            members: selected,
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
            throw new Error("Erreur lors de la création du groupe.");
        }

        alert("Groupe créé avec succès !");
        renderNewDiscussion(); // Retourner à la page Nouvelle discussion
    } catch (error) {
        console.error("Erreur lors de la création du groupe :", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
}