// cms_components/DashboardContent.tsx
import { useState } from 'react';
import { 
  Bell, Menu, TrendingUp, TrendingDown, Users, Eye, MessageSquare,
  FileText, Calendar, ArrowUpRight, ArrowRight, Smartphone, Globe,
  ChevronRight, BarChart3, PieChart, Activity, Clock, MapPin, Phone,
  Mail, Building2, Newspaper, AlertCircle, CheckCircle2, Star
} from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';

interface DashboardContextType {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const BarChart = ({ data, maxValue }: { data: { label: string; value: number; color: string }[]; maxValue: number }) => (
  <div className="flex items-end justify-between h-40 gap-2">
    {data.map((item, idx) => (
      <div key={idx} className="flex flex-col items-center flex-1">
        <div className="relative w-full flex justify-center">
          <div className={`w-8 rounded-t-lg ${item.color} transition-all duration-500 hover:opacity-80`}
               style={{ height: `${(item.value / maxValue) * 140}px` }} />
        </div>
        <span className="text-xs text-slate-500 mt-2 font-medium">{item.label}</span>
      </div>
    ))}
  </div>
);

const LineChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const points = data.map((val, idx) => ({ x: (idx / (data.length - 1)) * 100, y: 100 - (val / max) * 100 }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L 100 100 L 0 100 Z`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#lineGradient)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill="#6366f1" />)}
    </svg>
  );
};

const DonutChart = ({ data }: { data: { value: number; color: string; label: string }[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;
  const segments = data.map(item => {
    const percent = (item.value / total) * 100;
    const startAngle = (cumulativePercent / 100) * 360;
    const endAngle = ((cumulativePercent + percent) / 100) * 360;
    cumulativePercent += percent;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = 50 + 40 * Math.cos(startRad), y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad), y2 = 50 + 40 * Math.sin(endRad);
    return { ...item, percent, d: `M 50 50 L ${x1} ${y1} A 40 40 0 ${percent > 50 ? 1 : 0} 1 ${x2} ${y2} Z` };
  });
  
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-28 h-28">
        {segments.map((seg, i) => <path key={i} d={seg.d} fill={seg.color} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
      <div className="space-y-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-slate-600">{seg.label}</span>
            <span className="font-semibold text-slate-800">{seg.percent.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobilePreview = () => {
  const [activeTab, setActiveTab] = useState<'accueil' | 'actualites' | 'services'>('accueil');
  
  return (
    <div className="relative mx-auto" style={{ width: '280px' }}>
      <div className="relative bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
        <div className="bg-white rounded-[2rem] overflow-hidden h-[520px]">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 flex justify-between items-center text-white text-xs">
            <span>9:41</span>
            <div className="flex items-center gap-1"><Activity className="w-3 h-3" /><span>5G</span></div>
          </div>
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-sm">Mairie de Belleville</h1>
                  <p className="text-white/70 text-[10px]">Bienvenue sur votre commune</p>
                </div>
              </div>
              <Menu className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white/20 rounded-full px-3 py-1.5 flex items-center gap-2">
              <Eye className="w-3 h-3 text-white/70" />
              <span className="text-white/70 text-xs">Rechercher...</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 bg-slate-50" style={{ height: '340px' }}>
            {activeTab === 'accueil' && (
              <>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 mb-3 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-medium">À la une</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">Marché de Noël 2025</h3>
                  <p className="text-[10px] text-white/80 mb-2">Du 15 au 24 décembre</p>
                  <button className="bg-white/20 text-[10px] px-2 py-1 rounded-full">En savoir plus</button>
                </div>
                <h4 className="font-semibold text-slate-800 text-xs mb-2">Services rapides</h4>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[{ icon: FileText, label: 'Docs', color: 'bg-blue-100 text-blue-600' },
                    { icon: Calendar, label: 'RDV', color: 'bg-green-100 text-green-600' },
                    { icon: MapPin, label: 'Plan', color: 'bg-orange-100 text-orange-600' },
                    { icon: Phone, label: 'Contact', color: 'bg-purple-100 text-purple-600' }
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-1`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] text-slate-600">{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
                  <h4 className="font-semibold text-slate-800 text-xs mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500" />Horaires
                  </h4>
                  <div className="text-[10px] text-slate-600 space-y-1">
                    <div className="flex justify-between"><span>Lun - Ven</span><span className="font-medium text-slate-800">8h30 - 17h30</span></div>
                    <div className="flex justify-between"><span>Samedi</span><span className="font-medium text-slate-800">9h - 12h</span></div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800 text-xs">Info trafic</h4>
                      <p className="text-[10px] text-amber-700">Travaux rue de la Liberté</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'actualites' && (
              <div className="space-y-3">
                {[{ title: 'Conseil Municipal', date: '2 déc.' }, { title: 'Collecte sapins', date: '1 déc.' }].map((a, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 shadow-sm flex gap-3">
                    <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] text-indigo-600 font-medium">{a.date}</span>
                      <h4 className="font-semibold text-slate-800 text-xs">{a.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'services' && (
              <div className="space-y-2">
                {[{ icon: FileText, title: 'État civil', color: 'text-blue-600 bg-blue-100' },
                  { icon: Building2, title: 'Urbanisme', color: 'text-green-600 bg-green-100' },
                  { icon: Users, title: 'Vie scolaire', color: 'text-purple-600 bg-purple-100' }
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1"><h4 className="font-semibold text-slate-800 text-xs">{s.title}</h4></div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white border-t border-slate-100 px-4 py-2 flex justify-around">
            {[{ id: 'accueil', icon: Building2, label: 'Accueil' },
              { id: 'actualites', icon: Newspaper, label: 'Actus' },
              { id: 'services', icon: Globe, label: 'Services' }
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`flex flex-col items-center p-1 ${activeTab === t.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                <t.icon className="w-5 h-5" />
                <span className="text-[9px] mt-0.5">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-slate-900/20 blur-xl rounded-full" />
    </div>
  );
};

export const DashboardContent = () => {
  const { setIsSidebarOpen } = useOutletContext<DashboardContextType>();
  const navigate = useNavigate();
  
  const weeklyVisitors = [
    { label: 'Lun', value: 120, color: 'bg-indigo-400' },
    { label: 'Mar', value: 180, color: 'bg-indigo-500' },
    { label: 'Mer', value: 150, color: 'bg-indigo-400' },
    { label: 'Jeu', value: 220, color: 'bg-indigo-600' },
    { label: 'Ven', value: 280, color: 'bg-indigo-700' },
    { label: 'Sam', value: 190, color: 'bg-indigo-500' },
    { label: 'Dim', value: 95, color: 'bg-indigo-300' },
  ];
  
  const monthlyTrend = [45, 52, 48, 61, 58, 72, 65, 78, 82, 91, 85, 98];
  const contentDistribution = [
    { value: 45, color: '#6366f1', label: 'Publications' },
    { value: 25, color: '#22c55e', label: 'Événements' },
    { value: 20, color: '#f59e0b', label: 'Documents' },
    { value: 10, color: '#ec4899', label: 'Médias' },
  ];

  const stats = [
    { label: 'Visiteurs ce mois', value: '3,842', change: '+12.5%', trend: 'up', icon: Users, color: 'bg-indigo-500' },
    { label: 'Pages vues', value: '12,584', change: '+8.2%', trend: 'up', icon: Eye, color: 'bg-emerald-500' },
    { label: 'Messages reçus', value: '47', change: '+23.1%', trend: 'up', icon: MessageSquare, color: 'bg-amber-500' },
    { label: 'Publications', value: '28', change: '-2.4%', trend: 'down', icon: FileText, color: 'bg-rose-500' },
  ];

  const quickActions = [
    { id: 1, icon: FileText, title: 'Nouvelle publication', description: 'Créer un article', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', iconBg: 'bg-indigo-100', path: '/cms/mayor-dashboard/publications' },
    { id: 2, icon: Calendar, title: 'Ajouter événement', description: 'Planifier un RDV', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconBg: 'bg-emerald-100', path: '/cms/mayor-dashboard/evenements' },
    { id: 3, icon: BarChart3, title: 'Statistiques', description: 'Voir performances', color: 'bg-violet-50 text-violet-700 border-violet-200', iconBg: 'bg-violet-100', path: '/cms/mayor-dashboard' },
    { id: 4, icon: Mail, title: 'Messages', description: 'Gérer demandes', color: 'bg-amber-50 text-amber-700 border-amber-200', iconBg: 'bg-amber-100', path: '/cms/mayor-dashboard/messages' },
  ];

  const recentActivities = [
    { id: 1, title: 'Nouvel article publié', description: 'Marché de Noël 2025', time: 'Il y a 2h', icon: FileText, iconColor: 'text-indigo-600 bg-indigo-100' },
    { id: 2, title: 'Nouveau message', description: 'Demande de M. Dupont', time: 'Il y a 5h', icon: MessageSquare, iconColor: 'text-emerald-600 bg-emerald-100' },
    { id: 3, title: 'Événement confirmé', description: 'Conseil municipal', time: 'Il y a 1j', icon: CheckCircle2, iconColor: 'text-amber-600 bg-amber-100' },
  ];

  const upcomingEvents = [
    { title: 'Conseil Municipal', date: '6 déc.', time: '18:00', type: 'Réunion' },
    { title: 'Inauguration Médiathèque', date: '8 déc.', time: '10:30', type: 'Cérémonie' },
    { title: 'Voeux associations', date: '12 déc.', time: '19:00', type: 'Événement' },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden mr-4 p-2 rounded-xl text-slate-500 hover:bg-slate-100">
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
                <p className="text-sm text-slate-500">Bienvenue, Monsieur le Maire</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700">Jean Dupont</p>
                  <p className="text-xs text-slate-500">Maire de Belleville</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">JD</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.color}`}><stat.icon className="h-5 w-5 text-white" /></div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Visiteurs cette semaine</h3>
                    <p className="text-sm text-slate-500">Trafic quotidien</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-600">1,235 total</span>
                  </div>
                </div>
                <BarChart data={weeklyVisitors} maxValue={300} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div><h3 className="text-base font-semibold text-slate-900">Tendance annuelle</h3><p className="text-sm text-slate-500">Évolution</p></div>
                    <Activity className="h-5 w-5 text-indigo-500" />
                  </div>
                  <LineChart data={monthlyTrend} />
                  <div className="flex items-center justify-center mt-2 text-sm text-emerald-600 font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />+117% sur l'année
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div><h3 className="text-base font-semibold text-slate-900">Types de contenu</h3><p className="text-sm text-slate-500">Répartition</p></div>
                    <PieChart className="h-5 w-5 text-indigo-500" />
                  </div>
                  <DonutChart data={contentDistribution} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="text-lg font-semibold text-white">Aperçu du site</h3><p className="text-sm text-slate-400">Version mobile</p></div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-indigo-400" />
                  <button onClick={() => navigate('/cms/mayor-dashboard/site-web')} className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Globe className="h-3 w-3" />Personnaliser
                  </button>
                </div>
              </div>
              <MobilePreview />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button key={action.id} onClick={() => navigate(action.path)}
                    className={`${action.color} border rounded-2xl p-5 text-left hover:shadow-lg transition-all group`}>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${action.iconBg}`}><action.icon className="h-6 w-6" /></div>
                      <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-semibold mt-3">{action.title}</h3>
                    <p className="text-sm opacity-80 mt-1">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Prochains événements</h2>
                <button onClick={() => navigate('/cms/mayor-dashboard/evenements')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Voir tout<ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex flex-col items-center justify-center">
                        <span className="text-xs text-indigo-600 font-medium">{event.date.split(' ')[1]}</span>
                        <span className="text-lg font-bold text-indigo-700">{event.date.split(' ')[0]}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{event.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-3.5 w-3.5" />{event.time}
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">{event.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Activité récente</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">Voir tout<ArrowRight className="h-4 w-4" /></button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-xl ${activity.iconColor} flex items-center justify-center`}>
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-slate-900">{activity.title}</h3>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{activity.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};