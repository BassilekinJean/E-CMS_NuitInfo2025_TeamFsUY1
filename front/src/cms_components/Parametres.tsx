// ComponentsCms/Parametres.tsx
import { useState, useEffect } from 'react';
import { 
  Settings,
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Save,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { authService } from '../api/services';

export const Parametres = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, isAuthenticated } = useAuth();
  const { tenant, tenantSlug } = useTenant();
  
  // États du formulaire
  const [profileForm, setProfileForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    fonction: '',
    biographie: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [siteForm, setSiteForm] = useState({
    nomCommune: '',
    slogan: '',
    description: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      const nameParts = user.nom?.split(' ') || [''];
      setProfileForm({
        prenom: nameParts[0] || '',
        nom: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        fonction: user.role_display || user.role || '',
        biographie: '',
      });
    }
  }, [user]);
  
  // Charger les données du tenant
  useEffect(() => {
    if (tenant) {
      setSiteForm({
        nomCommune: tenant.nom || '',
        slogan: tenant.mot_du_maire?.substring(0, 100) || 'Une commune au service de ses citoyens',
        description: tenant.description || '',
      });
    }
  }, [tenant]);
  
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await authService.updateProfile({
        nom: `${profileForm.prenom} ${profileForm.nom}`.trim(),
        email: profileForm.email,
      });
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
    } finally {
      setSaving(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    
    setSaving(true);
    setMessage(null);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'site', label: 'Site web', icon: Globe },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-sm px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-sm">
            <Settings className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Paramètres</h1>
            <p className="text-sm text-slate-500">Gérez vos préférences et configurations</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* Tabs Sidebar */}
        <div className="w-72 bg-white/70 backdrop-blur-sm border-r border-slate-200/50 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu</p>
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-800 mb-8">Informations du profil</h2>
              
              {/* Message de feedback */}
              {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  {message.text}
                </div>
              )}
              
              {/* Avatar */}
              <div className="mb-10 p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {user?.photo ? (
                      <img
                        src={user.photo}
                        alt="Profile"
                        className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-4 ring-white shadow-lg">
                        <span className="text-3xl font-bold text-white">
                          {profileForm.prenom?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Photo de profil</h3>
                    <p className="text-sm text-slate-500 mt-1">JPG, PNG ou GIF. Max 2Mo</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={profileForm.prenom}
                      onChange={(e) => setProfileForm({ ...profileForm, prenom: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={profileForm.nom}
                      onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Fonction</label>
                  <input
                    type="text"
                    value={profileForm.fonction}
                    onChange={(e) => setProfileForm({ ...profileForm, fonction: e.target.value })}
                    disabled
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Biographie</label>
                  <textarea
                    rows={4}
                    value={profileForm.biographie}
                    onChange={(e) => setProfileForm({ ...profileForm, biographie: e.target.value })}
                    placeholder="Décrivez-vous..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-800 mb-8">Préférences de notification</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div>
                    <h3 className="font-semibold text-slate-800">Nouveaux messages</h3>
                    <p className="text-sm text-slate-500 mt-1">Recevoir une notification pour chaque nouveau message</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div>
                    <h3 className="font-semibold text-slate-800">Événements à venir</h3>
                    <p className="text-sm text-slate-500 mt-1">Rappels pour les événements programmés</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div>
                    <h3 className="font-semibold text-slate-800">Rapports hebdomadaires</h3>
                    <p className="text-sm text-slate-500 mt-1">Résumé des statistiques chaque semaine</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
                  </label>
                </div>

                <div className="pt-6">
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02]">
                    <Save className="h-5 w-5" />
                    Enregistrer les préférences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-800 mb-8">Sécurité du compte</h2>
              
              {/* Message de feedback */}
              {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  {message.text}
                </div>
              )}
              
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-slate-500" />
                    Changer le mot de passe
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe actuel</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleChangePassword}
                    disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-800 mb-8">Personnalisation de l'apparence</h2>
              
              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-5">Thème</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="p-5 border-2 border-blue-400 rounded-2xl bg-white text-center shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02]">
                      <div className="h-10 w-10 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl mx-auto mb-3 shadow-inner"></div>
                      <span className="text-sm font-semibold text-slate-800">Clair</span>
                    </button>
                    <button className="p-5 border border-slate-200 rounded-2xl bg-white text-center hover:border-slate-300 hover:shadow-md transition-all hover:scale-[1.02]">
                      <div className="h-10 w-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl mx-auto mb-3 shadow-lg"></div>
                      <span className="text-sm font-semibold text-slate-800">Sombre</span>
                    </button>
                    <button className="p-5 border border-slate-200 rounded-2xl bg-white text-center hover:border-slate-300 hover:shadow-md transition-all hover:scale-[1.02]">
                      <div className="h-10 w-10 bg-gradient-to-r from-slate-100 to-slate-800 rounded-xl mx-auto mb-3 shadow-lg"></div>
                      <span className="text-sm font-semibold text-slate-800">Système</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-5">Couleur principale</h3>
                  <div className="flex gap-4">
                    <button className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl ring-4 ring-blue-200 shadow-lg shadow-blue-500/30 hover:scale-110 transition-all"></button>
                    <button className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl hover:ring-4 hover:ring-emerald-200 shadow-lg shadow-emerald-500/30 hover:scale-110 transition-all"></button>
                    <button className="h-12 w-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl hover:ring-4 hover:ring-purple-200 shadow-lg shadow-purple-500/30 hover:scale-110 transition-all"></button>
                    <button className="h-12 w-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl hover:ring-4 hover:ring-rose-200 shadow-lg shadow-rose-500/30 hover:scale-110 transition-all"></button>
                    <button className="h-12 w-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl hover:ring-4 hover:ring-amber-200 shadow-lg shadow-orange-500/30 hover:scale-110 transition-all"></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'site' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-800 mb-8">Configuration du site web</h2>
              
              <div className="space-y-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm p-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de la commune</label>
                  <input
                    type="text"
                    defaultValue="Commune de Example"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Slogan</label>
                  <input
                    type="text"
                    defaultValue="Une commune au service de ses citoyens"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    defaultValue="Bienvenue sur le site officiel de notre commune..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50"
                  />
                </div>

                <div className="pt-4">
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02]">
                    <Save className="h-5 w-5" />
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Parametres;
