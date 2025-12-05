/**
 * Page Détail Projet - E-CMS
 */

import { useParams, Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useProjet } from '../hooks/useApi';
import { ArrowLeft, Calendar, MapPin, Banknote, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function ProjetDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tenant } = useTenant();
  const { data: projet, isLoading, error } = useProjet(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !projet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Projet introuvable</h1>
        <Link to="/projets" className="text-blue-600 hover:underline">
          Retour à la liste des projets
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64 md:h-96 bg-gray-900">
        {projet.image_principale ? (
          <img 
            src={projet.image_principale} 
            alt={projet.titre} 
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-blue-700 opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white container mx-auto">
          <Link to="/projets" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux projets
          </Link>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              {projet.categorie_display}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              projet.statut === 'termine' ? 'bg-green-500/80' :
              projet.statut === 'en_cours' ? 'bg-blue-500/80' :
              'bg-gray-500/80'
            }`}>
              {projet.statut_display}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{projet.titre}</h1>
          {projet.lieu && (
            <div className="flex items-center text-white/90">
              <MapPin className="w-5 h-5 mr-2" />
              {projet.lieu}
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">À propos du projet</h2>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                {projet.description}
              </div>
            </div>

            {/* Avancement */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">État d'avancement</h2>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      Progression
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {projet.avancement}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-blue-100">
                  <div 
                    style={{ width: `${projet.avancement}%`, backgroundColor: tenant?.couleur_primaire || '#0066CC' }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out"
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className={`text-center p-4 rounded-lg ${projet.avancement > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                    <div className="font-bold mb-1">Démarrage</div>
                    <div className="text-sm">Études & Lancement</div>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${projet.avancement >= 50 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                    <div className="font-bold mb-1">Réalisation</div>
                    <div className="text-sm">Travaux en cours</div>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${projet.avancement === 100 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                    <div className="font-bold mb-1">Livraison</div>
                    <div className="text-sm">Projet terminé</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Carte Info Clés */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Informations clés</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <span className="block text-sm text-gray-500">Date de début</span>
                    <span className="font-medium text-gray-800">
                      {projet.date_debut ? new Date(projet.date_debut).toLocaleDateString('fr-FR') : 'Non définie'}
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <span className="block text-sm text-gray-500">Date de fin prévue</span>
                    <span className="font-medium text-gray-800">
                      {projet.date_fin ? new Date(projet.date_fin).toLocaleDateString('fr-FR') : 'Non définie'}
                    </span>
                  </div>
                </li>
                {projet.budget && (
                  <li className="flex items-start">
                    <Banknote className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500">Budget alloué</span>
                      <span className="font-medium text-gray-800">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(projet.budget)}
                      </span>
                    </div>
                  </li>
                )}
                {projet.budget_depense && (
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500">Budget consommé</span>
                      <span className="font-medium text-gray-800">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(projet.budget_depense)}
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Contact Responsable */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Une question sur ce projet ?</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Pour toute question relative à ce projet, vous pouvez contacter les services techniques de la mairie.
                  </p>
                  <Link 
                    to="/contact" 
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Nous contacter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProjetDetailPage;
