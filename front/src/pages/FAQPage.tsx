import { useState } from 'react';
import { useFAQs } from '../hooks/useApi';
import { useTenant } from '../contexts/TenantContext';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react';

export function FAQPage() {
  const { tenant } = useTenant();
  const { data: faqs, isLoading } = useFAQs();
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  if (!tenant) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              {tenant.logo && (
                <img src={tenant.logo} alt={tenant.nom} className="w-10 h-10 rounded-full object-cover" />
              )}
              <span className="font-bold text-xl text-gray-800">{tenant.nom}</span>
            </Link>
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-800">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Foire Aux Questions</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Retrouvez ici les réponses aux questions les plus fréquentes posées par les citoyens.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : faqs && faqs.length > 0 ? (
            <div className="space-y-4">
              {faqs.map(faq => (
                <div 
                  key={faq.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-800 pr-8">{faq.question}</span>
                    {openId === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </button>
                  
                  {openId === faq.id && (
                    <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2">
                      <div className="h-px bg-gray-100 mb-4"></div>
                      <div className="text-gray-600 leading-relaxed prose prose-sm max-w-none">
                        {faq.reponse}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">Aucune question fréquente n'a été publiée pour le moment.</p>
            </div>
          )}

          {/* Contact support */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Vous ne trouvez pas la réponse à votre question ?</p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium shadow-sm hover:shadow transition"
              style={{ backgroundColor: tenant.couleur_primaire }}
            >
              <MessageCircle className="w-5 h-5" />
              Contactez-nous
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FAQPage;
