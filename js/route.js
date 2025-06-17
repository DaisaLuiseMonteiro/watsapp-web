import { renderLogin } from "./login";
import { renderRegister } from "./register";
import { renderHome } from "./home";
import { renderNewDiscussion } from "./new-discussion";
import { renderNewContact } from "./new-contact";
import { renderNewGroupe } from "./new-groupe";
import { renderGroupe } from "./groupe"; // Importer la fonction renderGroupe

const route = {
    "/login": renderLogin,
    "/register": renderRegister,
    "/home": renderHome,
    "/newDiscussion": renderNewDiscussion,
    "/new-contact": renderNewContact,
    "/new-groupe": renderNewGroupe,
    "/groupe": renderGroupe, // Ajouter la route pour la page Groupe
};

export function router(path = "/login") {
    const views = route[path];
    const app = document.getElementById("app");

    if (!views) {
        console.error("Route introuvable :", path);
        return;
    }

    app.innerHTML = "";
    app.appendChild(views());
}