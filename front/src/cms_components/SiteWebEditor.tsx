// cms_components/SiteWebEditor.tsx - Éditeur de site web avec upload d'images
import { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Save,
  Eye,
  Palette,
  MapPin,
  Clock,
  Phone,
  Building2,
  FileText,
  Settings,
  Layers,
  Menu,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Home,
  Upload,
  Image,
  X,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { usePublications, useEvents } from '../hooks/useCMSData';
import { useTenant } from '../contexts/TenantContext';

interface DashboardContextType {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

interface SiteConfig {
  general: {
    nomMairie: string;
    slogan: string;
    description: string;
    logo: string | null;
    bannerImage: string | null;
    favicon: string | null;
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

// Types pour les données du backend
interface Publication {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: string;
  image?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
}

const defaultConfig: SiteConfig = {
  general: {
    nomMairie: 'Mairie de Yaoundé',
    slogan: 'Au service des citoyens',
    description: 'Bienvenue sur le site officiel de la Mairie. Retrouvez toutes les informations sur les services, événements et actualités de votre commune.',
    logo: null,
    bannerImage: null,
    favicon: null,
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

const colorPresets = [
  { primary: '#3B82F6', secondary: '#1E40AF', accent: '#10B981', name: 'Bleu Classique' },
  { primary: '#059669', secondary: '#047857', accent: '#F59E0B', name: 'Vert Nature' },
  { primary: '#7C3AED', secondary: '#5B21B6', accent: '#EC4899', name: 'Violet Royal' },
  { primary: '#DC2626', secondary: '#991B1B', accent: '#F97316', name: 'Rouge Passion' },
  { primary: '#0891B2', secondary: '#0E7490', accent: '#14B8A6', name: 'Cyan Moderne' },
];

// Composant d'upload d'image
const ImageUploader = ({ 
  label, 
  value, 
  onChange, 
  aspectRatio = '16/9',
  description 
}: { 
  label: string; 
  value: string | null; 
  onChange: (url: string | null) => void;
  aspectRatio?: string;
  description?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setUploading(true);
    
    // Simulation d'upload - À remplacer par un vrai appel API
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/upload', { method: 'POST', body: formData });
      // const data = await response.json();
      // onChange(data.url);
      
      // Pour la démo, on utilise un URL local
      const url = URL.createObjectURL(file);
      onChange(url);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      
      <div
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}
          ${value ? 'p-2' : 'p-6'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{ aspectRatio: value ? aspectRatio : 'auto' }}
      >
        {value ? (
          <div className="relative w-full h-full group">
            <img 
              src={value} 
              alt={label} 
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-700" />
              </button>
              <button
                onClick={() => onChange(null)}
                className="p-2 bg-white rounded-lg hover:bg-red-100 transition-colors"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            ) : (
              <>
                <Image className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 font-medium">
                  Glissez une image ici ou
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Parcourir
                </button>
              </>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      </div>
    </div>
  );
};

// Preview Desktop du site
const SitePreview = ({ 
  config, 
  device, 
  publications, 
  events 
}: { 
  config: SiteConfig; 
  device: 'desktop' | 'tablet' | 'mobile';
  publications: Publication[];
  events: Event[];
}) => {
  const getDeviceClass = () => {
    switch(device) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      default: return 'w-full max-w-[1200px]';
    }
  };

  return (
    <div className={`mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${getDeviceClass()}`}>
      {/* Header */}
      <header 
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${config.couleurs.primary}, ${config.couleurs.secondary})` }}
      >
        {/* Navigation */}
        <nav className="flex items-center justify-between px-4 md:px-8 py-4 text-white">
          <div className="flex items-center gap-3">
            {config.general.logo ? (
              <img src={config.general.logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <span className="font-bold text-lg hidden sm:block">{config.general.nomMairie}</span>
          </div>
          
          {device === 'mobile' ? (
            <Menu className="w-6 h-6" />
          ) : (
            <div className="flex items-center gap-6 text-sm font-medium">
              <a href="#" className="hover:opacity-80 transition-opacity">Accueil</a>
              <a href="#" className="hover:opacity-80 transition-opacity">Services</a>
              <a href="#" className="hover:opacity-80 transition-opacity">Actualités</a>
              <a href="#" className="hover:opacity-80 transition-opacity">Contact</a>
            </div>
          )}
        </nav>

        {/* Hero */}
        <div className="relative px-4 md:px-8 py-12 md:py-20 text-white">
          {config.general.bannerImage && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{ 
                backgroundImage: `url(${config.general.bannerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">{config.general.slogan}</h1>
            <p className="text-white/80 text-sm md:text-base mb-6">{config.general.description}</p>
            <div className="flex flex-wrap gap-3">
              <button 
                className="px-5 py-2.5 bg-white rounded-lg font-medium text-sm transition-transform hover:scale-105"
                style={{ color: config.couleurs.primary }}
              >
                Découvrir
              </button>
              <button className="px-5 py-2.5 bg-white/20 backdrop-blur rounded-lg font-medium text-sm transition-transform hover:scale-105">
                Nous contacter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Services */}
      {config.sections.find(s => s.id === 'services')?.enabled && (
        <section className="px-4 md:px-8 py-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 text-center">Nos Services</h2>
          <div className={`grid gap-4 ${device === 'mobile' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            {[
              { icon: FileText, label: 'État Civil' },
              { icon: Home, label: 'Urbanisme' },
              { icon: Calendar, label: 'Événements' },
              { icon: Mail, label: 'Contact' },
            ].map((service, i) => (
              <div 
                key={i} 
                className="p-4 md:p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 cursor-pointer group"
                style={{ backgroundColor: `${config.couleurs.primary}10` }}
              >
                <div 
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: config.couleurs.primary }}
                >
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium text-slate-700 text-sm">{service.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actualités */}
      {config.sections.find(s => s.id === 'actualites')?.enabled && (
        <section className="px-4 md:px-8 py-12 bg-slate-50">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 text-center">Actualités</h2>
          {publications.length > 0 ? (
            <div className={`grid gap-6 ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
              {publications.slice(0, 3).map((pub) => (
                <article key={pub.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                  {pub.image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={pub.image} 
                        alt={pub.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span 
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${config.couleurs.accent}20`, color: config.couleurs.accent }}
                    >
                      {pub.category}
                    </span>
                    <h3 className="font-semibold text-slate-800 mt-2 line-clamp-2">{pub.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{pub.content}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Les publications apparaîtront ici</p>
            </div>
          )}
        </section>
      )}

      {/* Événements */}
      {config.sections.find(s => s.id === 'evenements')?.enabled && (
        <section className="px-4 md:px-8 py-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 text-center">Événements à venir</h2>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.slice(0, 4).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: config.couleurs.primary }}
                  >
                    <span className="text-xs font-medium opacity-80">
                      {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{event.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {event.startTime}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Les événements apparaîtront ici</p>
            </div>
          )}
        </section>
      )}

      {/* Contact */}
      {config.sections.find(s => s.id === 'contact')?.enabled && (
        <section 
          className="px-4 md:px-8 py-12"
          style={{ backgroundColor: `${config.couleurs.primary}05` }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 text-center">Nous contacter</h2>
          <div className={`grid gap-6 ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'}`}>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-white shadow-sm" style={{ color: config.couleurs.primary }}>
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-600">{config.contact.adresse}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-white shadow-sm" style={{ color: config.couleurs.primary }}>
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-600">{config.contact.telephone}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-white shadow-sm" style={{ color: config.couleurs.primary }}>
                <Mail className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-600">{config.contact.email}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-white shadow-sm" style={{ color: config.couleurs.primary }}>
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-600">{config.contact.horaires}</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer 
        className="px-4 md:px-8 py-8 text-white"
        style={{ backgroundColor: config.couleurs.secondary }}
      >
        <div className={`grid gap-8 ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6" />
              <span className="font-bold">{config.general.nomMairie}</span>
            </div>
            <p className="text-sm opacity-80">{config.general.description.slice(0, 100)}...</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Liens rapides</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100">Accueil</a></li>
              <li><a href="#" className="hover:opacity-100">Services</a></li>
              <li><a href="#" className="hover:opacity-100">Actualités</a></li>
              <li><a href="#" className="hover:opacity-100">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Suivez-nous</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm opacity-60">
          © {new Date().getFullYear()} {config.general.nomMairie}. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

const SiteWebEditor = () => {
  const { setIsSidebarOpen } = useOutletContext<DashboardContextType>();
  const { tenant, tenantSlug } = useTenant();
  
  // Hooks pour charger les données API
  const { publications: apiPublications, loading: pubLoading } = usePublications();
  const { events: apiEvents, loading: eventsLoading } = useEvents();
  
  const [config, setConfig] = useState<SiteConfig>(() => ({
    ...defaultConfig,
    general: {
      ...defaultConfig.general,
      nomMairie: tenant?.nom || defaultConfig.general.nomMairie,
    },
    contact: {
      ...defaultConfig.contact,
      telephone: tenant?.telephone || defaultConfig.contact.telephone,
      email: tenant?.email || defaultConfig.contact.email,
      adresse: tenant?.adresse || defaultConfig.contact.adresse,
    },
  }));
  
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'couleurs' | 'sections'>('general');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Transformer les publications API en format attendu par SitePreview
  const publications: Publication[] = apiPublications.map(pub => ({
    id: pub.id,
    title: pub.title,
    content: pub.content,
    category: pub.category,
    createdAt: pub.createdAt,
    author: pub.author,
    image: pub.image,
  }));
  
  // Transformer les événements API en format attendu par SitePreview
  const events: Event[] = apiEvents.map(evt => ({
    id: evt.id,
    title: evt.title,
    date: evt.date,
    startTime: evt.startTime,
    endTime: evt.endTime,
    location: evt.location,
    category: evt.category,
  }));
  
  const loading = pubLoading || eventsLoading;

  // Mettre à jour la config quand le tenant change
  useEffect(() => {
    if (tenant) {
      setConfig(prev => ({
        ...prev,
        general: {
          ...prev.general,
          nomMairie: tenant.nom || prev.general.nomMairie,
        },
        contact: {
          ...prev.contact,
          telephone: tenant.telephone || prev.contact.telephone,
          email: tenant.email || prev.contact.email,
          adresse: tenant.adresse || prev.contact.adresse,
        },
      }));
    }
  }, [tenant]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sauvegarder dans localStorage pour que la page publique puisse y accéder
      if (tenantSlug) {
        localStorage.setItem(`site_config_${tenantSlug}`, JSON.stringify(config));
      }
      
      // TODO: Appel API pour sauvegarder la configuration en base de données
      // await fetch('/api/site-config', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Configuration sauvegardée ! Les modifications sont maintenant visibles sur le site public.');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };
  
  // Charger la configuration depuis localStorage au démarrage
  useEffect(() => {
    if (tenantSlug) {
      const savedConfig = localStorage.getItem(`site_config_${tenantSlug}`);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setConfig(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Erreur chargement config:', e);
        }
      }
    }
  }, [tenantSlug]);

  const tabs = [
    { id: 'general' as const, label: 'Général', icon: Globe },
    { id: 'contact' as const, label: 'Contact', icon: Phone },
    { id: 'couleurs' as const, label: 'Couleurs', icon: Palette },
    { id: 'sections' as const, label: 'Sections', icon: Layers },
  ];

  // Affichage si pas de tenant
  if (!tenantSlug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-lg max-w-md mx-4">
          <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Commune non détectée</h2>
          <p className="text-slate-500">
            Veuillez accéder au CMS via un sous-domaine de commune (ex: yaounde.localhost:5173)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Éditeur de Site
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">Personnalisez votre site municipal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Device switcher */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1">
                {[
                  { id: 'desktop' as const, icon: Monitor },
                  { id: 'tablet' as const, icon: Tablet },
                  { id: 'mobile' as const, icon: Smartphone },
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPreviewDevice(id)}
                    className={`p-2 rounded-lg transition-all ${
                      previewDevice === id 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all ${
                  showPreview 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Aperçu</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Sauvegarder</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar / Form */}
        <div className={`w-full lg:w-96 xl:w-[420px] bg-white/70 backdrop-blur-sm border-r border-slate-200/50 ${showPreview ? 'hidden lg:block' : ''}`}>
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200/50 px-2 sm:px-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de la mairie</label>
                  <input
                    type="text"
                    value={config.general.nomMairie}
                    onChange={(e) => setConfig({ ...config, general: { ...config.general, nomMairie: e.target.value } })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Slogan</label>
                  <input
                    type="text"
                    value={config.general.slogan}
                    onChange={(e) => setConfig({ ...config, general: { ...config.general, slogan: e.target.value } })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={config.general.description}
                    onChange={(e) => setConfig({ ...config, general: { ...config.general, description: e.target.value } })}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                <ImageUploader
                  label="Logo"
                  value={config.general.logo}
                  onChange={(url) => setConfig({ ...config, general: { ...config.general, logo: url } })}
                  aspectRatio="1/1"
                  description="Format carré recommandé (PNG, JPG)"
                />

                <ImageUploader
                  label="Image de bannière"
                  value={config.general.bannerImage}
                  onChange={(url) => setConfig({ ...config, general: { ...config.general, bannerImage: url } })}
                  aspectRatio="16/9"
                  description="Format 16:9 recommandé pour le header"
                />
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={config.contact.adresse}
                    onChange={(e) => setConfig({ ...config, contact: { ...config.contact, adresse: e.target.value } })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={config.contact.telephone}
                    onChange={(e) => setConfig({ ...config, contact: { ...config.contact, telephone: e.target.value } })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={config.contact.email}
                    onChange={(e) => setConfig({ ...config, contact: { ...config.contact, email: e.target.value } })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Horaires</label>
                  <input
                    type="text"
                    value={config.contact.horaires}
                    onChange={(e) => setConfig({ ...config, contact: { ...config.contact, horaires: e.target.value } })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
            )}

            {activeTab === 'couleurs' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Thèmes prédéfinis</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {colorPresets.map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => setConfig({ 
                          ...config, 
                          couleurs: { 
                            primary: preset.primary, 
                            secondary: preset.secondary, 
                            accent: preset.accent 
                          } 
                        })}
                        className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                          config.couleurs.primary === preset.primary 
                            ? 'border-blue-500 shadow-md' 
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: preset.primary }} />
                          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: preset.secondary }} />
                          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: preset.accent }} />
                        </div>
                        <p className="text-sm font-medium text-slate-700">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Personnaliser</label>
                  <div className="space-y-4">
                    {[
                      { key: 'primary' as const, label: 'Couleur principale' },
                      { key: 'secondary' as const, label: 'Couleur secondaire' },
                      { key: 'accent' as const, label: 'Couleur d\'accent' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-4">
                        <input
                          type="color"
                          value={config.couleurs[key]}
                          onChange={(e) => setConfig({ 
                            ...config, 
                            couleurs: { ...config.couleurs, [key]: e.target.value } 
                          })}
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{label}</p>
                          <p className="text-xs text-slate-500">{config.couleurs[key]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-sm text-slate-500 mb-4">Activez ou désactivez les sections de votre site</p>
                {config.sections.map((section) => (
                  <div 
                    key={section.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-slate-400" />
                      <span className="font-medium text-slate-700">{section.title}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => {
                          const newSections = config.sections.map(s => 
                            s.id === section.id ? { ...s, enabled: !s.enabled } : s
                          );
                          setConfig({ ...config, sections: newSections });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-auto ${!showPreview ? 'hidden lg:block' : ''}`} style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <div className="flex items-center justify-center min-h-full">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-slate-500">Chargement des données...</p>
              </div>
            ) : (
              <SitePreview 
                config={config} 
                device={previewDevice}
                publications={publications}
                events={events}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Preview Button (Mobile) */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center z-50"
      >
        {showPreview ? <Settings className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SiteWebEditor;
