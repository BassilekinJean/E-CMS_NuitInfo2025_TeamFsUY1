/**
 * Page Détail Actualité - E-CMS
 */


import { Link, useParams } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useActualite } from '../hooks/useApi';
import { ArrowLeft, Calendar, Eye, Share2 } from 'lucide-react';

export function ActualiteDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tenant } = useTenant();
  const { data: actualite, isLoading, error } = useActualite(slug || '');
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !actualite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Actualité introuvable</h1>
          <Link to="/actualites" className="text-blue-600 hover:underline">
            Retour aux actualités
          </Link>
        </div>
      </div>
    );
  }
  
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: actualite.titre,
        text: actualite.resume,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Lien copié !');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="py-6 text-white"
        style={{ backgroundColor: tenant?.couleur_primaire || '#0066CC' }}
      >
        <div className="container mx-auto px-4">
          <Link to="/actualites" className="inline-flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux actualités
          </Link>
        </div>
      </header>
      
      {/* Article */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Image principale */}
        {actualite.image_principale && (
          <img
            src={actualite.image_principale}
            alt={actualite.titre}
            className="w-full h-64 md:h-96 object-cover rounded-xl mb-6"
          />
        )}
        
        {/* Métadonnées */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <span
            className="px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: tenant?.couleur_primaire + '20',
              color: tenant?.couleur_primaire
            }}
          >
            {actualite.categorie_display}
          </span>
          
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {actualite.date_publication && new Date(actualite.date_publication).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <Eye className="w-4 h-4 mr-1" />
            {actualite.nombre_vues} vues
          </div>
          
          <button
            onClick={handleShare}
            className="ml-auto flex items-center text-gray-500 hover:text-gray-700"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Partager
          </button>
        </div>
        
        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {actualite.titre}
        </h1>
        
        {/* Résumé */}
        {actualite.resume && (
          <p className="text-lg text-gray-600 mb-6 font-medium">
            {actualite.resume}
          </p>
        )}
        
        {/* Contenu */}
        {actualite.contenu && (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: actualite.contenu }}
          />
        )}
        
        {/* Auteur */}
        {actualite.auteur_nom && (
          <div className="border-t mt-8 pt-6">
            <p className="text-sm text-gray-500">
              Publié par <span className="font-medium text-gray-700">{actualite.auteur_nom}</span>
            </p>
          </div>
        )}
      </article>
    </div>
  );
}

export default ActualiteDetailPage;
