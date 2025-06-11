// Service Worker pour les notifications en arrière-plan
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: data.icon || "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: "explore",
          title: "Répondre",
          icon: "/images/reply.png",
        },
        {
          action: "close",
          title: "Fermer",
          icon: "/images/close.png",
        },
      ],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Gérer les clics sur les notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    // Ouvrir l'application et naviguer vers le chat
    event.waitUntil(clients.openWindow("/index.html"))
  }
})
