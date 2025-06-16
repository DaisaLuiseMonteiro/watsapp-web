import { renderNewDiscussion } from "./new-discussion";

export function renderNewContact() {
    const partie2 = document.getElementById("partie2"); // Cibler la partie 2
    if (!partie2) {
        console.error("Élément 'partie2' introuvable.");
        return;
    }

    partie2.innerHTML = `
        <!-- FORMULAIRE DE NOUVEAU CONTACT -->
        <div id="newContactForm" class="bg-white border-r border-gray-200 flex flex-col h-full w-full p-4">
            <!-- En-tête -->
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <button id="backToNewDiscussionBtn" class="text-gray-600 hover:text-green-500 text-lg">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2 class="text-xl font-semibold text-gray-800">Nouveau contact</h2>
                </div>
            </div>

            <!-- Formulaire -->
            <form id="contactForm" class="flex flex-col space-y-4">
                <div>
                    <label for="contactName" class="block text-sm text-gray-700 mb-1">Nom</label>
                    <input type="text" id="contactName" name="contactName" required
                        class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
                </div>

                <div>
                    <label for="contactPhone" class="block text-sm text-gray-700 mb-1">Numéro de téléphone</label>
                    <input type="tel" id="contactPhone" name="contactPhone" required
                        class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
                </div>

                <!-- Bouton de soumission -->
                <button type="submit"
                    class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-full transition duration-200">
                    Enregistrer
                </button>
            </form>
        </div>
    `;

    // Gestionnaire pour le bouton de retour
    partie2.querySelector("#backToNewDiscussionBtn").addEventListener("click", () => {
        renderNewDiscussion(); // Charger la page Nouvelle discussion
    });

    // Gestionnaire pour soumettre le formulaire
    partie2.querySelector("#contactForm").addEventListener("submit", handleNewContact);
}

// Fonction pour gérer l'enregistrement d'un nouveau contact
async function handleNewContact(event) {
    event.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";
    messageContainer.className = "text-sm text-red-500 mt-2";

    // Supprimer les anciens messages d'erreur
    const existingMessage = document.getElementById("messageContainer");
    if (existingMessage) existingMessage.remove();

    // Vérification des champs obligatoires
    if (!name || !phone) {
        messageContainer.textContent = "Veuillez remplir tous les champs obligatoires.";
        document.getElementById("contactForm").appendChild(messageContainer);
        return;
    }

    // Vérification que le numéro contient uniquement des chiffres
    if (!/^\d+$/.test(phone)) {
        messageContainer.textContent = "Le numéro de téléphone doit contenir uniquement des chiffres.";
        document.getElementById("contactForm").appendChild(messageContainer);
        return;
    }

    try {
        // Récupérer les contacts existants
        const response = await fetch("https://json-server-vpom.onrender.com/contacts");
        const contacts = await response.json();

        // Vérifier si le numéro de téléphone existe déjà
        const phoneExists = contacts.some(contact => contact.phone === phone);
        if (phoneExists) {
            messageContainer.textContent = "Ce numéro de téléphone est déjà enregistré.";
            document.getElementById("contactForm").appendChild(messageContainer);
            return;
        }

        // Vérifier si le nom existe déjà
        let uniqueName = name;
        const nameExists = contacts.some(contact => contact.name === name);
        if (nameExists) {
            uniqueName = `${name}2`; // Ajouter "2" au nom
        }

        // Générer un avatar basé sur les initiales
        const initials = uniqueName
            .split(" ")
            .map(word => word.charAt(0).toUpperCase())
            .join("")
            .substring(0, 2); // Maximum 2 initiales
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=25d366&color=fff`;

        // Créer un nouvel objet contact
        const newContact = {
            id: Date.now().toString(),
            name: uniqueName,
            phone,
            avatar: avatarUrl,
            isOnline: false,
        };

        // Enregistrer le contact dans JSON Server
        const saveResponse = await fetch("https://json-server-vpom.onrender.com/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newContact),
        });

        if (!saveResponse.ok) {
            throw new Error("Erreur lors de l'enregistrement du contact.");
        }

        // Rediriger directement vers la page Nouvelle discussion
        const partie2 = document.getElementById("partie2");
        if (partie2) {
            partie2.innerHTML = ""; // Vider la partie 2
            partie2.appendChild(renderNewDiscussion()); // Charger la page Nouvelle discussion
        }
    } catch (error) {
        console.error("Erreur lors de l'enregistrement du contact :", error);
        messageContainer.textContent = "Une erreur est survenue. Veuillez réessayer.";
        document.getElementById("contactForm").appendChild(messageContainer);
    }
}