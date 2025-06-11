window.chatModule = {
  activeChat: null,
  activeContact: null,
  messages: [],

  setActiveChat(chat, contact) {
    this.activeChat = chat
    this.activeContact = contact
    this.loadMessages()
  },

  async loadMessages() {
    if (!this.activeChat) return

    this.messages = await window.api.getMessages(this.activeChat.id)
    this.renderMessages()
  },

  renderChatInterface() {
    if (!this.activeChat || !this.activeContact) {
      return window.utils.createElement(
        "div",
        {
          class: "h-full flex items-center justify-center text-gray-500",
        },
        "Sélectionnez une conversation pour commencer",
      )
    }

    const chatContainer = window.utils.createElement("div", {
      class: "h-full flex flex-col bg-gray-50",
    })

    const chatHeader = this.renderChatHeader()
    const messagesContainer = window.utils.createElement("div", {
      id: "messages-container",
      class: "flex-1 overflow-y-auto p-4 space-y-2",
    })
    const inputContainer = this.renderMessageInput()

    chatContainer.appendChild(chatHeader)
    chatContainer.appendChild(messagesContainer)
    chatContainer.appendChild(inputContainer)

    setTimeout(() => this.renderMessages(), 100)

    return chatContainer
  },

  renderChatHeader() {
    return window.utils.createElement(
      "div",
      {
        class: "bg-white border-b p-4 flex items-center justify-between",
      },
      [
        window.utils.createElement(
          "div",
          {
            class: "flex items-center space-x-3",
          },
          [
            window.utils.createElement("img", {
              src: this.activeContact.avatar,
              alt: this.activeContact.name,
              class: "w-10 h-10 rounded-full",
            }),
            window.utils.createElement("div", {}, [
              window.utils.createElement(
                "h3",
                {
                  class: "font-semibold text-gray-900",
                },
                this.activeContact.name,
              ),
              window.utils.createElement(
                "p",
                {
                  class: "text-sm text-gray-600",
                },
                this.activeContact.isOnline ? "En ligne" : `Vu ${window.utils.formatTime(this.activeContact.lastSeen)}`,
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
                class: "p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition duration-200",
              },
              [
                window.utils.createElement("i", {
                  class: "fas fa-search",
                }),
              ],
            ),
            window.utils.createElement(
              "button",
              {
                class: "p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition duration-200",
              },
              [
                window.utils.createElement("i", {
                  class: "fas fa-ellipsis-v",
                }),
              ],
            ),
          ],
        ),
      ],
    )
  },

  renderMessageInput() {
    const inputContainer = window.utils.createElement("div", {
      class: "bg-white border-t p-4",
    })

    const form = window.utils.createElement("form", {
      onSubmit: (e) => {
        e.preventDefault()
        this.sendMessage()
      },
    })

    const inputWrapper = window.utils.createElement(
      "div",
      {
        class: "flex items-center space-x-2",
      },
      [
        window.utils.createElement(
          "button",
          {
            type: "button",
            class: "p-2 text-gray-600 hover:text-gray-800 transition duration-200",
          },
          [
            window.utils.createElement("i", {
              class: "fas fa-paperclip",
            }),
          ],
        ),
        window.utils.createElement(
          "div",
          {
            class: "flex-1 relative",
          },
          [
            window.utils.createElement("input", {
              id: "message-input",
              type: "text",
              class:
                "w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent",
              placeholder: "Tapez votre message...",
              autoComplete: "off",
            }),
          ],
        ),
        window.utils.createElement(
          "button",
          {
            type: "submit",
            class: "p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition duration-200",
          },
          [
            window.utils.createElement("i", {
              class: "fas fa-paper-plane",
            }),
          ],
        ),
      ],
    )

    form.appendChild(inputWrapper)
    inputContainer.appendChild(form)

    return inputContainer
  },

  renderMessages() {
    const container = document.getElementById("messages-container")
    if (!container) return

    container.innerHTML = ""

    this.messages.forEach((message) => {
      const messageElement = this.renderMessage(message)
      container.appendChild(messageElement)
    })

    container.scrollTop = container.scrollHeight
  },

  renderMessage(message) {
    const isOwnMessage = message.senderId === window.auth.currentUser.id

    return window.utils.createElement(
      "div",
      {
        class: `flex ${isOwnMessage ? "justify-end" : "justify-start"}`,
      },
      [
        window.utils.createElement(
          "div",
          {
            class: `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              isOwnMessage ? "bg-green-500 text-white" : "bg-white text-gray-800 border"
            }`,
          },
          [
            window.utils.createElement(
              "p",
              {
                class: "text-sm",
              },
              message.content,
            ),
            window.utils.createElement(
              "div",
              {
                class: `flex items-center justify-end mt-1 space-x-1 ${
                  isOwnMessage ? "text-green-100" : "text-gray-500"
                }`,
              },
              [
                window.utils.createElement(
                  "span",
                  {
                    class: "text-xs",
                  },
                  window.utils.formatTime(message.timestamp),
                ),
                ...(isOwnMessage
                  ? [
                      window.utils.createElement("i", {
                        class: `fas fa-check text-xs ${message.status === "read" ? "text-blue-300" : ""}`,
                      }),
                    ]
                  : []),
              ],
            ),
          ],
        ),
      ],
    )
  },

  async sendMessage() {
    const input = document.getElementById("message-input")
    const content = input.value.trim()

    if (!content || !this.activeChat) return

    const messageData = {
      chatId: this.activeChat.id,
      senderId: window.auth.currentUser.id,
      receiverId: this.activeContact.id,
      content: content,
    }

    const newMessage = await window.api.sendMessage(messageData)
    if (newMessage) {
      this.messages.push(newMessage)
      this.renderMessages()

      await window.api.updateChatLastMessage(this.activeChat.id, content, newMessage.timestamp)

      input.value = ""
      window.app.loadChats()
    }
  },
}

document.addEventListener("DOMContentLoaded", async () => {
  const chatArea = document.getElementById("chatArea");

  const response = await fetch("http://localhost:3000/messages");
  const messages = await response.json();

  messages.forEach((message) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = "mb-4 p-3 rounded-lg bg-gray-100 shadow-sm";
    messageDiv.innerHTML = `
      <p class="text-sm text-gray-600"><strong>${message.senderId}</strong>: ${message.content}</p>
      <p class="text-xs text-gray-400">${new Date(message.timestamp).toLocaleString()}</p>
    `;
    chatArea.appendChild(messageDiv);
  });
});
