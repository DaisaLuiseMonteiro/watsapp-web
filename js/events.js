import { router } from "./route";
import { loadContacts } from "./home";

export function setupFilterEvents() {
    const filterButtons = document.querySelectorAll(".px-4 .py-2 .border-b .border-gray-200 button");

    filterButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const filterType = event.target.textContent.trim();

            switch (filterType) {
                case "Groupes":
                    router("/groupe");
                    break;
                case "Favoris":
                    loadContacts("favoris");
                    break;
                case "Toutes":
                    loadContacts("toutes");
                    break;
                case "Non lues":
                    loadContacts("non-lues");
                    break;
                default:
                    console.error("Filtre inconnu :", filterType);
            }
        });
    });
}