(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function s(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=s(e);fetch(e.href,t)}})();function a(){const o=document.createElement("div");return o.innerHTML=`
        <h2>Inscription</h2>
        <form id="registerForm">
            <label for="newEmail">Email :</label>
            <input type="email" id="newEmail" required>
            
            <label for="newPassword">Mot de passe :</label>
            <input type="password" id="newPassword" required>
            
            <button type="submit">S'inscrire</button>
        </form>
        <p id="registerMessage"></p>
        <a href="#" id="loginLink">Retour à la connexion</a>
    `,o.querySelector("#registerForm").addEventListener("submit",u),o.querySelector("#loginLink").addEventListener("click",r=>{r.preventDefault(),l("/login")}),o}async function u(o){o.preventDefault();const r=document.getElementById("newEmail").value,s=document.getElementById("newPassword").value,n=document.getElementById("registerMessage");try{if((await(await fetch("http://localhost:3000/users")).json()).some(c=>c.email===r)){n.textContent="Cet email est déjà utilisé.",n.style.color="red";return}await fetch("http://localhost:3000/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:r,password:s})}),n.textContent="Inscription réussie !",n.style.color="green",setTimeout(()=>l("/login"),2e3)}catch(e){console.error("Erreur lors de l'inscription :",e),n.textContent="Erreur serveur.",n.style.color="red"}}const d={"/login":a};function l(o="/login"){const r=d[o];document.querySelector("#app").appendChild(r())}document.addEventListener("DOMContentLoaded",()=>{l("/login")});
