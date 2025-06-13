import { router } from "./route";

export function renderGroupe() {
    const element = document.createElement("div");
    element.innerHTML = `
        <div class="bg-white border-r border-gray-200 flex flex-col h-full w-full">
            <div id="entete" class="p-4 pb-2 flex flex-col bg-white">
                <h2 class="text-xl font-semibold text-gray-800">Groupes</h2>
            </div>
            <ul id="groupsList" class="overflow-y-auto flex-1 p-2"
                style="scrollbar-width: thin; scrollbar-color: #f3f4f6 transparent;"></ul>
        </div>
    `;

    loadGroups();

    return element;
}

// Fonction pour charger les groupes depuis l'API
async function loadGroups() {
    try {
        const response = await fetch("https://json-server-vpom.onrender.com/groups");
        const groups = await response.json();
        const groupsList = document.getElementById("groupsList");

        groupsList.innerHTML = ""; // Vider la liste des groupes

        groups.forEach(group => {
            const li = document.createElement("li");
            li.className = "flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer";
            li.innerHTML = `
                <img src="${group.avatar || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">${group.name}</p>
                    <p class="text-sm text-gray-500">Membres: ${group.members.length}</p>
                </div>
            `;

            li.addEventListener("click", () => {
                console.log(`Groupe sélectionné : ${group.name}`);
                // Ajoutez ici la logique pour ouvrir le chat du groupe
            });

            groupsList.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur chargement groupes :", error);
    }
}
