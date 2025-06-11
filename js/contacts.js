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
