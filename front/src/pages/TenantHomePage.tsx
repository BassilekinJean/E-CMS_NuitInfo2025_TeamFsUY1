/**
 * Page Accueil Tenant - E-CMS
 * Page d'accueil d'un site communal
 */


import { Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useActualites, useEvenements, useProjets, useTenantStats } from '../hooks/useApi';
import { Calendar, Newspaper, Building2, Users, FileText, MapPin } from 'lucide-react';
import { NewsletterSubscribe } from '../components/NewsletterSubscribe';

export function TenantHomePage() {
  const { tenant, isLoading: tenantLoading, error: tenantError } = useTenant();
  const { data: actualites, isLoading: actualitesLoading } = useActualites();
  const { data: evenements, isLoading: evenementsLoading } = useEvenements({ a_venir: true });
  const { data: projets } = useProjets({ statut: 'en_cours' });
  const { data: stats } = useTenantStats();
  
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (tenantError || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Site introuvable</h1>
          <p className="text-gray-600 mb-6">{tenantError || 'Cette commune n\'existe pas ou n\'est pas active.'}</p>
          <a href="https://ecms.cm" className="text-blue-600 hover:underline">
            Retour au portail national
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec bannière */}
      <header 
        className="relative h-64 md:h-80 bg-cover bg-center"
        style={{ 
          backgroundImage: tenant.banniere ? `url(${tenant.banniere})` : undefined,
          backgroundColor: tenant.couleur_primaire 
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="flex items-center gap-6">
            {tenant.logo && (
              <img 
                src={tenant.logo} 
                alt={`Logo ${tenant.nom}`}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            )}
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{tenant.nom}</h1>
              {tenant.departement_nom && (
                <p className="text-lg opacity-90 mt-1">
                  {tenant.departement_nom}, {tenant.region_nom}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <ul className="flex gap-1 overflow-x-auto py-2">
            {[
              { to: '/', label: 'Accueil', icon: Building2 },
              { to: '/actualites', label: 'Actualités', icon: Newspaper },
              { to: '/evenements', label: 'Agenda', icon: Calendar },
              { to: '/projets', label: 'Projets', icon: FileText },
              { to: '/services', label: 'Services', icon: Users },
              { to: '/contact', label: 'Contact', icon: MapPin },
            ].map(item => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition whitespace-nowrap"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Mot du maire */}
        {tenant.mot_du_maire && (
          <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {tenant.photo_maire && (
                <img 
                  src={tenant.photo_maire} 
                  alt={tenant.nom_maire || 'Le Maire'}
                  className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Mot du Maire
                </h2>
                {tenant.nom_maire && (
                  <p className="text-sm text-gray-500 mb-3">{tenant.nom_maire}</p>
                )}
                <p className="text-gray-600 leading-relaxed">
                  {tenant.mot_du_maire}
                </p>
              </div>
            </div>
          </section>
        )}
        
        {/* Statistiques */}
        {stats && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Actualités', value: stats.actualites, icon: Newspaper },
              { label: 'Événements', value: stats.evenements, icon: Calendar },
              { label: 'Projets', value: stats.projets, icon: FileText },
              { label: 'Services', value: stats.services, icon: Users },
            ].map(stat => (
              <div 
                key={stat.label}
                className="bg-white rounded-xl shadow-sm p-4 text-center"
              >
                <stat.icon 
                  className="w-8 h-8 mx-auto mb-2" 
                  style={{ color: tenant.couleur_primaire }}
                />
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </section>
        )}
        
        {/* Actualités récentes */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Actualités</h2>
            <Link 
              to="/actualites" 
              className="text-blue-600 hover:underline text-sm"
            >
              Voir tout →
            </Link>
          </div>
          
          {actualitesLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {actualites?.slice(0, 3).map(actu => (
                <Link 
                  key={actu.id}
                  to={`/actualites/${actu.slug}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group"
                >
                  {actu.image_principale && (
                    <img 
                      src={actu.image_principale}
                      alt={actu.titre}
                      className="w-full h-40 object-cover group-hover:scale-105 transition"
                    />
                  )}
                  <div className="p-4">
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: tenant.couleur_primaire + '20',
                        color: tenant.couleur_primaire 
                      }}
                    >
                      {actu.categorie_display}
                    </span>
                    <h3 className="font-semibold text-gray-800 mt-2 line-clamp-2">
                      {actu.titre}
                    </h3>
                    {actu.resume && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {actu.resume}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {actu.date_publication && new Date(actu.date_publication).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        {/* Événements à venir */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
            <Link 
              to="/evenements" 
              className="text-blue-600 hover:underline text-sm"
            >
              Voir tout →
            </Link>
          </div>
          
          {evenementsLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {evenements?.slice(0, 3).map(evt => (
                <Link
                  key={evt.id}
                  to={`/evenements/${evt.slug}`}
                  className="bg-white rounded-xl shadow-sm p-4 flex gap-4 hover:shadow-md transition"
                >
                  <div 
                    className="w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white"
                    style={{ backgroundColor: tenant.couleur_primaire }}
                  >
                    <span className="text-2xl font-bold">
                      {new Date(evt.date).getDate()}
                    </span>
                    <span className="text-xs uppercase">
                      {new Date(evt.date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{evt.nom}</h3>
                    <p className="text-sm text-gray-500">
                      {evt.heure_debut} • {evt.lieu}
                    </p>
                    {evt.inscription_requise && (
                      <span className="text-xs text-orange-600 mt-1 inline-block">
                        Inscription requise
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        {/* Projets en cours */}
        {projets && projets.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Projets en cours</h2>
              <Link 
                to="/projets" 
                className="text-blue-600 hover:underline text-sm"
              >
                Voir tout →
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {projets.slice(0, 2).map(projet => (
                <Link
                  key={projet.id}
                  to={`/projets/${projet.slug}`}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">{projet.titre}</h3>
                  {projet.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {projet.description}
                    </p>
                  )}
                  
                  {/* Barre de progression */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Avancement</span>
                      <span className="font-medium">{projet.avancement}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${projet.avancement}%`,
                          backgroundColor: tenant.couleur_primaire 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {projet.budget && (
                    <p className="text-sm text-gray-500">
                      Budget: {new Intl.NumberFormat('fr-FR', { 
                        style: 'currency', 
                        currency: 'XAF',
                        maximumFractionDigits: 0 
                      }).format(projet.budget)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter */}
        <section className="mt-12">
          <NewsletterSubscribe />
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              {tenant.adresse && <p className="text-gray-400 text-sm mb-2">{tenant.adresse}</p>}
              {tenant.telephone && <p className="text-gray-400 text-sm mb-2">Tél: {tenant.telephone}</p>}
              {tenant.email && <p className="text-gray-400 text-sm">{tenant.email}</p>}
            </div>
            <div>
              <h3 className="font-bold mb-4">Horaires</h3>
              {tenant.horaires_ouverture && Object.entries(tenant.horaires_ouverture).map(([jour, horaire]) => (
                <p key={jour} className="text-gray-400 text-sm">
                  {jour}: {horaire}
                </p>
              ))}
            </div>
            <div>
              <h3 className="font-bold mb-4">Liens utiles</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/pages/mentions-legales" className="text-gray-400 hover:text-white">Mentions légales</Link></li>
                <li><Link to="/pages/accessibilite" className="text-gray-400 hover:text-white">Accessibilité</Link></li>
                <li><a href="https://ecms.cm" className="text-gray-400 hover:text-white">Portail national E-CMS</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} {tenant.nom} - Propulsé par E-CMS
          </div>
        </div>
      </footer>
    </div>
  );
}

export default TenantHomePage;
