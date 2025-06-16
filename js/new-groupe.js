// import { renderNewDiscussion } from "./new-discussion";

// export function renderNewGroupe() {
//     const partie2 = document.getElementById("partie2");
//     if (!partie2) {
//         console.error("Élément 'partie2' introuvable.");
//         return;
//     }

//     partie2.innerHTML = `
//         <!-- FORMULAIRE DE NOUVEAU GROUPE -->
//         <div id="newGroupForm" class="bg-white border-r border-gray-200 flex flex-col h-full w-full p-4">
//             <!-- En-tête -->
//             <div class="flex items-center justify-between mb-4">
//                 <div class="flex items-center space-x-3">
//                     <button id="backToNewDiscussionBtn" class="text-gray-600 hover:text-green-500 text-lg">
//                         <i class="fas fa-arrow-left"></i>
//                     </button>
//                     <h2 class="text-xl font-semibold text-gray-800">Nouveau groupe</h2>
//                 </div>
//             </div>

//             <form id="groupForm" class="flex flex-col space-y-4">
//                 <div>
//                     <label for="groupName" class="block text-sm text-gray-700 mb-1">Nom du groupe</label>
//                     <input type="text" id="groupName" name="groupName" required
//                         class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm">
//                 </div>

//                 <div>
//                     <label for="groupDesc" class="block text-sm text-gray-700 mb-1">Description</label>
//                     <textarea id="groupDesc" name="groupDesc" rows="2"
//                         class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm"></textarea>
//                 </div>

//                 <div>
//                     <label class="block text-sm text-gray-700 mb-2">Membres du groupe</label>
//                     <ul id="contactsList" class="max-h-48 overflow-y-auto border p-2 rounded bg-gray-50 text-sm space-y-1">
//                         <li>Chargement des contacts...</li>
//                     </ul>
//                 </div>

//                 <button type="submit"
//                     class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-full transition duration-200">
//                     Créer le groupe
//                 </button>
//             </form>
//         </div>
//     `;

//     partie2.querySelector("#backToNewDiscussionBtn").addEventListener("click", () => {
//         renderNewDiscussion();
//     });

//     partie2.querySelector("#groupForm").addEventListener("submit", handleNewGroup);

//     loadContactsList(); // charger les contacts à afficher
// }

// async function loadContactsList() {
//     const listEl = document.getElementById("contactsList");
//     try {
//         const response = await fetch("https://json-server-vpom.onrender.com/contacts");
//         const contacts = await response.json();

//         listEl.innerHTML = "";
//         contacts.forEach(contact => {
//             const li = document.createElement("li");
//             li.className = "flex items-center space-x-2";

//             const checkbox = document.createElement("input");
//             checkbox.type = "checkbox";
//             checkbox.id = `contact-${contact.id}`;
//             checkbox.value = contact.id;
//             checkbox.className = "accent-green-500";

//             const label = document.createElement("label");
//             label.htmlFor = checkbox.id;
//             label.textContent = contact.name;

//             li.appendChild(checkbox);
//             li.appendChild(label);
//             listEl.appendChild(li);
//         });
//     } catch (error) {
//         listEl.innerHTML = `<li class="text-red-500">Erreur lors du chargement des contacts.</li>`;
//         console.error("Erreur de chargement des contacts :", error);
//     }
// }

// async function handleNewGroup(event) {
//     event.preventDefault();

//     const name = document.getElementById("groupName").value.trim();
//     const description = document.getElementById("groupDesc").value.trim();
//     const contactCheckboxes = document.querySelectorAll("#contactsList input[type='checkbox']:checked");
//     const selectedIds = Array.from(contactCheckboxes).map(cb => parseInt(cb.value));

//     const messageContainer = document.createElement("div");
//     messageContainer.id = "messageContainer";
//     messageContainer.className = "text-sm text-red-500 mt-2";

//     const existingMessage = document.getElementById("messageContainer");
//     if (existingMessage) existingMessage.remove();

//     if (!name || selectedIds.length === 0) {
//         messageContainer.textContent = "Veuillez saisir un nom de groupe et sélectionner au moins un membre.";
//         document.getElementById("groupForm").appendChild(messageContainer);
//         return;
//     }

//     const newGroup = {
//         id: Date.now().toString(),
//         name,
//         description,
//         members: selectedIds
//     };

//     try {
//         const response = await fetch("https://json-server-vpom.onrender.com/groups", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(newGroup)
//         });

//         if (!response.ok) {
//             throw new Error("Erreur lors de l'enregistrement du groupe.");
//         }

//         const partie2 = document.getElementById("partie2");
//         if (partie2) {
//             partie2.innerHTML = "";
//             partie2.appendChild(renderNewDiscussion());
//         }
//     } catch (error) {
//         console.error("Erreur lors de l'enregistrement du groupe :", error);
//         messageContainer.textContent = "Une erreur est survenue. Veuillez réessayer.";
//         document.getElementById("groupForm").appendChild(messageContainer);
//     }
// }
