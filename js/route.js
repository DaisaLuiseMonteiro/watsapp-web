import { renderLogin } from "./login";
import { renderRegister } from "./register";
import { renderHome } from "./home";
import { renderNewDiscussion } from "./new-discussion";
import { renderNewContact } from "./new-contact";
import { renderNewGroupe } from "./new-groupe";

const route = {
    "/login": renderLogin,
    "/register": renderRegister,
    "/home": renderHome,
    "/newDiscussion": renderNewDiscussion,
    "/new-contact": renderNewContact,
    "/new-groupe": renderNewGroupe, 
};

export function router(path = "/login") {
    const views = route[path];
    const partie2 = document.getElementById("partie2");

    if (!views) {
        console.error("Route introuvable :", path);
        return;
    }

    if (path === "/new-groupe" && partie2) {
        // Mettre à jour uniquement la partie 2 pour "Nouveau groupe"
        partie2.innerHTML = "";
        partie2.appendChild(views());
    } else {
        const app = document.querySelector("#app");
        app.innerHTML = "";
        app.appendChild(views());
    }
}