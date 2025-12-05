/**
 * Page Publique du Site Communal - E-CMS
 * Affiche le site personnalisé par le gérant (accessible aux visiteurs sans connexion)
 */

import { Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { usePublications, useEvents } from '../hooks/useCMSData';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  FileText, 
  Home, 
  Mail, 
  Menu,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  ChevronRight,
  Users,
  Newspaper
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Types
interface SiteConfig {
  general: {
    nomMairie: string;
    slogan: string;
    description: string;
    logo: string | null;
    bannerImage: string | null;
  };
  contact: {
    adresse: string;
    telephone: string;
    email: string;
    horaires: string;
  };
  couleurs: {
    primary: string;
    secondary: string;
    accent: string;
  };
  sections: {
    id: string;
    type: string;
    title: string;
    enabled: boolean;
    order: number;
  }[];
}

const defaultConfig: SiteConfig = {
  general: {
    nomMairie: 'Mairie',
    slogan: 'Au service des citoyens',
    description: 'Bienvenue sur le site officiel de la Mairie. Retrouvez toutes les informations sur les services, événements et actualités de votre commune.',
    logo: null,
    bannerImage: null,
  },
  contact: {
    adresse: 'Place de la Mairie, Centre-ville',
    telephone: '+237 222 22 22 22',
    email: 'contact@mairie.cm',
    horaires: 'Lun-Ven: 8h-17h',
  },
  couleurs: {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#10B981',
  },
  sections: [
    { id: 'hero', type: 'hero', title: 'Bannière principale', enabled: true, order: 1 },
    { id: 'services', type: 'services', title: 'Nos Services', enabled: true, order: 2 },
    { id: 'actualites', type: 'actualites', title: 'Actualités', enabled: true, order: 3 },
    { id: 'evenements', type: 'evenements', title: 'Événements', enabled: true, order: 4 },
    { id: 'contact', type: 'contact', title: 'Contact', enabled: true, order: 5 },
  ],
};

export function PublicSitePage() {
  const { tenant, tenantSlug, isLoading: tenantLoading, error: tenantError } = useTenant();
  const { publications, loading: pubLoading } = usePublications();
  const { events, loading: eventsLoading } = useEvents();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  
  // Charger la config depuis localStorage (sauvegardée par l'éditeur)
  useEffect(() => {
    if (tenantSlug) {
      const savedConfig = localStorage.getItem(`site_config_${tenantSlug}`);
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {
          console.error('Erreur parsing config:', e);
        }
      }
    }
  }, [tenantSlug]);
  
  // Mettre à jour avec les données du tenant
  useEffect(() => {
    if (tenant) {
      setConfig(prev => ({
        ...prev,
        general: {
          ...prev.general,
          nomMairie: tenant.nom || prev.general.nomMairie,
          logo: tenant.logo || prev.general.logo,
          bannerImage: tenant.banniere || prev.general.bannerImage,
        },
        contact: {
          ...prev.contact,
          telephone: tenant.telephone || prev.contact.telephone,
          email: tenant.email || prev.contact.email,
          adresse: tenant.adresse || prev.contact.adresse,
        },
        couleurs: {
          primary: tenant.couleur_primaire || prev.couleurs.primary,
          secondary: tenant.couleur_secondaire || prev.couleurs.secondary,
          accent: prev.couleurs.accent,
        },
      }));
    }
  }, [tenant]);
  
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du site...</p>
        </div>
      </div>
    );
  }
  
  if (tenantError || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Site introuvable</h1>
          <p className="text-gray-600 mb-6">{tenantError || 'Cette commune n\'existe pas ou n\'est pas active.'}</p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }
  
  const navLinks = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/actualites', label: 'Actualités', icon: Newspaper },
    { to: '/evenements', label: 'Agenda', icon: Calendar },
    { to: '/services', label: 'Services', icon: Users },
    { to: '/contact', label: 'Contact', icon: MapPin },
  ];
  
  const isSectionEnabled = (sectionId: string) => {
    const section = config.sections.find(s => s.id === sectionId);
    return section?.enabled !== false;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <header 
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${config.couleurs.primary}, ${config.couleurs.secondary})` }}
      >
        {/* Navigation */}
        <nav className="relative z-20 flex items-center justify-between px-4 md:px-8 py-4 text-white">
          <Link to="/" className="flex items-center gap-3">
            {config.general.logo ? (
              <img src={config.general.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
            ) : (
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
            )}
            <span className="font-bold text-xl hidden sm:block">{config.general.nomMairie}</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white/90 hover:text-white font-medium transition-colors flex items-center gap-2"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </nav>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-xl z-50 py-4">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 transition"
              >
                <link.icon className="w-5 h-5" style={{ color: config.couleurs.primary }} />
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Hero Section */}
        <div className="relative px-4 md:px-8 py-16 md:py-24 text-white">
          {config.general.bannerImage && (
            <div 
              className="absolute inset-0 opacity-30"
              style={{ 
                backgroundImage: `url(${config.general.bannerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{config.general.slogan}</h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              {config.general.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/services"
                className="px-8 py-3 bg-white rounded-xl font-semibold text-lg transition-transform hover:scale-105 shadow-lg"
                style={{ color: config.couleurs.primary }}
              >
                Découvrir nos services
              </Link>
              <Link 
                to="/contact"
                className="px-8 py-3 bg-white/20 backdrop-blur rounded-xl font-semibold text-lg text-white transition-transform hover:scale-105"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      {isSectionEnabled('services') && (
        <section className="px-4 md:px-8 py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">Nos Services</h2>
            <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
              Découvrez les services municipaux à votre disposition
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: FileText, label: 'État Civil', desc: 'Actes et documents' },
                { icon: Home, label: 'Urbanisme', desc: 'Permis et constructions' },
                { icon: Calendar, label: 'Événements', desc: 'Agenda culturel' },
                { icon: Mail, label: 'Contact', desc: 'Nous joindre' },
              ].map((service, i) => (
                <div 
                  key={i} 
                  className="p-6 bg-white rounded-2xl text-center hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
                >
                  <div 
                    className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: config.couleurs.primary }}
                  >
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{service.label}</h3>
                  <p className="text-sm text-gray-500">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Actualités Section */}
      {isSectionEnabled('actualites') && (
        <section className="px-4 md:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Actualités</h2>
                <p className="text-gray-500 mt-1">Les dernières nouvelles de votre commune</p>
              </div>
              <Link 
                to="/actualites"
                className="hidden md:flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
                style={{ color: config.couleurs.primary }}
              >
                Voir toutes les actualités <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {pubLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: config.couleurs.primary }}></div>
              </div>
            ) : publications.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {publications.slice(0, 3).map((pub) => (
                  <article key={pub.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
                    {pub.image && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={pub.image} 
                          alt={pub.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <span 
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${config.couleurs.accent}20`, color: config.couleurs.accent }}
                      >
                        {pub.category}
                      </span>
                      <h3 className="font-bold text-gray-800 mt-3 text-lg line-clamp-2">{pub.title}</h3>
                      <p className="text-gray-500 mt-2 text-sm line-clamp-2">{pub.content}</p>
                      <Link 
                        to={`/actualites/${pub.slug}`}
                        className="inline-flex items-center gap-1 mt-4 text-sm font-medium transition-all hover:gap-2"
                        style={{ color: config.couleurs.primary }}
                      >
                        Lire la suite <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <FileText className="w-14 h-14 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Aucune actualité pour le moment</p>
              </div>
            )}
            
            <Link 
              to="/actualites"
              className="md:hidden flex items-center justify-center gap-2 mt-8 py-3 text-sm font-medium"
              style={{ color: config.couleurs.primary }}
            >
              Voir toutes les actualités <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Événements Section */}
      {isSectionEnabled('evenements') && (
        <section className="px-4 md:px-8 py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Événements à venir</h2>
                <p className="text-gray-500 mt-1">Ne manquez aucun rendez-vous</p>
              </div>
              <Link 
                to="/evenements"
                className="hidden md:flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
                style={{ color: config.couleurs.primary }}
              >
                Voir l'agenda complet <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {eventsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: config.couleurs.primary }}></div>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.slice(0, 4).map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div 
                      className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 shadow-lg"
                      style={{ backgroundColor: config.couleurs.primary }}
                    >
                      <span className="text-xs font-medium opacity-80 uppercase">
                        {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                      <span className="text-2xl font-bold">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {event.startTime} - {event.endTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <Link 
                      to="/evenements"
                      className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${config.couleurs.primary}15`, color: config.couleurs.primary }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Calendar className="w-14 h-14 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Aucun événement à venir</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact Section */}
      {isSectionEnabled('contact') && (
        <section className="px-4 md:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Contactez-nous</h2>
                <p className="text-gray-500 mb-8">
                  Notre équipe est à votre disposition pour répondre à vos questions.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.couleurs.primary}15` }}
                    >
                      <MapPin className="w-6 h-6" style={{ color: config.couleurs.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Adresse</h3>
                      <p className="text-gray-500">{config.contact.adresse}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.couleurs.primary}15` }}
                    >
                      <Phone className="w-6 h-6" style={{ color: config.couleurs.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Téléphone</h3>
                      <p className="text-gray-500">{config.contact.telephone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.couleurs.primary}15` }}
                    >
                      <Mail className="w-6 h-6" style={{ color: config.couleurs.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Email</h3>
                      <p className="text-gray-500">{config.contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.couleurs.primary}15` }}
                    >
                      <Clock className="w-6 h-6" style={{ color: config.couleurs.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Horaires</h3>
                      <p className="text-gray-500">{config.contact.horaires}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Contact Form */}
              <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                <h3 className="font-bold text-gray-800 text-xl mb-6">Envoyez-nous un message</h3>
                <form className="space-y-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Votre nom"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent transition"
                      style={{ '--tw-ring-color': `${config.couleurs.primary}40` } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <input 
                      type="email" 
                      placeholder="Votre email"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder="Votre message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent transition resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 text-white font-semibold rounded-xl transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: config.couleurs.primary }}
                  >
                    Envoyer le message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer 
        className="text-white py-12 px-4 md:px-8"
        style={{ backgroundColor: config.couleurs.secondary }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {config.general.logo ? (
                  <img src={config.general.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7" />
                  </div>
                )}
                <span className="font-bold text-xl">{config.general.nomMairie}</span>
              </div>
              <p className="text-white/70 mb-4">{config.general.description}</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Liens rapides */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-white/70">
                {navLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-white transition">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {config.contact.adresse}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {config.contact.telephone}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  {config.contact.email}
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm">
            <p>© {new Date().getFullYear()} {config.general.nomMairie}. Tous droits réservés.</p>
            <p className="mt-1">Propulsé par E-CMS - Plateforme de gestion municipale</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicSitePage;
