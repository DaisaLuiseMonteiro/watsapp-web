export default function WhatsAppPreview() {
  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-center">Aperçu du Clone WhatsApp Web</h2>

      {/* Écran de connexion */}
      <div className="border rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-2">1. Écran de connexion</h3>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <i className="fab fa-whatsapp text-6xl text-green-500 mb-4"></i>
              <h1 className="text-2xl font-bold text-gray-800">WhatsApp Web</h1>
              <p className="text-gray-600 mt-2">Connectez-vous avec votre numéro de téléphone</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
                Continuer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interface principale */}
      <div className="border rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-2">2. Interface principale avec notifications</h3>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex h-[500px]">
            {/* Panneau gauche - Liste des chats */}
            <div className="w-80 border-r flex flex-col">
              {/* Header */}
              <div className="bg-gray-100 p-4 flex items-center justify-between border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <span>JD</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Jean Dupont</h3>
                    <p className="text-sm text-gray-600">Disponible</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition duration-200">
                    <i className="fas fa-bell"></i>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition duration-200">
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </div>

              {/* Recherche */}
              <div className="p-4 border-b">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg"
                    placeholder="Rechercher ou démarrer une nouvelle discussion"
                  />
                </div>
              </div>

              {/* Liste des chats */}
              <div className="flex-1 overflow-y-auto">
                {/* Chat avec notification */}
                <div className="p-4 hover:bg-gray-50 cursor-pointer border-b transition duration-200 relative">
                  <div className="absolute top-4 right-4 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                    2
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <span>MM</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 truncate">Marie Martin</h4>
                        <span className="text-xs text-gray-500">10:42</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">Salut ! Comment ça va ?</p>
                    </div>
                  </div>
                </div>

                {/* Chat normal */}
                <div className="p-4 hover:bg-gray-50 cursor-pointer border-b transition duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white">
                      <span>PD</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 truncate">Pierre Durand</h4>
                        <span className="text-xs text-gray-500">Hier</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">On se voit demain ?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panneau droit - Chat actif */}
            <div className="flex-1 flex flex-col">
              {/* Header du chat */}
              <div className="bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <span>MM</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Marie Martin</h3>
                    <p className="text-sm text-gray-600">En ligne</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition duration-200">
                    <i className="fas fa-search"></i>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition duration-200">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white text-gray-800 border">
                    <p className="text-sm">Salut ! Comment ça va ?</p>
                    <div className="flex items-center justify-end mt-1 space-x-1 text-gray-500">
                      <span className="text-xs">10:42</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-green-500 text-white">
                    <p className="text-sm">Ça va bien et toi ?</p>
                    <div className="flex items-center justify-end mt-1 space-x-1 text-green-100">
                      <span className="text-xs">10:43</span>
                      <i className="fas fa-check text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="bg-white border-t p-4">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800 transition duration-200">
                    <i className="fas fa-paperclip"></i>
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tapez votre message..."
                    />
                  </div>
                  <button className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition duration-200">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <div className="border rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-2">3. Notification toast</h3>
        <div className="relative p-6 bg-gray-100 rounded-lg">
          <div className="notification-toast bg-white p-4 rounded-lg shadow-lg max-w-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <span>MM</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">Marie Martin</h4>
                <p className="text-gray-600 text-sm truncate">Tu es disponible pour un appel ?</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres de notification */}
      <div className="border rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-2">4. Paramètres de notification</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Paramètres de notification</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Notifications du navigateur</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Statut</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Activées</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2">Sons</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Son de notification</span>
                  <label className="inline-flex items-center">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-green-500" checked />
                    <span className="ml-2 text-gray-700">Activé</span>
                  </label>
                </div>
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">Tester le son</button>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2">Notifications visuelles</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Badges de compteur</span>
                    <label className="inline-flex items-center">
                      <input type="checkbox" className="form-checkbox h-5 w-5 text-green-500" checked />
                      <span className="ml-2 text-gray-700">Activés</span>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Notifications toast</span>
                    <label className="inline-flex items-center">
                      <input type="checkbox" className="form-checkbox h-5 w-5 text-green-500" checked />
                      <span className="ml-2 text-gray-700">Activées</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
