/**
 * Page CMS dynamique - E-CMS
 */


import { Link, useParams } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { usePage } from '../hooks/useApi';
import { ArrowLeft } from 'lucide-react';

export function PageCMSPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tenant } = useTenant();
  const { data: page, isLoading, error } = usePage(slug || '');
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse max-w-3xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
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
  
  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Page introuvable</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }
  
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
          <h1 className="text-3xl font-bold">{page.titre}</h1>
        </div>
      </header>
      
      {/* Contenu */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {page.contenu ? (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.contenu }}
            />
          ) : (
            <p className="text-gray-500 text-center">Cette page n'a pas encore de contenu.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default PageCMSPage;
