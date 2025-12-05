// ComponentsCms/Parametres.tsx
import { useState } from 'react';
import { 
  Settings,
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Save,
  Camera
} from 'lucide-react';

export const Parametres = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'site', label: 'Site web', icon: Globe },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-sm text-gray-600">Gérez vos préférences et configurations</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* Tabs Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations du profil</h2>
              
              {/* Avatar */}
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                    <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Photo de profil</h3>
                    <p className="text-sm text-gray-500">JPG, PNG ou GIF. Max 2Mo</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      defaultValue="Jean"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      defaultValue="Dupont"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="maire@commune.fr"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fonction</label>
                  <input
                    type="text"
                    defaultValue="Maire"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
                  <textarea
                    rows={4}
                    defaultValue="Maire de la commune depuis 2020..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="pt-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Préférences de notification</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Nouveaux messages</h3>
                    <p className="text-sm text-gray-500">Recevoir une notification pour chaque nouveau message</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Événements à venir</h3>
                    <p className="text-sm text-gray-500">Rappels pour les événements programmés</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Rapports hebdomadaires</h3>
                    <p className="text-sm text-gray-500">Résumé des statistiques chaque semaine</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Enregistrer les préférences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Sécurité du compte</h2>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Personnalisation de l'apparence</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Thème</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="p-4 border-2 border-blue-500 rounded-lg bg-white text-center">
                      <div className="h-8 w-8 bg-gray-100 rounded mx-auto mb-2"></div>
                      <span className="text-sm font-medium">Clair</span>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg bg-white text-center hover:border-gray-300">
                      <div className="h-8 w-8 bg-gray-800 rounded mx-auto mb-2"></div>
                      <span className="text-sm font-medium">Sombre</span>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg bg-white text-center hover:border-gray-300">
                      <div className="h-8 w-8 bg-gradient-to-r from-gray-100 to-gray-800 rounded mx-auto mb-2"></div>
                      <span className="text-sm font-medium">Système</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Couleur principale</h3>
                  <div className="flex gap-3">
                    <button className="h-10 w-10 bg-blue-600 rounded-full ring-2 ring-offset-2 ring-blue-600"></button>
                    <button className="h-10 w-10 bg-green-600 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-green-600"></button>
                    <button className="h-10 w-10 bg-purple-600 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-purple-600"></button>
                    <button className="h-10 w-10 bg-red-600 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-red-600"></button>
                    <button className="h-10 w-10 bg-orange-600 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-orange-600"></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'site' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuration du site web</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la commune</label>
                  <input
                    type="text"
                    defaultValue="Commune de Example"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                  <input
                    type="text"
                    defaultValue="Une commune au service de ses citoyens"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    defaultValue="Bienvenue sur le site officiel de notre commune..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="pt-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Parametres;
