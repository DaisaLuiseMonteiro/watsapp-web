window.contacts = {
  renderContactsList() {
    const contactsContainer = window.utils.createElement("div", {
      class: "h-full flex flex-col",
    })
    const header = window.utils.createElement(
      "div",
      {
        class: "bg-gray-100 p-4 border-b",
      },
      [
        window.utils.createElement(
          "h3",
          {
            class: "text-lg font-semibold text-gray-800",
          },
          "Nouveau chat",
        ),
        window.utils.createElement(
          "p",
          {
            class: "text-sm text-gray-600 mt-1",
          },
          "Entrez un numéro de téléphone pour commencer",
        ),
      ],
    )
    const searchContainer = window.utils.createElement("div", {
      class: "p-4 border-b",
    })
    const searchForm = window.utils.createElement("form", {
      onSubmit: (e) => {
        e.preventDefault()
        this.handleContactSearch()
      },
    })

    const searchInput = window.utils.createElement(
      "div",
      {
        class: "flex space-x-2",
      },
      [
        window.utils.createElement("input", {
          id: "contact-search",
          type: "tel",
          class:
            "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
          placeholder: "Numéro de téléphone...",
        }),
        window.utils.createElement(
          "button",
          {
            type: "submit",
            class: "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200",
          },
          [
            window.utils.createElement("i", {
              class: "fas fa-search",
            }),
          ],
        ),
      ],
    )
    searchForm.appendChild(searchInput)
    searchContainer.appendChild(searchForm)

    const resultContainer = window.utils.createElement("div", {
      id: "contact-results",
      class: "flex-1 overflow-y-auto",
    })
    contactsContainer.appendChild(header)
    contactsContainer.appendChild(searchContainer)
    contactsContainer.appendChild(resultContainer)
    return contactsContainer
  },
  async handleContactSearch() {
    const searchInput = document.getElementById("contact-search")
    const phone = window.utils.formatPhone(searchInput.value)
    if (phone.length < 8) {
      alert("Veuillez entrer un numéro de téléphone valide")
      return
    }
    if (phone === window.auth.currentUser.phone) {
      alert("Vous ne pouvez pas vous envoyer un message à vous-même")
      return
    }
    const resultsContainer = document.getElementById("contact-results")
    resultsContainer.innerHTML = ""

    const user = await window.api.getUser(phone)
    if (user) {
      const contactItem = this.renderContactItem(user)
      resultsContainer.appendChild(contactItem)
    } else {
      const noResult = window.utils.createElement(
        "div",
        {
          class: "p-4 text-center text-gray-500",
        },
        [
          window.utils.createElement("i", {
            class: "fas fa-user-slash text-3xl mb-2",
          }),
          window.utils.createElement("p", {}, "Aucun utilisateur trouvé avec ce numéro"),
          window.utils.createElement(
            "p",
            {
              class: "text-sm mt-1",
            },
            "Invitez-le à rejoindre WhatsApp",
          ),
        ],
      )
      resultsContainer.appendChild(noResult)
    }
  },
  renderContactItem(user) {
    return window.utils.createElement(
      "div",
      {
        class: "p-4 hover:bg-gray-50 cursor-pointer border-b transition duration-200",
        onClick: () => this.startChat(user),
      },
      [
        window.utils.createElement(
          "div",
          {
            class: "flex items-center space-x-3",
          },
          [
            window.utils.createElement("img", {
              src: user.avatar,
              alt: user.name,
              class: "w-12 h-12 rounded-full",
            }),
            window.utils.createElement(
              "div",
              {
                class: "flex-1",
              },
              [
                window.utils.createElement(
                  "h4",
                  {
                    class: "font-semibold text-gray-900",
                  },
                  user.name,
                ),
                window.utils.createElement(
                  "p",
                  {
                    class: "text-sm text-gray-600",
                  },
                  user.status,
                ),
                window.utils.createElement(
                  "p",
                  {
                    class: "text-xs text-gray-500 mt-1",
                  },
                  user.phone,
                ),
              ],
            ),
            window.utils.createElement(
              "div",
              {
                class: "text-green-500",
              },
              [
                window.utils.createElement("i", {
                  class: user.isOnline ? "fas fa-circle text-xs" : "far fa-circle text-xs",
                }),
              ],
            ),
          ],
        ),
      ],
    )
  },
  async startChat(contact) {
    const participants = [window.auth.currentUser.id, contact.id]
    const chat = await window.api.createOrGetChat(participants)
    if (chat) {
      window.chatModule.setActiveChat(chat, contact)
      document.getElementById("right-panel").innerHTML = ""
      document.getElementById("right-panel").appendChild(window.chatModule.renderChatInterface())
    }
  },
}
export function renderGroupe() {
  const groupeElement = document.createElement("div");
  groupeElement.innerHTML = `
      <div id="groupePage" class="bg-white border-r border-gray-200 flex flex-col h-full w-full">
          <div id="entete" class="p-4 pb-2 flex flex-col bg-white">
              <div class="flex items-center space-x-3">
                  <button id="backToHomeBtn" class="text-gray-600 hover:text-green-500 text-lg">
                      <i class="fas fa-arrow-left"></i>
                  </button>
                  <h2 class="text-xl font-semibold text-gray-800">Groupes</h2>
              </div>
          </div>
          <ul id="groupsList" class="overflow-y-auto flex-1 p-2"
              style="scrollbar-width: thin; scrollbar-color: #f3f4f6 transparent; max-height: calc(100vh - 200px);"></ul>
      </div>
  `;
  loadGroups();
  groupeElement.querySelector("#backToHomeBtn").addEventListener("click", () => {
      router("/home"); 
  });
  return groupeElement;
}
async function loadGroups() {
  try {
      const response = await fetch("https://json-server-vpom.onrender.com/groups");
      const groups = await response.json();
      const messagesResponse = await fetch("https://json-server-vpom.onrender.com/messages");
      const messages = await messagesResponse.json();
      const groupsList = document.getElementById("groupsList");

      groupsList.innerHTML = ""; 

      groups.forEach(group => {
          const groupMessages = messages.filter(msg => msg.groupId === group.id);
          const lastMessage = groupMessages[groupMessages.length - 1];
          const lastMessageText = lastMessage ? `${lastMessage.senderName}: ${lastMessage.content}` : "Aucun message";
          const lastTime = lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
          const li = document.createElement("li");
          li.className = "flex items-center justify-between space-x-2 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";

          li.innerHTML = `
              <img src="${group.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
              <div class="flex-1 min-w-0 ml-3">
                  <div class="flex justify-between items-center">
                      <p class="font-semibold text-gray-900 truncate">${group.name}</p>
                      <span class="text-xs text-gray-400">${lastTime}</span>
                  </div>
                  <p class="text-sm text-gray-500 truncate">${lastMessageText}</p>
              </div>
          `;

          li.addEventListener("click", () => openGroupChat(group)); 
                    groupsList.appendChild(li);
      });
  } catch (error) {
      console.error("Erreur chargement groupes :", error);
  }
}

function openGroupChat(group) {
  const header = document.getElementById("chatHeader");
  const messagesDiv = document.getElementById("messages");
  const messageInputArea = document.getElementById("messageInputArea");

  header.classList.remove("hidden");
  messageInputArea.classList.remove("hidden");

  header.innerHTML = `
      <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-3">
              <img src="${group.avatar || 'https://via.placeholder.com/50'}" class="w-10 h-10 rounded-full object-cover">
              <div>
                  <p class="font-semibold text-gray-900">${group.name}</p>
              </div>
          </div>
          <div class="flex items-center space-x-4 text-gray-600">
              <i class="fas fa-search cursor-pointer"></i>
              <i class="fas fa-ellipsis-v cursor-pointer"></i>
          </div>
      </div>
  `;

  messagesDiv.innerHTML = "";
  loadGroupMessages(group.id); 
}

async function loadGroupMessages(groupId) {
  try {
      const response = await fetch("https://json-server-vpom.onrender.com/messages");
      const allMessages = await response.json();
      const messagesDiv = document.getElementById("messages");

      messagesDiv.innerHTML = "";

      allMessages
          .filter(msg => msg.groupId === groupId)
          .sort((a, b) => a.timestamp - b.timestamp)
          .forEach(msg => {
              const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const div = document.createElement("div");
              div.className = `flex ${msg.senderId === "currentUser" ? 'justify-end' : 'justify-start'} mb-3`;
              div.innerHTML = `
                  <div class="max-w-xs px-4 py-2 rounded-lg shadow-sm ${msg.senderId === "currentUser" ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}">
                      <p>${msg.content}</p>
                      <div class="text-right text-xs mt-1 opacity-70">${time}</div>
                  </div>
              `;
              messagesDiv.appendChild(div);
          });

      messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (error) {
      console.error("Erreur chargement messages du groupe :", error);
  }
}
