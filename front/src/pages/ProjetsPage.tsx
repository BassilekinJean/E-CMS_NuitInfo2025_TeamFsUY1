/**
 * Page Projets (Transparence) - E-CMS
 */


import { Link, useParams } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useProjets, useProjet } from '../hooks/useApi';
import { ArrowLeft, Calendar, MapPin, TrendingUp, Wallet } from 'lucide-react';

export function ProjetsPage() {
  const { tenant } = useTenant();
  const { data: projets, isLoading, pagination, loadMore } = useProjets();
  
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
          <h1 className="text-3xl font-bold">Projets Municipaux</h1>
          <p className="opacity-80 mt-2">Transparence et suivi des projets de la commune</p>
        </div>
      </header>
      
      {/* Statistiques */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total projets', value: pagination?.count || 0 },
            { label: 'En cours', value: projets?.filter(p => p.statut === 'en_cours').length || 0 },
            { label: 'Terminés', value: projets?.filter(p => p.statut === 'termine').length || 0 },
            { 
              label: 'Budget total', 
              value: new Intl.NumberFormat('fr-FR', { 
                notation: 'compact',
                compactDisplay: 'short'
              }).format(projets?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0) + ' XAF'
            },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Liste */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded-full w-full"></div>
              </div>
            ))}
          </div>
        ) : projets && projets.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {projets.map(projet => (
                <Link
                  key={projet.id}
                  to={`/projets/${projet.slug}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  {projet.image_principale && (
                    <img
                      src={projet.image_principale}
                      alt={projet.titre}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {projet.titre}
                      </h2>
                      <span
                        className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                          projet.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                          projet.statut === 'termine' ? 'bg-green-100 text-green-700' :
                          projet.statut === 'planifie' ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {projet.statut_display}
                      </span>
                    </div>
                    
                    {projet.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {projet.description}
                      </p>
                    )}
                    
                    {/* Progression */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Avancement
                        </span>
                        <span className="font-medium">{projet.avancement}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${projet.avancement}%`,
                            backgroundColor: 
                              projet.avancement === 100 ? '#22c55e' :
                              projet.avancement > 50 ? '#3b82f6' :
                              '#f59e0b'
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Infos */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {projet.budget && (
                        <span className="flex items-center">
                          <Wallet className="w-4 h-4 mr-1" />
                          {new Intl.NumberFormat('fr-FR').format(projet.budget)} XAF
                        </span>
                      )}
                      {projet.date_debut && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(projet.date_debut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {projet.lieu && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {projet.lieu}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination?.hasNext && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition"
                  style={{ backgroundColor: tenant?.couleur_primaire || '#0066CC' }}
                >
                  Charger plus
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun projet publié.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProjetsPage;
