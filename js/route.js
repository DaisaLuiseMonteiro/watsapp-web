import { renderLogin } from "./login";
import { renderRegister } from "./register";
import { renderHome } from "./home";
import { renderNewDiscussion } from "./new-discussion"; 
import { renderGroupe } from "./groupe"; 

const route = {
    "/login": renderLogin,
    "/register": renderRegister,
    "/home": renderHome,
    "/newDiscussion": renderNewDiscussion,
    "/groupe": renderGroupe, 
};

export function router(path = "/login") {
    const views = route[path];
    const app = document.querySelector("#app");

    if (!views) {
        console.error("Route introuvable :", path);
        return;
    }

    app.innerHTML = "";
    app.appendChild(views());
}