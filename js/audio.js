import { router } from "./route";

export function renderAudio() {
    const element = document.createElement("div");
    element.innerHTML = `
        <div class="flex flex-col items-center justify-center h-screen bg-gray-100 overflow-hidden">
            <div class="bg-white p-6 rounded-lg w-full max-w-sm text-center shadow-lg relative">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp Logo" class="w-16 mx-auto mb-4">
                <h2 id="formTitle" class="text-xl font-semibold mb-2">Enregistrement vocal</h2>
                <p id="formDescription" class="text-gray-600 text-sm mb-4">Appuyez sur le bouton pour enregistrer</p>

                <button id="recordButton" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
                    <i class="fas fa-microphone text-lg"></i> Appuyer pour parler
                </button>

                <audio id="audioPreview" class="mt-4 w-full hidden" controls></audio>

                <!-- Pop-up de message -->
                <div id="popupMessage" class="absolute left-0 right-0 mx-auto mt-2 px-4 py-2 rounded-lg shadow-lg opacity-0 transition-opacity duration-500 hidden max-w-sm w-full text-white text-sm font-medium text-center">
                    <span id="popupText"></span>
                </div>
            </div>
        </div>
    `;

    element.querySelector("#recordButton").addEventListener("mousedown", startRecording);
    element.querySelector("#recordButton").addEventListener("mouseup", stopRecording);

    return element;
}

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// Démarrer l'enregistrement vocal
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            isRecording = true;
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                saveAudioMessage(audioUrl);
            };
        })
        .catch(error => console.error("Erreur d'accès au micro :", error));
}

// Arrêter l'enregistrement vocal
function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
    }
}

// Sauvegarder le message vocal
async function saveAudioMessage(audioUrl) {
    const receiverId = window.currentChatUserId; // ID du contact en cours
    if (!receiverId) return;

    const audioMessage = {
        senderId: "currentUser",
        receiverId,
        content: audioUrl,
        timestamp: Date.now(),
        type: "audio"
    };

    await fetch("https://json-server-vpom.onrender.com/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(audioMessage)
    });

    showMessage("Message vocal envoyé !", "success");
    loadMessages(receiverId);
}

function showMessage(message, type = "success") {
    const popup = document.getElementById("popupMessage");
    const text = document.getElementById("popupText");

    text.textContent = message;

    popup.classList.remove("bg-red-500", "bg-green-500", "hidden", "opacity-0");
    popup.classList.add(type === "success" ? "bg-green-500" : "bg-red-500", "opacity-100");

    setTimeout(() => {
        popup.classList.remove("opacity-100");
        popup.classList.add("opacity-0");
        setTimeout(() => popup.classList.add("hidden"), 500);
    }, 3000);
}
