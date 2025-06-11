window.app = {
  chats: [],

  init() {
    window.auth.init()
    this.renderApp()
  },

  renderApp() {
    const appContainer = document.getElementById("app")
    appContainer.innerHTML = ""

    if (!window.auth.currentUser) {
      appContainer.appendChild(window.auth.renderLoginScreen())
    } else {
      this.renderMainApp()
    }
  },

  renderMainApp() {
    const appContainer = document.getElementById("app")
    appContainer.innerHTML = ""

    const mainContainer = window.utils.createElement("div", {
      class: "h-screen flex bg-white",
    })

    const leftPanel = this.renderLeftPanel()
    const rightPanel = window.utils.createElement(
      "div",
      {
        id: "right-panel",
        class: "flex-1 border-l",
      },
      [
        window.utils.createElement(
          "div",
          {
            class: "h-full flex items-center justify-center bg-gray-50",
          },
          [
            window.utils.createElement(
              "div",
              {
                class: "text-center text-gray-500",
              },
              [
                window.utils.createElement("i", {
                  class: "fab fa-whatsapp text-6xl mb-4 text-gray-300",
                }),
                window.utils.createElement(
                  "h3",
                  {
                    class: "text-xl font-medium mb-2",
                  },
                  "WhatsApp Web",
                ),
                window.utils.createElement("p", {}, "Sélectionnez une conversation pour commencer"),
              ],
            ),
          ],
        ),
      ],
    )

    mainContainer.appendChild(leftPanel)
    mainContainer.appendChild(rightPanel)
    appContainer.appendChild(mainContainer)

    this.loadChats()
  },

  renderLeftPanel() {
    const leftPanel = window.utils.createElement("div", {
      class: "w-80 bg-white border-r flex flex-col h-full",
    })

    const header = this.renderUserHeader()
    const searchBar = this.renderSearchBar()
    const chatsList = window.utils.createElement("div", {
      id: "chats-list",
      class: "flex-1 overflow-y-auto",
    })

    leftPanel.appendChild(header)
    leftPanel.appendChild(searchBar)
    leftPanel.appendChild(chatsList)

    return leftPanel
  },

  renderUserHeader() {
    return window.utils.createElement(
      "div",
      {
        class: "bg-gray-100 p-4 flex items-center justify-between border-b",
      },
      [
        window.utils.createElement(
          "div",
          {
            class: "flex items-center space-x-3",
          },
          [
            window.utils.createElement("img", {
              src: window.auth.currentUser.avatar,
              alt: window.auth.currentUser.name,
              class: "w-10 h-10 rounded-full",
            }),
            window.utils.createElement("div", {}, [
              window.utils.createElement(
                "h3",
                {
                  class: "font-semibold text-gray-900",
                },
                window.auth.currentUser.name,
              ),
              window.utils.createElement(
                "p",
                {
                  class: "text-sm text-gray-600",
                },
                window.auth.currentUser.status,
              ),
            ]),
          ],
        ),
        window.utils.createElement(
          "div",
          {
            class: "flex items-center space-x-2",
          },
          [
            window.utils.createElement(
              "button",
              {
                class: "p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition duration-200",
                onClick: () => this.showNewChatDialog(),
              },
              [
                window.utils.createElement("i", {
                  class: "fas fa-plus",
                }),
              ],
            ),
            window.utils.createElement(
              "button",
              {
                class: "p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition duration-200",
              },
              [
                window.utils.createElement("i", {
                  class: "fas fa-ellipsis-v",
                }),
              ],
            ),
            window.utils.createElement(
              "button",
              {
                class: "p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition duration-200",
                onClick: () => window.auth.logout(),
              },
              [
                window.utils.createElement("i", {
                  class: "fas fa-sign-out-alt",
                }),
              ],
            ),
          ],
        ),
      ],
    )
  },

  renderSearchBar() {
    return window.utils.createElement(
      "div",
      {
        class: "p-4 border-b",
      },
      [
        window.utils.createElement(
          "div",
          {
            class: "relative",
          },
          [
            window.utils.createElement("i", {
              class: "fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
            }),
            window.utils.createElement("input", {
              type: "text",
              class: "w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-green-500",
              placeholder: "Rechercher ou démarrer une nouvelle discussion",
            }),
          ],
        ),
      ],
    )
  },

  async loadChats() {
    this.chats = await window.api.getChats(window.auth.currentUser.id)
    this.renderChats()
  },

  renderChats() {
    const chatsList = document.getElementById("chats-list")
    if (!chatsList) return

    chatsList.innerHTML = ""

    if (this.chats.length === 0) {
      const emptyState = window.utils.createElement(
        "div",
        {
          class: "p-8 text-center text-gray-500",
        },
        [
          window.utils.createElement("i", {
            class: "fas fa-comments text-4xl mb-4",
          }),
          window.utils.createElement(
            "p",
            {
              class: "font-medium",
            },
            "Aucune conversation",
          ),
          window.utils.createElement(
            "p",
            {
              class: "text-sm mt-1",
            },
            "Commencez une nouvelle discussion",
          ),
        ],
      )
      chatsList.appendChild(emptyState)
      return
    }

    this.chats.forEach(async (chat) => {
      const chatItem = await this.renderChatItem(chat)
      chatsList.appendChild(chatItem)
    })
  },

  async renderChatItem(chat) {
    const otherParticipantId = chat.participants.find((id) => id !== window.auth.currentUser.id)
    const otherUser = await window.api.getUser(otherParticipantId)

    if (!otherUser) return window.utils.createElement("div")

    return window.utils.createElement(
      "div",
      {
        class: "p-4 hover:bg-gray-50 cursor-pointer border-b transition duration-200",
        onClick: () => {
          window.chatModule.setActiveChat(chat, otherUser)
          document.getElementById("right-panel").innerHTML = ""
          document.getElementById("right-panel").appendChild(window.chatModule.renderChatInterface())
        },
      },
      [
        window.utils.createElement(
          "div",
          {
            class: "flex items-center space-x-3",
          },
          [
            window.utils.createElement("img", {
              src: otherUser.avatar,
              alt: otherUser.name,
              class: "w-12 h-12 rounded-full",
            }),
            window.utils.createElement(
              "div",
              {
                class: "flex-1 min-w-0",
              },
              [
                window.utils.createElement(
                  "div",
                  {
                    class: "flex items-center justify-between",
                  },
                  [
                    window.utils.createElement(
                      "h4",
                      {
                        class: "font-semibold text-gray-900 truncate",
                      },
                      otherUser.name,
                    ),
                    window.utils.createElement(
                      "span",
                      {
                        class: "text-xs text-gray-500",
                      },
                      chat.lastMessageTime ? window.utils.formatTime(chat.lastMessageTime) : "",
                    ),
                  ],
                ),
                window.utils.createElement(
                  "p",
                  {
                    class: "text-sm text-gray-600 truncate mt-1",
                  },
                  chat.lastMessage || "Nouveau chat",
                ),
              ],
            ),
          ],
        ),
      ],
    )
  },

  showNewChatDialog() {
    const rightPanel = document.getElementById("right-panel")
    rightPanel.innerHTML = ""
    rightPanel.appendChild(window.contacts.renderContactsList())
  },
}

// Initialiser l'application
document.addEventListener("DOMContentLoaded", () => {
  window.app.init()
})

// Gestion de la fermeture de l'onglet
window.addEventListener("beforeunload", () => {
  if (window.auth.currentUser) {
    window.api.updateUserStatus(window.auth.currentUser.id, false)
  }
})
