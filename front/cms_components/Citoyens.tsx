// ComponentsCms/Citoyens.tsx
import { useState } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  MoreVertical,
  UserPlus
} from 'lucide-react';

interface Citizen {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  registeredDate: string;
  status: 'active' | 'inactive';
  avatar: string;
}

export const Citoyens = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const citizens: Citizen[] = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '06 12 34 56 78',
      address: '12 Rue de la Mairie, 75001 Paris',
      registeredDate: '2024-01-15',
      status: 'active',
      avatar: '👨'
    },
    {
      id: 2,
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      phone: '06 98 76 54 32',
      address: '45 Avenue des Champs, 75008 Paris',
      registeredDate: '2024-03-22',
      status: 'active',
      avatar: '👩'
    },
    {
      id: 3,
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      phone: '06 55 44 33 22',
      address: '8 Boulevard Saint-Michel, 75005 Paris',
      registeredDate: '2024-06-10',
      status: 'active',
      avatar: '👨‍💼'
    },
    {
      id: 4,
      name: 'Sophie Bernard',
      email: 'sophie.bernard@email.com',
      phone: '06 11 22 33 44',
      address: '23 Rue de Rivoli, 75004 Paris',
      registeredDate: '2024-08-05',
      status: 'inactive',
      avatar: '👩‍💼'
    },
    {
      id: 5,
      name: 'Luc Moreau',
      email: 'luc.moreau@email.com',
      phone: '06 66 77 88 99',
      address: '56 Rue Lafayette, 75009 Paris',
      registeredDate: '2024-09-18',
      status: 'active',
      avatar: '👨‍🦱'
    },
  ];

  const filteredCitizens = citizens.filter(citizen =>
    citizen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Citoyens</h1>
            <p className="text-sm text-gray-600">Gérez les comptes des citoyens inscrits</p>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium shadow-md transition-colors">
            <UserPlus className="h-5 w-5" />
            <span>Ajouter un citoyen</span>
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-600">Total citoyens</p>
            <p className="text-2xl font-bold text-blue-700">{citizens.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm font-medium text-green-600">Actifs</p>
            <p className="text-2xl font-bold text-green-700">
              {citizens.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600">Inactifs</p>
            <p className="text-2xl font-bold text-gray-700">
              {citizens.filter(c => c.status === 'inactive').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un citoyen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Citizens List */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citoyen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCitizens.map((citizen) => (
                <tr key={citizen.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                        {citizen.avatar}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{citizen.name}</div>
                        <div className="text-sm text-gray-500">
                          Inscrit le {new Date(citizen.registeredDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {citizen.email}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {citizen.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate max-w-xs">{citizen.address}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      citizen.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {citizen.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCitizens.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun citoyen trouvé</h3>
              <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Citoyens;
