// cms_components/Evenement.tsx - Gestion des événements responsive avec animations
import { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  X,
  MapPin,
  Search,
  CalendarDays,
  List,
  Menu,
  Loader2,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useEvents, type CMSEvent } from '../hooks/useCMSData';
import { useTenant } from '../contexts/TenantContext';

interface DashboardContextType {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

// Types - Utilisation des types du hook
type Event = CMSEvent;

interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

const categories = [
  { value: 'reunion', label: 'Réunion', color: 'bg-blue-500' },
  { value: 'ceremonie', label: 'Cérémonie', color: 'bg-purple-500' },
  { value: 'conseil', label: 'Conseil Municipal', color: 'bg-emerald-500' },
  { value: 'visite', label: 'Visite', color: 'bg-amber-500' },
  { value: 'autre', label: 'Autre', color: 'bg-slate-500' },
];

const priorities = [
  { value: 'low', label: 'Faible', color: 'text-slate-500 bg-slate-100' },
  { value: 'medium', label: 'Moyenne', color: 'text-amber-600 bg-amber-100' },
  { value: 'high', label: 'Haute', color: 'text-rose-600 bg-rose-100' },
];

const defaultFormData: EventFormData = {
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  category: 'reunion',
  priority: 'medium',
};

// Event Card Component
const EventCard = ({ 
  event, 
  onEdit, 
  onDelete 
}: { 
  event: Event; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  const category = categories.find(c => c.value === event.category);
  const priority = priorities.find(p => p.value === event.priority);
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group animate-fadeIn">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Date Badge */}
        <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 ${category?.color || 'bg-blue-500'} rounded-xl flex flex-col items-center justify-center text-white`}>
          <span className="text-[10px] font-medium opacity-80">
            {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
          </span>
          <span className="text-lg sm:text-xl font-bold leading-none">
            {new Date(event.date).getDate()}
          </span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{event.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.startTime} - {event.endTime}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{event.location}</span>
                </span>
              </div>
            </div>
            
            {/* Priority Badge */}
            <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${priority?.color}`}>
              {priority?.label}
            </span>
          </div>
          
          {event.description && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{event.description}</p>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit className="w-3 h-3" />
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Event Form Modal
const EventModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isEditing 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: EventFormData) => void;
  initialData?: EventFormData;
  isEditing: boolean;
}) => {
  const [formData, setFormData] = useState<EventFormData>(initialData || defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(initialData || defaultFormData);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(formData);
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-modalIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-slate-800">
            {isEditing ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Titre</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Titre de l'événement"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
              placeholder="Description de l'événement"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Lieu</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="Lieu"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Début</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fin</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Priorité</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as EventFormData['priority'] })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
              >
                {priorities.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {isEditing ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Calendar View
const CalendarView = ({ 
  events, 
  currentDate, 
  onDateClick, 
  onEventClick 
}: { 
  events: Event[]; 
  currentDate: Date; 
  onDateClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
}) => {
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    const startPadding = (firstDay.getDay() + 6) % 7;
    
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    
    return days;
  };

  const days = getMonthDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
      {/* Week Headers */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="py-3 text-center text-xs sm:text-sm font-semibold text-slate-500">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      
      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) {
            return <div key={i} className="h-20 sm:h-28 bg-slate-50/50 border-b border-r border-slate-100" />;
          }
          
          const dateEvents = getEventsForDate(date);
          const isToday = date.getTime() === today.getTime();
          
          return (
            <div
              key={i}
              onClick={() => onDateClick(date)}
              className={`h-20 sm:h-28 p-1 sm:p-2 border-b border-r border-slate-100 cursor-pointer hover:bg-blue-50/50 transition-colors ${
                isToday ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium mb-1 ${
                isToday ? 'bg-blue-500 text-white' : 'text-slate-700'
              }`}>
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dateEvents.slice(0, 2).map((event) => {
                  const cat = categories.find(c => c.value === event.category);
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`${cat?.color} text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80`}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dateEvents.length > 2 && (
                  <div className="text-[10px] text-slate-500 px-1">
                    +{dateEvents.length - 2} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Component
const MayorSchedule = () => {
  const { setIsSidebarOpen } = useOutletContext<DashboardContextType>();
  const { tenantSlug } = useTenant();
  const { 
    events, 
    loading, 
    error: apiError,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent
  } = useEvents();
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filtrer les événements
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchTerm, filterCategory]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleCreateEvent = async (data: EventFormData) => {
    try {
      await createEvent({
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        category: data.category,
        priority: data.priority,
      });
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de l\'événement');
    }
  };

  const handleUpdateEvent = async (data: EventFormData) => {
    if (!editingEvent) return;
    
    try {
      await updateEvent(editingEvent.slug, {
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        category: data.category,
        priority: data.priority,
      });
      setEditingEvent(null);
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de l\'événement');
    }
  };

  const handleDeleteEvent = async (slug: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    
    try {
      await deleteEvent(slug);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'événement');
    }
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

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
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Emploi du Temps
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Gérez vos événements et rendez-vous</p>
              </div>
            </div>
            
            <button
              onClick={() => { setEditingEvent(null); setShowModal(true); }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvel événement</span>
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="px-4 sm:px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border border-slate-200"
            >
              Aujourd'hui
            </button>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="text-sm sm:text-base font-semibold text-slate-800 min-w-[140px] text-center capitalize">
                {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full sm:w-48 pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            >
              <option value="all">Toutes</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-4 text-slate-500">Chargement des événements...</p>
          </div>
        ) : apiError ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-100">
            <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Erreur de chargement</h3>
            <p className="text-slate-500 mb-6">{apiError}</p>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Réessayer
            </button>
          </div>
        ) : viewMode === 'calendar' ? (
          <CalendarView
            events={filteredEvents}
            currentDate={currentDate}
            onDateClick={(date) => {
              setCurrentDate(date);
              setEditingEvent(null);
              setShowModal(true);
            }}
            onEventClick={openEditModal}
          />
        ) : (
          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard
                  key={event.slug || event.id}
                  event={event}
                  onEdit={() => openEditModal(event)}
                  onDelete={() => handleDeleteEvent(event.slug)}
                />
              ))
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-100">
                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucun événement</h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm || filterCategory !== 'all' 
                    ? 'Aucun événement ne correspond à votre recherche'
                    : 'Commencez par créer votre premier événement'
                  }
                </p>
                <button
                  onClick={() => { setEditingEvent(null); setShowModal(true); }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Créer un événement
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      <EventModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingEvent(null); }}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        initialData={editingEvent ? {
          title: editingEvent.title,
          description: editingEvent.description,
          date: editingEvent.date,
          startTime: editingEvent.startTime,
          endTime: editingEvent.endTime,
          location: editingEvent.location,
          category: editingEvent.category,
          priority: editingEvent.priority,
        } : undefined}
        isEditing={!!editingEvent}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-modalIn {
          animation: modalIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MayorSchedule;
