import { useServicesMunicipaux } from '../hooks/useApi';
import { useTenant } from '../contexts/TenantContext';
import { Link } from 'react-router-dom';
import { Users, Clock, Phone, Mail, FileText, ArrowRight } from 'lucide-react';

export function ServicesPage() {
  const { tenant } = useTenant();
  const { data: services, isLoading } = useServicesMunicipaux();

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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Services Municipaux</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez l'ensemble des services de votre mairie à votre disposition.
              Retrouvez les horaires, contacts et démarches associées à chaque service.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services?.map(service => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col h-full">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: tenant.couleur_primaire + '20', color: tenant.couleur_primaire }}
                  >
                    <Users className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{service.nom}</h3>
                  
                  {service.description && (
                    <p className="text-gray-600 text-sm mb-4 flex-grow">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="space-y-3 pt-4 border-t border-gray-100 mt-auto">
                    {service.responsable && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>Resp: {service.responsable}</span>
                      </div>
                    )}
                    
                    {service.horaires && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{service.horaires}</span>
                      </div>
                    )}
                    
                    {service.telephone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${service.telephone}`} className="hover:text-blue-600 transition">
                          {service.telephone}
                        </a>
                      </div>
                    )}
                    
                    {service.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${service.email}`} className="hover:text-blue-600 transition truncate">
                          {service.email}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link 
                      to={`/contact?service=${service.id}`}
                      className="flex items-center justify-between text-sm font-medium hover:underline"
                      style={{ color: tenant.couleur_primaire }}
                    >
                      Contacter ce service
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Section Démarches en ligne */}
          <div className="mt-16">
            <div className="bg-blue-50 rounded-2xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Démarches en ligne</h2>
                  <p className="text-gray-600 mb-6">
                    Gagnez du temps en effectuant vos démarches administratives directement en ligne.
                    Suivez l'avancement de vos dossiers en temps réel.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      to="/suivi-demarche" 
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow transition flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Suivre une démarche
                    </Link>
                    <Link 
                      to="/contact" 
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition"
                    >
                      Faire une demande
                    </Link>
                  </div>
                </div>
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <FileText className="w-24 h-24 text-blue-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ServicesPage;
