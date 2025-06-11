// Configuration API
const API_BASE = "http://localhost:3000"

window.api = {
  // Utilisateurs
  async getUser(phone) {
    try {
      const response = await fetch(`${API_BASE}/users?phone=${phone}`)
      const users = await response.json()
      return users[0] || null
    } catch (error) {
      console.error("Erreur API getUser:", error)
      return null
    }
  },
  
  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          id: window.utils.generateId(),
          createdAt: Date.now(),
          isOnline: true,
        }),
      })
      return await response.json()
    } catch (error) {
      console.error("Erreur API createUser:", error)
      return null
    }
  },

  async updateUserStatus(userId, isOnline) {
    try {
      await fetch(`${API_BASE}/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOnline,
          lastSeen: Date.now(),
        }),
      })
    } catch (error) {
      console.error("Erreur API updateUserStatus:", error)
    }
  },

  // Messages
  async getMessages(chatId) {
    try {
      const response = await fetch(`${API_BASE}/messages?chatId=${chatId}&_sort=timestamp&_order=asc`)
      return await response.json()
    } catch (error) {
      console.error("Erreur API getMessages:", error)
      return []
    }
  },

  async sendMessage(messageData) {
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...messageData,
          id: window.utils.generateId(),
          timestamp: Date.now(),
          status: "sent",
        }),
      })
      return await response.json()
    } catch (error) {
      console.error("Erreur API sendMessage:", error)
      return null
    }
  },

  // Chats
  async getChats(userId) {
    try {
      const response = await fetch(`${API_BASE}/chats?participants_like=${userId}&_sort=lastMessageTime&_order=desc`)
      return await response.json()
    } catch (error) {
      console.error("Erreur API getChats:", error)
      return []
    }
  },

  async createOrGetChat(participants) {
    try {
      const sortedParticipants = participants.sort()
      const chatId = sortedParticipants.join("_")

      // Vérifier si le chat existe
      let response = await fetch(`${API_BASE}/chats/${chatId}`)
      if (response.ok) {
        return await response.json()
      }

      // Créer nouveau chat
      response = await fetch(`${API_BASE}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: chatId,
          participants: sortedParticipants,
          createdAt: Date.now(),
          lastMessageTime: Date.now(),
        }),
      })
      return await response.json()
    } catch (error) {
      console.error("Erreur API createOrGetChat:", error)
      return null
    }
  },

  async updateChatLastMessage(chatId, lastMessage, timestamp) {
    try {
      await fetch(`${API_BASE}/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastMessage,
          lastMessageTime: timestamp,
        }),
      })
    } catch (error) {
      console.error("Erreur API updateChatLastMessage:", error)
    }
  },
}
