/**
 * Page Agenda/Événements - E-CMS
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useEvenements, useEvenement } from '../hooks/useApi';
import { evenementService } from '../api/services';
import { ArrowLeft, Calendar, MapPin, Clock, Users, X } from 'lucide-react';

export function EvenementsPage() {
  const { tenant } = useTenant();
  const { data: evenements, isLoading, pagination, loadMore } = useEvenements({ a_venir: true });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  
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
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="opacity-80 mt-2">Événements à venir</p>
        </div>
      </header>
      
      {/* Liste */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse flex gap-6">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : evenements && evenements.length > 0 ? (
          <>
            <div className="space-y-4">
              {evenements.map(evt => {
                const date = new Date(evt.date);
                const isPast = date < new Date();
                
                return (
                  <div
                    key={evt.id}
                    className={`bg-white rounded-xl shadow-sm p-6 flex gap-6 cursor-pointer hover:shadow-md transition ${isPast ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedSlug(evt.slug)}
                  >
                    {/* Date */}
                    <div 
                      className="w-20 h-20 rounded-lg flex flex-col items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: tenant?.couleur_primaire || '#0066CC' }}
                    >
                      <span className="text-2xl font-bold">{date.getDate()}</span>
                      <span className="text-xs uppercase">
                        {date.toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    
                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                          {evt.nom}
                        </h2>
                        <span
                          className="text-xs px-2 py-1 rounded-full shrink-0"
                          style={{
                            backgroundColor: tenant?.couleur_primaire + '20',
                            color: tenant?.couleur_primaire
                          }}
                        >
                          {evt.categorie_display}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {evt.heure_debut}
                          {evt.heure_fin && ` - ${evt.heure_fin}`}
                        </span>
                        {evt.lieu && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {evt.lieu}
                          </span>
                        )}
                        {evt.inscription_requise && (
                          <span className="flex items-center text-orange-600">
                            <Users className="w-4 h-4 mr-1" />
                            Inscription requise
                            {evt.places_limitees && evt.places_restantes !== undefined && (
                              <> ({evt.places_restantes} places)</>
                            )}
                          </span>
                        )}
                      </div>
                      
                      {evt.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun événement à venir.</p>
          </div>
        )}
      </main>
      
      {/* Modal détail */}
      {selectedSlug && (
        <EvenementModal slug={selectedSlug} onClose={() => setSelectedSlug(null)} />
      )}
    </div>
  );
}

function EvenementModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { tenant } = useTenant();
  const { data: evt, isLoading } = useEvenement(slug);
  const [showInscription, setShowInscription] = useState(false);
  const [inscriptionData, setInscriptionData] = useState({ nom: '', email: '', telephone: '' });
  const [inscriptionStatus, setInscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setInscriptionStatus('loading');
    
    try {
      await evenementService.inscrire(slug, inscriptionData);
      setInscriptionStatus('success');
    } catch {
      setInscriptionStatus('error');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ) : evt ? (
          <>
            {/* Header */}
            <div className="relative">
              {evt.image ? (
                <img src={evt.image} alt={evt.nom} className="w-full h-48 object-cover" />
              ) : (
                <div 
                  className="w-full h-32"
                  style={{ backgroundColor: tenant?.couleur_primaire || '#0066CC' }}
                />
              )}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Contenu */}
            <div className="p-6">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: tenant?.couleur_primaire + '20',
                  color: tenant?.couleur_primaire
                }}
              >
                {evt.categorie_display}
              </span>
              
              <h2 className="text-2xl font-bold text-gray-800 mt-3">{evt.nom}</h2>
              
              <div className="flex flex-col gap-2 mt-4 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3" style={{ color: tenant?.couleur_primaire }} />
                  {new Date(evt.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3" style={{ color: tenant?.couleur_primaire }} />
                  {evt.heure_debut}{evt.heure_fin && ` - ${evt.heure_fin}`}
                </div>
                {evt.lieu && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3" style={{ color: tenant?.couleur_primaire }} />
                    {evt.lieu}
                  </div>
                )}
              </div>
              
              {evt.description && (
                <p className="text-gray-600 mt-4">{evt.description}</p>
              )}
              
              {/* Inscription */}
              {evt.inscription_requise && (
                <div className="mt-6 pt-6 border-t">
                  {inscriptionStatus === 'success' ? (
                    <div className="text-green-600 text-center py-4">
                      ✓ Inscription enregistrée ! Vous recevrez une confirmation par email.
                    </div>
                  ) : showInscription ? (
                    <form onSubmit={handleInscription} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                        <input
                          type="text"
                          required
                          value={inscriptionData.nom}
                          onChange={e => setInscriptionData(d => ({ ...d, nom: e.target.value }))}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={inscriptionData.email}
                          onChange={e => setInscriptionData(d => ({ ...d, email: e.target.value }))}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                          type="tel"
                          value={inscriptionData.telephone}
                          onChange={e => setInscriptionData(d => ({ ...d, telephone: e.target.value }))}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {inscriptionStatus === 'error' && (
                        <p className="text-red-500 text-sm">Erreur lors de l'inscription. Veuillez réessayer.</p>
                      )}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowInscription(false)}
                          className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={inscriptionStatus === 'loading'}
                          className="flex-1 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: tenant?.couleur_primaire || '#0066CC' }}
                        >
                          {inscriptionStatus === 'loading' ? 'Envoi...' : 'Confirmer'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowInscription(true)}
                      className="w-full py-3 text-white rounded-lg font-medium hover:opacity-90"
                      style={{ backgroundColor: tenant?.couleur_primaire || '#0066CC' }}
                    >
                      S'inscrire à cet événement
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default EvenementsPage;
