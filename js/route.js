import { renderLogin } from "./login";
import { renderRegister } from "./register";
import { renderHome } from "./home";

const route = {
    "/login": renderLogin,
    "/register": renderRegister,
    "/home": renderHome,
};

export function router(path = "/login") {
    const views = route[path];
    const app = document.querySelector("#app");

    if (!views) {
        app.innerHTML = "<h2>Page non trouvée</h2>"; // ✅ Gestion des erreurs
        return;
    }

    app.innerHTML = ""; // ✅ Nettoyer avant d'ajouter une nouvelle vue
    app.appendChild(views()); // ✅ Afficher la vue demandée
}
