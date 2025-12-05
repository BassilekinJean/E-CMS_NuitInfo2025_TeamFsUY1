// cms_components/Evenement.tsx - Gestion de l'emploi du temps du Maire
import { useState, useMemo, useCallback } from 'react';
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
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  RefreshCw,
  CalendarDays,
  CalendarRange,
  List,
  Eye
} from 'lucide-react';
import type { MayorEvent, EventFormData, EventCategory, EventPriority } from './types/events';
import { 
  EVENT_CATEGORIES, 
  EVENT_COLORS, 
  EVENT_PRIORITIES,
  DEFAULT_EVENT_FORM,
  getColorClasses,
  getCategoryInfo
} from './types/events';
import { useEvents } from './hooks/useEvents';

type ViewMode = 'week' | 'month' | 'day' | 'list';

const MayorSchedule = () => {
  // État
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MayorEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<EventPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Hook pour les événements
  const { 
    events, 
    loading, 
    createEvent, 
    updateEvent, 
    deleteEvent,
    updateEventStatus,
    refreshEvents
  } = useEvents();

  // Calculs de dates
  const getWeekDays = useCallback((date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Lundi
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  }, []);

  const getMonthDays = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    // Jours du mois précédent pour remplir la première semaine
    const startPadding = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, []);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate, getWeekDays]);
  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate, getMonthDays]);

  // Filtrage des événements
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || event.priority === filterPriority;
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [events, searchTerm, filterCategory, filterPriority]);

  // Événements par date
  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(e => e.date === dateStr).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
  }, [filteredEvents]);

  // Navigation
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Position des événements dans la grille horaire
  const getEventPosition = useCallback((startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startInMinutes = (startH - 7) * 60 + startM;
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    
    return {
      top: `${(startInMinutes / 60) * 60}px`,
      height: `${Math.max((duration / 60) * 60, 40)}px`
    };
  }, []);

  // Handlers
  const handleEventClick = useCallback((event: MayorEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  const handleDeleteEvent = useCallback(async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      await deleteEvent(id);
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  }, [deleteEvent]);

  const handleStatusChange = useCallback(async (id: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    await updateEventStatus(id, status);
  }, [updateEventStatus]);

  // Formatage
  const formatDateHeader = useCallback(() => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    if (viewMode === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('fr-FR', options)}`;
      }
      return `${start.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('fr-FR', options)}`;
    }
    return currentDate.toLocaleDateString('fr-FR', options);
  }, [currentDate, viewMode, weekDays]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // Créneaux horaires (7h - 20h)
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emploi du Temps</h1>
            <p className="text-sm text-gray-600">Gérez votre agenda et vos rendez-vous</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshEvents}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvel Événement</span>
            </button>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Navigation & Date */}
          <div className="flex items-center gap-4">
            <button 
              onClick={goToToday}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
            >
              Aujourd'hui
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <span className="text-lg font-semibold text-gray-900 min-w-[200px] text-center capitalize">
                {formatDateHeader()}
              </span>
              
              <button 
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                showFilters || filterCategory !== 'all' || filterPriority !== 'all'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filtres</span>
            </button>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                viewMode === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Jour
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                viewMode === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <CalendarRange className="h-4 w-4" />
              Semaine
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                viewMode === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Mois
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <List className="h-4 w-4" />
              Liste
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as EventCategory | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes</option>
                {EVENT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priorité</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as EventPriority | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes</option>
                {EVENT_PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            {(filterCategory !== 'all' || filterPriority !== 'all') && (
              <button
                onClick={() => { setFilterCategory('all'); setFilterPriority('all'); }}
                className="self-end px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {/* Calendar Views */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'week' && (
          <WeekView 
            weekDays={weekDays}
            timeSlots={timeSlots}
            getEventsForDate={getEventsForDate}
            getEventPosition={getEventPosition}
            onEventClick={handleEventClick}
            isToday={isToday}
          />
        )}

        {viewMode === 'month' && (
          <MonthView
            monthDays={monthDays}
            getEventsForDate={getEventsForDate}
            onEventClick={handleEventClick}
            isToday={isToday}
            onDayClick={(date) => { setCurrentDate(date); setViewMode('day'); }}
          />
        )}

        {viewMode === 'day' && (
          <DayView
            currentDate={currentDate}
            timeSlots={timeSlots}
            events={getEventsForDate(currentDate)}
            getEventPosition={getEventPosition}
            onEventClick={handleEventClick}
          />
        )}

        {viewMode === 'list' && (
          <ListView
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => { setShowEventModal(false); setSelectedEvent(null); }}
          onEdit={() => { setShowEventModal(false); setShowCreateModal(true); }}
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
          onStatusChange={(status) => handleStatusChange(selectedEvent.id, status)}
        />
      )}

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <EventFormModal
          event={selectedEvent}
          onClose={() => { setShowCreateModal(false); setSelectedEvent(null); }}
          onSave={async (data) => {
            if (selectedEvent) {
              await updateEvent(selectedEvent.id, data);
            } else {
              await createEvent(data);
            }
            setShowCreateModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

// ============ Sub-Components ============

// Week View Component
const WeekView = ({ 
  weekDays, 
  timeSlots, 
  getEventsForDate, 
  getEventPosition, 
  onEventClick,
  isToday 
}: {
  weekDays: Date[];
  timeSlots: number[];
  getEventsForDate: (date: Date) => MayorEvent[];
  getEventPosition: (start: string, end: string) => { top: string; height: string };
  onEventClick: (event: MayorEvent) => void;
  isToday: (date: Date) => boolean;
}) => {
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="min-w-[900px]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="grid grid-cols-8">
          <div className="border-r border-gray-200 bg-gray-50 w-16"></div>
          {weekDays.map((day, idx) => (
            <div 
              key={idx} 
              className={`border-r last:border-r-0 border-gray-200 p-3 text-center ${
                isToday(day) ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-500 uppercase">{dayNames[idx]}</div>
              <div className={`text-xl font-bold mt-1 ${
                isToday(day) ? 'text-blue-600 bg-blue-600 text-white w-8 h-8 rounded-full mx-auto flex items-center justify-center' : 'text-gray-900'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Grid */}
      <div className="relative">
        <div className="grid grid-cols-8">
          {/* Time Column */}
          <div className="border-r border-gray-200 bg-gray-50 w-16">
            {timeSlots.map((hour) => (
              <div 
                key={hour} 
                className="h-[60px] border-b border-gray-100 px-2 py-1 text-xs font-medium text-gray-500 text-right"
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, dayIdx) => {
            const dayEvents = getEventsForDate(day);
            return (
              <div 
                key={dayIdx} 
                className={`relative border-r last:border-r-0 border-gray-200 ${
                  isToday(day) ? 'bg-blue-50/30' : ''
                }`}
              >
                {timeSlots.map((hour) => (
                  <div 
                    key={hour} 
                    className="h-[60px] border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const pos = getEventPosition(event.startTime, event.endTime);
                  const colorClass = getColorClasses(event.color);
                  
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`absolute left-1 right-1 ${colorClass} rounded-lg p-2 cursor-pointer shadow-md border-l-4 overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]`}
                      style={{ top: pos.top, height: pos.height }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold opacity-90">
                          {event.startTime}
                        </span>
                        <StatusDot status={event.status} />
                      </div>
                      <h4 className="font-semibold text-xs line-clamp-2">{event.title}</h4>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event.location.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Month View Component
const MonthView = ({
  monthDays,
  getEventsForDate,
  onEventClick,
  isToday,
  onDayClick
}: {
  monthDays: (Date | null)[];
  getEventsForDate: (date: Date) => MayorEvent[];
  onEventClick: (event: MayorEvent) => void;
  isToday: (date: Date) => boolean;
  onDayClick: (date: Date) => void;
}) => {
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="p-4">
      {/* Day Names Header */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, idx) => {
          if (!day) {
            return <div key={idx} className="min-h-[100px] bg-gray-50 rounded-lg" />;
          }

          const dayEvents = getEventsForDate(day);
          const today = isToday(day);

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={`min-h-[100px] p-2 rounded-lg border transition-colors cursor-pointer ${
                today 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${today ? 'text-blue-600' : 'text-gray-700'}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    className={`text-xs px-1 py-0.5 rounded truncate ${getColorClasses(event.color)}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium">
                    +{dayEvents.length - 3} autres
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

// Day View Component
const DayView = ({
  currentDate,
  timeSlots,
  events,
  getEventPosition,
  onEventClick
}: {
  currentDate: Date;
  timeSlots: number[];
  events: MayorEvent[];
  getEventPosition: (start: string, end: string) => { top: string; height: string };
  onEventClick: (event: MayorEvent) => void;
}) => {
  return (
    <div className="flex">
      {/* Time Column */}
      <div className="w-20 border-r border-gray-200 bg-gray-50 flex-shrink-0">
        {timeSlots.map((hour) => (
          <div 
            key={hour} 
            className="h-[80px] border-b border-gray-100 px-3 py-2 text-sm font-medium text-gray-500 text-right"
          >
            {hour}:00
          </div>
        ))}
      </div>

      {/* Events Column */}
      <div className="flex-1 relative">
        {timeSlots.map((hour) => (
          <div 
            key={hour} 
            className="h-[80px] border-b border-gray-100 hover:bg-gray-50 transition-colors"
          />
        ))}

        {/* Events */}
        {events.map((event) => {
          const pos = getEventPosition(event.startTime, event.endTime);
          const colorClass = getColorClasses(event.color);
          const categoryInfo = getCategoryInfo(event.category);
          
          return (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`absolute left-4 right-4 ${colorClass} rounded-xl p-4 cursor-pointer shadow-lg border-l-4 transition-all hover:shadow-xl`}
              style={{ 
                top: `calc(${pos.top} * 1.33)`, 
                minHeight: '80px'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{categoryInfo.icon}</span>
                    <h4 className="font-bold text-lg">{event.title}</h4>
                    <StatusBadge status={event.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.startTime} - {event.endTime}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location.name}
                      </span>
                    )}
                  </div>
                </div>
                <PriorityBadge priority={event.priority} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// List View Component
const ListView = ({
  events,
  onEventClick,
  onDelete
}: {
  events: MayorEvent[];
  onEventClick: (event: MayorEvent) => void;
  onDelete: (id: string) => void;
}) => {
  // Grouper par date
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, MayorEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {sortedDates.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun événement</h3>
          <p className="text-gray-500">Créez votre premier événement pour commencer.</p>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 sticky top-0 bg-gray-50 py-2">
              {new Date(date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            <div className="space-y-3">
              {groupedEvents[date].map(event => {
                const categoryInfo = getCategoryInfo(event.category);
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {/* Time */}
                      <div className="text-center w-20 flex-shrink-0">
                        <div className="text-lg font-bold text-gray-900">{event.startTime}</div>
                        <div className="text-sm text-gray-500">{event.endTime}</div>
                      </div>

                      {/* Color Bar */}
                      <div className={`w-1 h-16 rounded-full ${getColorClasses(event.color).split(' ')[0]}`} />

                      {/* Content */}
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEventClick(event)}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{categoryInfo.icon}</span>
                          <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                          <StatusBadge status={event.status} />
                          <PriorityBadge priority={event.priority} />
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {event.location.name}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEventClick(event)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onDelete(event.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Event Details Modal
const EventDetailsModal = ({
  event,
  onClose,
  onEdit,
  onDelete,
  onStatusChange
}: {
  event: MayorEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: 'confirmed' | 'pending' | 'cancelled') => void;
}) => {
  const categoryInfo = getCategoryInfo(event.category);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 rounded-t-2xl ${getColorClasses(event.color)}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{categoryInfo.icon}</span>
                <span className="text-sm opacity-80">{categoryInfo.label}</span>
              </div>
              <h2 className="text-2xl font-bold">{event.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Status & Priority */}
          <div className="flex items-center gap-3">
            <StatusBadge status={event.status} />
            <PriorityBadge priority={event.priority} />
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-medium">
              {new Date(event.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-medium">{event.startTime} - {event.endTime}</span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3 text-gray-700">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium">{event.location.name}</div>
                {event.location.address && (
                  <div className="text-sm text-gray-500">{event.location.address}</div>
                )}
                {event.location.room && (
                  <div className="text-sm text-gray-500">Salle: {event.location.room}</div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="pt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
              <p className="text-gray-600 text-sm">{event.description}</p>
            </div>
          )}

          {/* Participants */}
          {event.participants.length > 0 && (
            <div className="pt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({event.participants.length})
              </h4>
              <div className="space-y-2">
                {event.participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      {p.role && <div className="text-xs text-gray-500">{p.role}</div>}
                    </div>
                    {p.confirmed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div className="pt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
              <p className="text-gray-600 text-sm bg-yellow-50 p-3 rounded-lg">{event.notes}</p>
            </div>
          )}

          {/* Status Change */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Changer le statut</h4>
            <div className="flex gap-2">
              <button
                onClick={() => onStatusChange('confirmed')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  event.status === 'confirmed' 
                    ? 'bg-green-100 text-green-700 border-2 border-green-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                }`}
              >
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Confirmé
              </button>
              <button
                onClick={() => onStatusChange('pending')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  event.status === 'pending' 
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-50'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-1" />
                En attente
              </button>
              <button
                onClick={() => onStatusChange('cancelled')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  event.status === 'cancelled' 
                    ? 'bg-red-100 text-red-700 border-2 border-red-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                }`}
              >
                <XCircle className="h-4 w-4 inline mr-1" />
                Annulé
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              onClick={onEdit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="h-5 w-5" />
              Modifier
            </button>
            <button 
              onClick={onDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Event Form Modal
const EventFormModal = ({
  event,
  onClose,
  onSave
}: {
  event: MayorEvent | null;
  onClose: () => void;
  onSave: (data: EventFormData) => void;
}) => {
  const [formData, setFormData] = useState<EventFormData>(() => {
    if (event) {
      return {
        title: event.title,
        description: event.description || '',
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        category: event.category,
        priority: event.priority,
        color: event.color,
        location: { 
          name: event.location?.name || '', 
          address: event.location?.address || '', 
          room: event.location?.room || '' 
        },
        participants: event.participants.map(p => ({ name: p.name, email: p.email || '', role: p.role || '' })),
        isAllDay: event.isAllDay,
        isRecurring: event.isRecurring,
        recurringPattern: event.recurringPattern,
        notes: event.notes || '',
        reminders: event.reminders || [15]
      };
    }
    return DEFAULT_EVENT_FORM;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {event ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de l'événement *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Conseil Municipal"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Début *</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin *</label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  {EVENT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as EventPriority })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  {EVENT_PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
              <div className="flex gap-2">
                {EVENT_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={`w-8 h-8 rounded-full ${c.bg} transition-transform ${
                      formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={formData.location.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, name: e.target.value } 
                  })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du lieu"
                />
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, address: e.target.value } 
                  })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresse"
                />
                <input
                  type="text"
                  value={formData.location.room}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, room: e.target.value } 
                  })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Salle"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Détails de l'événement..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none bg-yellow-50"
                placeholder="Notes personnelles..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              {event ? 'Enregistrer' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper Components
const StatusDot = ({ status }: { status: 'confirmed' | 'pending' | 'cancelled' }) => {
  const colors = {
    confirmed: 'bg-white',
    pending: 'bg-yellow-300',
    cancelled: 'bg-red-300'
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status]}`} />;
};

const StatusBadge = ({ status }: { status: 'confirmed' | 'pending' | 'cancelled' }) => {
  const styles = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  const labels = {
    confirmed: 'Confirmé',
    pending: 'En attente',
    cancelled: 'Annulé'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: EventPriority }) => {
  const styles = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };
  const labels = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgent'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority]}`}>
      {labels[priority]}
    </span>
  );
};

export default MayorSchedule;
