// ComponentsCms/DashboardContent.tsx
import { Bell, Menu } from 'lucide-react';

interface DashboardContentProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const DashboardContent = ({ setIsSidebarOpen }: DashboardContentProps) => {
  const stats = [
    { label: 'Visiteurs du site', value: '1,204' },
    { label: 'Nouveaux messages', value: '15' },
  ];

  const quickActions = [
    { 
      id: 1, 
      icon: '📝', 
      title: 'Nouvelle publication',
      description: 'Créer un nouvel article de blog',
      color: 'bg-blue-100 text-blue-700'
    },
    { 
      id: 2, 
      icon: '📅', 
      title: 'Ajouter un événement',
      description: 'Planifier un nouvel événement',
      color: 'bg-green-100 text-green-700'
    },
    { 
      id: 3, 
      icon: '📊', 
      title: 'Voir les statistiques',
      description: 'Analyser les performances',
      color: 'bg-purple-100 text-purple-700'
    },
    { 
      id: 4, 
      icon: '📧', 
      title: 'Voir les messages',
      description: 'Gérer les demandes',
      color: 'bg-yellow-100 text-yellow-700'
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'publication',
      title: 'Nouvel article publié',
      description: 'Le marché de Noël 2023 est en ligne',
      time: 'Il y a 2 heures',
      icon: '📝'
    },
    {
      id: 2,
      type: 'message',
      title: 'Nouveau message',
      description: 'Demande de renseignements de M. Dupont',
      time: 'Il y a 5 heures',
      icon: '✉️'
    },
    {
      id: 3,
      type: 'event',
      title: 'Événement à venir',
      description: 'Conseil municipal demain à 18h',
      time: 'Il y a 1 jour',
      icon: '📅'
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-1.5 right-1.5 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profil"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Message de bienvenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bonjour, Monsieur le Maire !</h2>
          <p className="text-gray-600">Voici un aperçu de votre tableau de bord administratif.</p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className={`${action.color} rounded-xl p-4 text-left hover:shadow-md transition-shadow`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <h3 className="font-medium">{action.title}</h3>
                <p className="text-sm opacity-80 mt-1">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Voir tout
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                      {activity.icon}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};