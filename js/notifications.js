window.notifications = {
  isEnabled: false,
  soundEnabled: true,
  toastEnabled: true,
  badgeEnabled: true,
  isTabActive: true,
  lastMessageCheck: Date.now(),
  pollingInterval: null,
  unreadCounts: {},

  init() {
    this.checkPermission()
    this.setupVisibilityListener()
    this.startMessagePolling()
    this.loadSettings()
  },

  async checkPermission() {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission()
        this.isEnabled = permission === "granted"
      } else {
        this.isEnabled = Notification.permission === "granted"
      }
    }
  },

  setupVisibilityListener() {
    document.addEventListener("visibilitychange", () => {
      this.isTabActive = !document.hidden
      if (this.isTabActive) {
        this.updatePageTitle()
      }
    })
  },

  startMessagePolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    this.pollingInterval = setInterval(async () => {
      if (window.auth && window.auth.currentUser) {
        await this.checkForNewMessages()
      }
    }, 2000)
  },

  stopMessagePolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  },

  async checkForNewMessages() {
    const newMessages = await window.api.getNewMessages(window.auth.currentUser.id, this.lastMessageCheck)

    if (newMessages.length > 0) {
      for (const message of newMessages) {
        const sender = await window.api.getUser(message.senderId)
        if (sender) {
          this.handleNewMessage(sender, message)
        }
      }
      this.lastMessageCheck = Date.now()
    }
  },

  handleNewMessage(sender, message) {
    // Incrémenter le compteur non lu
    const chatId = this.getChatId(sender.id)
    this.unreadCounts[chatId] = (this.unreadCounts[chatId] || 0) + 1

    // Afficher les notifications
    if (!this.isTabActive && this.isEnabled) {
      this.showBrowserNotification(sender, message)
    }

    if (this.toastEnabled && this.isTabActive) {
      this.showToastNotification(sender, message)
    }

    if (this.soundEnabled) {
      this.playNotificationSound()
    }

    if (this.badgeEnabled) {
      this.updateUnreadBadges()
      this.updatePageTitle()
    }
  },

  getChatId(userId) {
    const participants = [window.auth.currentUser.id, userId].sort()
    return participants.join("_")
  },

  showBrowserNotification(sender, message) {
    if (!this.isEnabled) return

    const notification = new Notification(sender.name, {
      body: message.content,
      icon: sender.avatar,
      tag: sender.id,
    })

    notification.onclick = () => {
      window.focus()
      this.openChat(sender.id)
      notification.close()
    }

    setTimeout(() => {
      notification.close()
    }, 5000)
  },

  showToastNotification(sender, message) {
    const toast = window.utils.createElement(
      "div",
      {
        class:
          "fixed top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-50 cursor-pointer transform transition-all duration-300 hover:scale-105",
        onClick: () => {
          this.openChat(sender.id)
          toast.remove()
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
              src: sender.avatar,
              alt: sender.name,
              class: "w-10 h-10 rounded-full",
            }),
            window.utils.createElement(
              "div",
              {
                class: "flex-1 min-w-0",
              },
              [
                window.utils.createElement(
                  "h4",
                  {
                    class: "font-semibold text-gray-900 text-sm truncate",
                  },
                  sender.name,
                ),
                window.utils.createElement(
                  "p",
                  {
                    class: "text-gray-600 text-sm truncate",
                  },
                  message.content.length > 50 ? message.content.substring(0, 50) + "..." : message.content,
                ),
              ],
            ),
            window.utils.createElement(
              "button",
              {
                class: "text-gray-400 hover:text-gray-600 p-1",
                onClick: (e) => {
                  e.stopPropagation()
                  toast.remove()
                },
              },
              [
                window.utils.createElement("i", {
                  class: "fas fa-times text-xs",
                }),
              ],
            ),
          ],
        ),
      ],
    )

    document.body.appendChild(toast)

    // Animation d'entrée
    setTimeout(() => {
      toast.style.transform = "translateX(0)"
    }, 10)

    // Suppression automatique
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.transform = "translateX(100%)"
        setTimeout(() => toast.remove(), 300)
      }
    }, 5000)
  },

  playNotificationSound() {
    if (!this.soundEnabled) return

    // Créer un son simple avec Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.log("Impossible de jouer le son de notification")
    }
  },

  updateUnreadBadges() {
    Object.keys(this.unreadCounts).forEach((chatId) => {
      const count = this.unreadCounts[chatId]
      if (count > 0) {
        const chatElement = document.querySelector(`[data-chat-id="${chatId}"]`)
        if (chatElement) {
          let badge = chatElement.querySelector(".unread-badge")
          if (!badge) {
            badge = window.utils.createElement(
              "div",
              {
                class:
                  "unread-badge absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold",
              },
              count.toString(),
            )
            chatElement.style.position = "relative"
            chatElement.appendChild(badge)
          } else {
            badge.textContent = count.toString()
          }
        }
      }
    })
  },

  updatePageTitle() {
    const totalUnread = Object.values(this.unreadCounts).reduce((sum, count) => sum + count, 0)
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) WhatsApp Web Clone`
    } else {
      document.title = "WhatsApp Web Clone"
    }
  },

  clearUnreadIndicators(chatId = null) {
    if (chatId) {
      this.unreadCounts[chatId] = 0
      const chatElement = document.querySelector(`[data-chat-id="${chatId}"]`)
      if (chatElement) {
        const badge = chatElement.querySelector(".unread-badge")
        if (badge) {
          badge.remove()
        }
      }
    } else {
      // Effacer tous les indicateurs
      this.unreadCounts = {}
      document.querySelectorAll(".unread-badge").forEach((badge) => badge.remove())
    }
    this.updatePageTitle()
  },

  openChat(userId) {
    // Cette fonction sera appelée pour ouvrir un chat spécifique
    if (window.app && window.app.openChatWithUser) {
      window.app.openChatWithUser(userId)
    }
  },

  renderNotificationSettings() {
    return window.utils.createElement(
      "div",
      {
        class: "bg-white p-6 rounded-lg shadow-lg",
      },
      [
        window.utils.createElement(
          "h2",
          {
            class: "text-xl font-bold mb-6 text-gray-800",
          },
          "Paramètres de notification",
        ),
        window.utils.createElement(
          "div",
          {
            class: "space-y-6",
          },
          [
            // Notifications du navigateur
            window.utils.createElement("div", {}, [
              window.utils.createElement(
                "h3",
                {
                  class: "font-medium text-lg mb-3 text-gray-700",
                },
                "Notifications du navigateur",
              ),
              window.utils.createElement(
                "div",
                {
                  class: "flex items-center justify-between mb-3",
                },
                [
                  window.utils.createElement(
                    "span",
                    {
                      class: "text-gray-600",
                    },
                    "Statut",
                  ),
                  window.utils.createElement(
                    "span",
                    {
                      class: `px-3 py-1 rounded-full text-sm ${
                        this.isEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`,
                    },
                    this.isEnabled ? "Activées" : "Désactivées",
                  ),
                ],
              ),
              !this.isEnabled
                ? window.utils.createElement(
                    "button",
                    {
                      class:
                        "px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition duration-200",
                      onClick: () => this.requestPermission(),
                    },
                    "Activer les notifications",
                  )
                : null,
            ]),

            // Sons
            window.utils.createElement("div", {}, [
              window.utils.createElement(
                "h3",
                {
                  class: "font-medium text-lg mb-3 text-gray-700",
                },
                "Sons",
              ),
              window.utils.createElement(
                "div",
                {
                  class: "flex items-center justify-between mb-3",
                },
                [
                  window.utils.createElement(
                    "span",
                    {
                      class: "text-gray-600",
                    },
                    "Son de notification",
                  ),
                  window.utils.createElement(
                    "label",
                    {
                      class: "inline-flex items-center cursor-pointer",
                    },
                    [
                      window.utils.createElement("input", {
                        type: "checkbox",
                        class: "form-checkbox h-5 w-5 text-green-500 rounded",
                        checked: this.soundEnabled,
                        onChange: (e) => {
                          this.soundEnabled = e.target.checked
                          this.saveSettings()
                        },
                      }),
                      window.utils.createElement(
                        "span",
                        {
                          class: "ml-2 text-gray-700",
                        },
                        "Activé",
                      ),
                    ],
                  ),
                ],
              ),
              window.utils.createElement(
                "button",
                {
                  class: "px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition duration-200",
                  onClick: () => this.playNotificationSound(),
                },
                "Tester le son",
              ),
            ]),

            // Notifications visuelles
            window.utils.createElement("div", {}, [
              window.utils.createElement(
                "h3",
                {
                  class: "font-medium text-lg mb-3 text-gray-700",
                },
                "Notifications visuelles",
              ),
              window.utils.createElement(
                "div",
                {
                  class: "space-y-3",
                },
                [
                  window.utils.createElement(
                    "div",
                    {
                      class: "flex items-center justify-between",
                    },
                    [
                      window.utils.createElement(
                        "span",
                        {
                          class: "text-gray-600",
                        },
                        "Badges de compteur",
                      ),
                      window.utils.createElement(
                        "label",
                        {
                          class: "inline-flex items-center cursor-pointer",
                        },
                        [
                          window.utils.createElement("input", {
                            type: "checkbox",
                            class: "form-checkbox h-5 w-5 text-green-500 rounded",
                            checked: this.badgeEnabled,
                            onChange: (e) => {
                              this.badgeEnabled = e.target.checked
                              this.saveSettings()
                            },
                          }),
                          window.utils.createElement(
                            "span",
                            {
                              class: "ml-2 text-gray-700",
                            },
                            "Activés",
                          ),
                        ],
                      ),
                    ],
                  ),
                  window.utils.createElement(
                    "div",
                    {
                      class: "flex items-center justify-between",
                    },
                    [
                      window.utils.createElement(
                        "span",
                        {
                          class: "text-gray-600",
                        },
                        "Notifications toast",
                      ),
                      window.utils.createElement(
                        "label",
                        {
                          class: "inline-flex items-center cursor-pointer",
                        },
                        [
                          window.utils.createElement("input", {
                            type: "checkbox",
                            class: "form-checkbox h-5 w-5 text-green-500 rounded",
                            checked: this.toastEnabled,
                            onChange: (e) => {
                              this.toastEnabled = e.target.checked
                              this.saveSettings()
                            },
                          }),
                          window.utils.createElement(
                            "span",
                            {
                              class: "ml-2 text-gray-700",
                            },
                            "Activées",
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ]),
          ],
        ),
      ],
    )
  },

  async requestPermission() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      this.isEnabled = permission === "granted"
      // Rafraîchir l'interface des paramètres
      if (window.app && window.app.showNotificationSettings) {
        window.app.showNotificationSettings()
      }
    }
  },

  saveSettings() {
    const settings = {
      soundEnabled: this.soundEnabled,
      toastEnabled: this.toastEnabled,
      badgeEnabled: this.badgeEnabled,
    }
    localStorage.setItem("whatsapp_notification_settings", JSON.stringify(settings))
  },

  loadSettings() {
    const saved = localStorage.getItem("whatsapp_notification_settings")
    if (saved) {
      const settings = JSON.parse(saved)
      this.soundEnabled = settings.soundEnabled !== false
      this.toastEnabled = settings.toastEnabled !== false
      this.badgeEnabled = settings.badgeEnabled !== false
    }
  },
}
