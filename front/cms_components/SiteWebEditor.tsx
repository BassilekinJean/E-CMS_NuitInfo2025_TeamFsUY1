// cms_components/SiteWebEditor.tsx - Éditeur de site web de la mairie
import { useState } from 'react';
import {
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Save,
  Eye,
  Palette,
  Layout,
  Type,
  MapPin,
  Clock,
  Phone,
  Building2,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  AlertCircle,
  Undo,
  Redo,
  Layers,
  Star,
  Newspaper,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

interface DashboardContextType {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

// Types pour la configuration du site
interface SiteConfig {
  general: {
    nomMairie: string;
    slogan: string;
    logoUrl: string;
    couleurPrimaire: string;
    couleurSecondaire: string;
    adresse: string;
    telephone: string;
    email: string;
  };
  horaires: {
    [jour: string]: { ouverture: string; fermeture: string; ferme: boolean };
  };
  sections: {
    id: string;
    type: 'hero' | 'services' | 'actualites' | 'evenements' | 'contact' | 'equipe';
    titre: string;
    visible: boolean;
    ordre: number;
  }[];
  services: {
    id: string;
    titre: string;
    description: string;
    icone: string;
  }[];
}

type DeviceView = 'desktop' | 'tablet' | 'mobile';
type EditorTab = 'general' | 'sections' | 'couleurs' | 'contenu';

// Palette de couleurs prédéfinies
const COLOR_PALETTES = [
  { name: 'Bleu Républicain', primary: '#1e40af', secondary: '#3b82f6' },
  { name: 'Vert Nature', primary: '#166534', secondary: '#22c55e' },
  { name: 'Bordeaux Élégant', primary: '#7f1d1d', secondary: '#ef4444' },
  { name: 'Violet Moderne', primary: '#5b21b6', secondary: '#8b5cf6' },
  { name: 'Indigo Pro', primary: '#3730a3', secondary: '#6366f1' },
  { name: 'Bleu Marine', primary: '#1e3a5f', secondary: '#3b82f6' },
];

// Prévisualisation Mobile
const MobilePreviewFrame = ({ config }: { config: SiteConfig }) => {
  const [activeNav, setActiveNav] = useState<'accueil' | 'actus' | 'services'>('accueil');
  
  return (
    <div className="relative mx-auto" style={{ width: '320px' }}>
      <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-900 rounded-b-2xl z-10" />
        
        <div className="bg-white rounded-[2.25rem] overflow-hidden h-[640px] flex flex-col">
          {/* Status bar */}
          <div style={{ background: `linear-gradient(135deg, ${config.general.couleurPrimaire}, ${config.general.couleurSecondaire})` }} 
               className="px-6 py-2 flex justify-between items-center text-white text-xs">
            <span className="font-medium">9:41</span>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span>5G</span>
            </div>
          </div>
          
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${config.general.couleurPrimaire}, ${config.general.couleurSecondaire})` }}
               className="px-4 pb-6 pt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-base">{config.general.nomMairie}</h1>
                  <p className="text-white/70 text-[11px]">{config.general.slogan}</p>
                </div>
              </div>
              <Menu className="w-6 h-6 text-white" />
            </div>
            
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <Eye className="w-4 h-4 text-white/70" />
              <span className="text-white/80 text-sm">Rechercher...</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {activeNav === 'accueil' && (
              <div className="p-4 space-y-4">
                {/* Hero Card */}
                <div style={{ background: `linear-gradient(135deg, ${config.general.couleurPrimaire}ee, ${config.general.couleurSecondaire}ee)` }}
                     className="rounded-2xl p-4 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm font-semibold">À la une</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Marché de Noël 2025</h3>
                  <p className="text-sm text-white/85 mb-3">Du 15 au 24 décembre, place de la Mairie</p>
                  <button className="bg-white/25 backdrop-blur text-sm px-4 py-2 rounded-xl font-medium">
                    En savoir plus
                  </button>
                </div>
                
                {/* Services rapides */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-3">Services rapides</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {config.services.slice(0, 4).map((service, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm"
                             style={{ backgroundColor: `${config.general.couleurPrimaire}15` }}>
                          <FileText className="w-6 h-6" style={{ color: config.general.couleurPrimaire }} />
                        </div>
                        <span className="text-[10px] text-slate-600 text-center font-medium">{service.titre}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Horaires */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: config.general.couleurPrimaire }} />
                    Horaires d'ouverture
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(config.horaires).slice(0, 3).map(([jour, h]) => (
                      <div key={jour} className="flex justify-between items-center">
                        <span className="text-slate-600 capitalize">{jour}</span>
                        <span className="font-semibold text-slate-800">
                          {h.ferme ? 'Fermé' : `${h.ouverture} - ${h.fermeture}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Contact */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: config.general.couleurPrimaire }} />
                    Nous trouver
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">{config.general.adresse}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" style={{ color: config.general.couleurPrimaire }} />
                    {config.general.telephone}
                  </div>
                </div>
              </div>
            )}
            
            {activeNav === 'actus' && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center"
                         style={{ backgroundColor: `${config.general.couleurPrimaire}15` }}>
                      <Newspaper className="w-8 h-8" style={{ color: config.general.couleurPrimaire }} />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium" style={{ color: config.general.couleurPrimaire }}>
                        {idx + 1} déc. 2025
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">Actualité de la commune</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeNav === 'services' && (
              <div className="p-4 space-y-3">
                {config.services.map((service, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                         style={{ backgroundColor: `${config.general.couleurPrimaire}15` }}>
                      <FileText className="w-6 h-6" style={{ color: config.general.couleurPrimaire }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{service.titre}</h4>
                      <p className="text-sm text-slate-500">{service.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="bg-white border-t border-slate-100 px-4 py-3 flex justify-around">
            {[
              { id: 'accueil', icon: Building2, label: 'Accueil' },
              { id: 'actus', icon: Newspaper, label: 'Actualités' },
              { id: 'services', icon: Globe, label: 'Services' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveNav(tab.id as typeof activeNav)}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
                  activeNav === tab.id ? '' : 'text-slate-400'
                }`}
                style={activeNav === tab.id ? { color: config.general.couleurPrimaire } : {}}
              >
                <tab.icon className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-slate-900/20 blur-xl rounded-full" />
    </div>
  );
};

export const SiteWebEditor = () => {
  const { setIsSidebarOpen } = useOutletContext<DashboardContextType>();
  const [deviceView, setDeviceView] = useState<DeviceView>('mobile');
  const [activeTab, setActiveTab] = useState<EditorTab>('general');
  const [expandedSection, setExpandedSection] = useState<string | null>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [config, setConfig] = useState<SiteConfig>({
    general: {
      nomMairie: 'Mairie de Belleville',
      slogan: 'Bienvenue sur votre commune',
      logoUrl: '',
      couleurPrimaire: '#3730a3',
      couleurSecondaire: '#6366f1',
      adresse: '1 Place de la République, 75001 Paris',
      telephone: '01 23 45 67 89',
      email: 'contact@mairie-belleville.fr',
    },
    horaires: {
      lundi: { ouverture: '08:30', fermeture: '17:30', ferme: false },
      mardi: { ouverture: '08:30', fermeture: '17:30', ferme: false },
      mercredi: { ouverture: '08:30', fermeture: '17:30', ferme: false },
      jeudi: { ouverture: '08:30', fermeture: '17:30', ferme: false },
      vendredi: { ouverture: '08:30', fermeture: '17:30', ferme: false },
      samedi: { ouverture: '09:00', fermeture: '12:00', ferme: false },
      dimanche: { ouverture: '', fermeture: '', ferme: true },
    },
    sections: [
      { id: '1', type: 'hero', titre: 'Bannière principale', visible: true, ordre: 1 },
      { id: '2', type: 'services', titre: 'Services', visible: true, ordre: 2 },
      { id: '3', type: 'actualites', titre: 'Actualités', visible: true, ordre: 3 },
      { id: '4', type: 'evenements', titre: 'Événements', visible: true, ordre: 4 },
      { id: '5', type: 'contact', titre: 'Contact', visible: true, ordre: 5 },
    ],
    services: [
      { id: '1', titre: 'État civil', description: 'Actes, cartes d\'identité...', icone: 'file-text' },
      { id: '2', titre: 'Urbanisme', description: 'Permis de construire, PLU...', icone: 'building' },
      { id: '3', titre: 'Vie scolaire', description: 'Inscriptions, cantine...', icone: 'users' },
      { id: '4', titre: 'Événements', description: 'Agenda communal', icone: 'calendar' },
    ],
  });

  const updateConfig = (path: string, value: unknown) => {
    setHasChanges(true);
    const keys = path.split('.');
    setConfig(prev => {
      const newConfig = { ...prev };
      let current: unknown = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (typeof current === 'object' && current !== null) {
          current = (current as Record<string, unknown>)[keys[i]];
        }
      }
      if (typeof current === 'object' && current !== null) {
        (current as Record<string, unknown>)[keys[keys.length - 1]] = value;
      }
      return newConfig;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'couleurs', label: 'Couleurs', icon: Palette },
    { id: 'sections', label: 'Sections', icon: Layout },
    { id: 'contenu', label: 'Contenu', icon: Type },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-indigo-600" />
                  Éditeur de Site Web
                </h1>
                <p className="text-sm text-slate-500">Personnalisez le site de votre mairie</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Indicateur de changements */}
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Modifications non sauvegardées
                </div>
              )}
              
              {/* Device Switcher */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                {[
                  { id: 'desktop', icon: Monitor },
                  { id: 'tablet', icon: Tablet },
                  { id: 'mobile', icon: Smartphone },
                ].map((device) => (
                  <button
                    key={device.id}
                    onClick={() => setDeviceView(device.id as DeviceView)}
                    className={`p-2 rounded-lg transition-colors ${
                      deviceView === device.id 
                        ? 'bg-white shadow text-indigo-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <device.icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
              
              {/* Actions */}
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                <Undo className="h-5 w-5" />
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                <Redo className="h-5 w-5" />
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                <Eye className="h-5 w-5" />
                <span className="hidden sm:inline">Prévisualiser</span>
              </button>
              
              <button 
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl transition-colors shadow-lg shadow-indigo-200"
              >
                {isSaving ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as EditorTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'general' && (
              <>
                {/* Informations générales */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nom de la mairie
                    </label>
                    <input
                      type="text"
                      value={config.general.nomMairie}
                      onChange={(e) => updateConfig('general.nomMairie', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Slogan
                    </label>
                    <input
                      type="text"
                      value={config.general.slogan}
                      onChange={(e) => updateConfig('general.slogan', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Adresse
                    </label>
                    <textarea
                      value={config.general.adresse}
                      onChange={(e) => updateConfig('general.adresse', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={config.general.telephone}
                        onChange={(e) => updateConfig('general.telephone', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={config.general.email}
                        onChange={(e) => updateConfig('general.email', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Horaires */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'horaires' ? null : 'horaires')}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium text-slate-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      Horaires d'ouverture
                    </span>
                    <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${expandedSection === 'horaires' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedSection === 'horaires' && (
                    <div className="mt-3 space-y-3">
                      {Object.entries(config.horaires).map(([jour, horaire]) => (
                        <div key={jour} className="flex items-center gap-3">
                          <span className="w-20 text-sm text-slate-600 capitalize">{jour}</span>
                          <input
                            type="time"
                            value={horaire.ouverture}
                            disabled={horaire.ferme}
                            onChange={(e) => updateConfig(`horaires.${jour}.ouverture`, e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="time"
                            value={horaire.fermeture}
                            disabled={horaire.ferme}
                            onChange={(e) => updateConfig(`horaires.${jour}.fermeture`, e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <button
                            onClick={() => updateConfig(`horaires.${jour}.ferme`, !horaire.ferme)}
                            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                              horaire.ferme 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {horaire.ferme ? 'Fermé' : 'Ouvert'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'couleurs' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Palettes prédéfinies</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {COLOR_PALETTES.map((palette) => (
                      <button
                        key={palette.name}
                        onClick={() => {
                          updateConfig('general.couleurPrimaire', palette.primary);
                          updateConfig('general.couleurSecondaire', palette.secondary);
                        }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          config.general.couleurPrimaire === palette.primary
                            ? 'border-indigo-500 shadow-lg'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: palette.primary }} />
                          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: palette.secondary }} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{palette.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-medium text-slate-900 mb-4">Couleurs personnalisées</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Couleur primaire
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={config.general.couleurPrimaire}
                          onChange={(e) => updateConfig('general.couleurPrimaire', e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.general.couleurPrimaire}
                          onChange={(e) => updateConfig('general.couleurPrimaire', e.target.value)}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Couleur secondaire
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={config.general.couleurSecondaire}
                          onChange={(e) => updateConfig('general.couleurSecondaire', e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.general.couleurSecondaire}
                          onChange={(e) => updateConfig('general.couleurSecondaire', e.target.value)}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 mb-4">
                  Glissez pour réorganiser, activez/désactivez les sections
                </p>
                {config.sections.map((section) => (
                  <div 
                    key={section.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
                    <Layers className="h-5 w-5 text-indigo-600" />
                    <span className="flex-1 font-medium text-slate-900">{section.titre}</span>
                    <button
                      onClick={() => {
                        const newSections = config.sections.map(s => 
                          s.id === section.id ? { ...s, visible: !s.visible } : s
                        );
                        setConfig(prev => ({ ...prev, sections: newSections }));
                        setHasChanges(true);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        section.visible 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {section.visible ? <Eye className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'contenu' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900">Services</h3>
                  <button className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </button>
                </div>
                
                {config.services.map((service, idx) => (
                  <div key={service.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <input
                      type="text"
                      value={service.titre}
                      onChange={(e) => {
                        const newServices = [...config.services];
                        newServices[idx] = { ...service, titre: e.target.value };
                        setConfig(prev => ({ ...prev, services: newServices }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                      placeholder="Titre du service"
                    />
                    <textarea
                      value={service.description}
                      onChange={(e) => {
                        const newServices = [...config.services];
                        newServices[idx] = { ...service, description: e.target.value };
                        setConfig(prev => ({ ...prev, services: newServices }));
                        setHasChanges(true);
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
                      placeholder="Description"
                    />
                    <button className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center overflow-auto p-8">
          <div className={`transition-all duration-300 ${
            deviceView === 'desktop' ? 'scale-75' : 
            deviceView === 'tablet' ? 'scale-90' : 
            'scale-100'
          }`}>
            <MobilePreviewFrame config={config} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteWebEditor;
