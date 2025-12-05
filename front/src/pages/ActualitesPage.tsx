/**
 * Page Liste Actualités - E-CMS
 */

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useActualites } from '../hooks/useApi';
import { ArrowLeft, Search, Calendar } from 'lucide-react';

export function ActualitesPage() {
  const { tenant } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const categorie = searchParams.get('categorie') || '';
  
  const { data: actualites, isLoading, pagination, loadMore } = useActualites({ 
    search: search || undefined,
    categorie: categorie || undefined 
  });
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('search') as string;
    setSearchParams(q ? { q } : {});
  };
  
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
          <h1 className="text-3xl font-bold">Actualités</h1>
          <p className="opacity-80 mt-2">Toutes les actualités de {tenant?.nom}</p>
        </div>
      </header>
      
      {/* Filtres */}
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={categorie}
            onChange={e => setSearchParams(e.target.value ? { categorie: e.target.value } : {})}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes catégories</option>
            <option value="communique">Communiqué</option>
            <option value="evenement">Événement</option>
            <option value="projet">Projet</option>
            <option value="service">Service</option>
            <option value="autre">Autre</option>
          </select>
        </form>
      </div>
      
      {/* Liste */}
      <main className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : actualites && actualites.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actualites.map(actu => (
                <Link
                  key={actu.id}
                  to={`/actualites/${actu.slug}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group"
                >
                  {actu.image_principale ? (
                    <img
                      src={actu.image_principale}
                      alt={actu.titre}
                      className="w-full h-48 object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div 
                      className="w-full h-48 flex items-center justify-center"
                      style={{ backgroundColor: tenant?.couleur_primaire + '20' }}
                    >
                      <Calendar className="w-12 h-12" style={{ color: tenant?.couleur_primaire }} />
                    </div>
                  )}
                  <div className="p-4">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: tenant?.couleur_primaire + '20',
                        color: tenant?.couleur_primaire
                      }}
                    >
                      {actu.categorie_display}
                    </span>
                    <h2 className="font-semibold text-gray-800 mt-2 line-clamp-2">
                      {actu.titre}
                    </h2>
                    {actu.resume && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                        {actu.resume}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                      <span>
                        {actu.date_publication && new Date(actu.date_publication).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span>{actu.nombre_vues} vues</span>
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
            <p className="text-gray-500">Aucune actualité trouvée.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ActualitesPage;
