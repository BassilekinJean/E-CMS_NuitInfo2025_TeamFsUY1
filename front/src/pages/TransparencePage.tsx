/**
 * Page Transparence - E-CMS
 * Délibérations, Budgets et Documents officiels
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useDeliberations, useBudgets, useDocumentsOfficiels } from '../hooks/useApi';
import { ArrowLeft, FileText, Download, Search, Filter, Calendar } from 'lucide-react';

type Tab = 'deliberations' | 'budgets' | 'documents';

export function TransparencePage() {
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState<Tab>('deliberations');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="py-12 text-white"
        style={{ backgroundColor: tenant?.couleur_primaire || '#0066CC' }}
      >
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold">Transparence & Documents</h1>
          <p className="opacity-80 mt-2">Accédez aux documents officiels de la commune</p>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('deliberations')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === 'deliberations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'deliberations' ? { borderColor: tenant?.couleur_primaire, color: tenant?.couleur_primaire } : {}}
            >
              Délibérations
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === 'budgets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'budgets' ? { borderColor: tenant?.couleur_primaire, color: tenant?.couleur_primaire } : {}}
            >
              Budgets & Finances
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === 'documents'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'documents' ? { borderColor: tenant?.couleur_primaire, color: tenant?.couleur_primaire } : {}}
            >
              Documents Officiels
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenu */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'deliberations' && <DeliberationsTab />}
        {activeTab === 'budgets' && <BudgetsTab />}
        {activeTab === 'documents' && <DocumentsTab />}
      </main>
    </div>
  );
}

function DeliberationsTab() {
  const { tenant } = useTenant();
  const [search, setSearch] = useState('');
  const [annee, setAnnee] = useState<number | undefined>(undefined);
  
  const { data: deliberations, isLoading, pagination, loadMore } = useDeliberations({ 
    search: search || undefined,
    annee
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Le hook se mettra à jour automatiquement grâce au state search
  };
  
  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une délibération..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
        <select
          value={annee || ''}
          onChange={e => setAnnee(e.target.value ? parseInt(e.target.value) : undefined)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les années</option>
          {[2025, 2024, 2023, 2022].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse h-24"></div>
          ))}
        </div>
      ) : deliberations && deliberations.length > 0 ? (
        <div className="space-y-4">
          {deliberations.map(delib => (
            <div key={delib.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <FileText className="w-6 h-6" style={{ color: tenant?.couleur_primaire }} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° {delib.numero}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">{delib.titre}</h3>
                  </div>
                  <span className="text-sm text-gray-500 flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(delib.date_seance).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {delib.resume && (
                  <p className="text-gray-600 mt-2 text-sm">{delib.resume}</p>
                )}
                <div className="mt-4">
                  <a 
                    href={delib.fichier} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium hover:underline"
                    style={{ color: tenant?.couleur_primaire || '#0066CC' }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le PDF
                  </a>
                </div>
              </div>
            </div>
          ))}
          
          {pagination?.hasNext && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Charger plus
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Aucune délibération trouvée.
        </div>
      )}
    </div>
  );
}

function BudgetsTab() {
  const { tenant } = useTenant();
  const [annee, setAnnee] = useState<number | undefined>(undefined);
  const { data: budgets, isLoading } = useBudgets({ annee });
  
  return (
    <div>
      <div className="flex justify-end mb-6">
        <select
          value={annee || ''}
          onChange={e => setAnnee(e.target.value ? parseInt(e.target.value) : undefined)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les années</option>
          {[2025, 2024, 2023, 2022].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse h-40"></div>
          ))}
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {budgets.map(budget => (
            <div key={budget.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border-l-4" style={{ borderLeftColor: tenant?.couleur_primaire || '#0066CC' }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {budget.annee}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mt-1">{budget.titre}</h3>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-xs rounded text-gray-600">
                    {budget.type_document_display || budget.type_document}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              
              {budget.montant_total && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Montant total</span>
                  <div className="text-2xl font-bold" style={{ color: tenant?.couleur_primaire }}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(budget.montant_total)}
                  </div>
                </div>
              )}
              
              {budget.description && (
                <p className="text-gray-600 text-sm mb-4">{budget.description}</p>
              )}
              
              <a 
                href={budget.fichier} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full block text-center py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-medium"
              >
                Télécharger le document
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Aucun document budgétaire trouvé.
        </div>
      )}
    </div>
  );
}

function DocumentsTab() {
  const { tenant } = useTenant();
  const [search, setSearch] = useState('');
  const { data: documents, isLoading } = useDocumentsOfficiels({ search: search || undefined });
  
  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un document (arrêté, formulaire, guide...)"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse h-16"></div>
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{doc.titre}</div>
                    {doc.description && <div className="text-sm text-gray-500 mt-1">{doc.description}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      {doc.type_document_display || doc.type_document}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.date_document ? new Date(doc.date_document).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <a 
                      href={doc.fichier} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Aucun document trouvé.
        </div>
      )}
    </div>
  );
}

export default TransparencePage;
