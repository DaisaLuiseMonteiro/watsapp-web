import { renderLogin } from "./login";
import { renderRegister } from "./register";
import { renderHome } from "./home";
import { renderNewDiscussion } from "./new-discussion";
import { renderNewContact } from "./new-contact";
// import { renderNewGroup } from "./new-groupe";

const route = {
    "/login": renderLogin,
    "/register": renderRegister,
    "/home": renderHome,
    "/newDiscussion": renderNewDiscussion,
    "/new-contact": renderNewContact,
    // "/new-groupe": renderNewGroup, 
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