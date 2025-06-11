// Fonction createElement fournie
function createElement(tag, props = {}, content = "") {
  if (typeof tag !== "string") return null
  // Gestion de v-if
  if ("vIf" in props && props.vIf === false) return null

  const el = document.createElement(tag)

  // Gestion de v-for
  if ("vFor" in props) {
    const fragment = document.createDocumentFragment()
    const { each, render } = props.vFor

    each.forEach((item) => {
      const child = render(item)
      if (child instanceof Node) {
        fragment.appendChild(child)
      }
    })
    content = [fragment]
  }

  for (const key in props) {
    const value = props[key]

    // Classes
    if (key === "class" || key === "className") {
      el.className = Array.isArray(value) ? value.join(" ") : value
    }

    // Événements
    else if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase()
      el.addEventListener(eventName, value)
    }

    // v-show => toggle `display: none`
    else if (key === "vShow") {
      el.style.display = value ? "" : "none"
    }

    // vIf et vFor
    else if (key === "vIf" || key === "vFor") {
      continue
    }

    // :attr => dynamic binding
    else if (key.startsWith(":")) {
      const realAttr = key.slice(1)
      el.setAttribute(realAttr, value)
    }

    // style objet
    else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value)
    }

    // Attribut HTML classique
    else {
      el.setAttribute(key, value)
    }
  }

  // Contenu : string | Node | array
  if (Array.isArray(content)) {
    content.forEach((item) => {
      if (typeof item === "string") {
        el.appendChild(document.createTextNode(item))
      } else if (item instanceof Node) {
        el.appendChild(item)
      }
    })
  } else if (typeof content === "string" || typeof content === "number") {
    el.textContent = content
  } else if (content instanceof Node) {
    el.appendChild(content)
  }

  // Méthodes pour chaînage
  el.addElement = function (tag, props = {}, content = "") {
    const newEl = createElement(tag, props, content)
    this.appendChild(newEl)
    return this
  }
  el.addNode = function (node) {
    this.appendChild(node)
    return this
  }

  return el
}

// Utilitaires
window.utils = {
  createElement,

  formatPhone: (phone) => {
    return phone.replace(/\D/g, "")
  },

  formatTime: (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  },

  formatDate: (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier"
    } else {
      return date.toLocaleDateString("fr-FR")
    }
  },

  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },
}

export function renderHome() {
  const element = document.createElement("div")
  element.innerHTML = `
        <div class="flex h-screen bg-gray-50">
            <!-- Sidebar (Contacts) -->
            <div class="w-1/3 max-w-sm bg-white border-r border-gray-200 flex flex-col">
                <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <h2 class="text-lg font-bold">WhatsApp Web</h2>
                    <button class="text-gray-500 hover:text-gray-800">&#9881;</button>
                </div>
                <div class="p-2">
                    <input type="text" placeholder="Rechercher un contact" class="w-full px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
                <ul id="contactsList" class="overflow-y-auto flex-1 p-2 space-y-2">
                    <!-- Contacts chargés dynamiquement -->
                </ul>
            </div>

            <!-- Zone de Chat -->
            <div class="flex-1 bg-white flex flex-col">
                <div id="chatHeader" class="bg-white p-4 border-b border-gray-200 hidden flex items-center space-x-3">
                    <!-- Infos du contact -->
                </div>
                <div id="messages" class="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                    <!-- Messages chargés dynamiquement -->
                </div>
                <div id="messageInputArea" class="p-4 bg-white border-t border-gray-200 hidden flex">
                    <input id="messageInput" type="text" placeholder="Écrire un message" class="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500">
                    <button id="sendMessage" class="ml-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `

  loadContacts()
  return element
}

<body class="bg-gray-100 h-screen flex items-center justify-center">
  <div id="app" class="h-screen w-full">
  </div>
  <script type="module" src="./js/main.js"></script>
</body>
