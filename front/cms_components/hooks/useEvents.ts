// cms_components/hooks/useEvents.ts
import { useState, useEffect, useCallback } from 'react';
import type { MayorEvent, EventFormData } from '../types/events';
import { eventService } from '../services/eventService';

interface UseEventsOptions {
  autoFetch?: boolean;
  startDate?: string;
  endDate?: string;
}

interface UseEventsReturn {
  events: MayorEvent[];
  loading: boolean;
  error: string | null;
  fetchEvents: (params?: { startDate?: string; endDate?: string }) => Promise<void>;
  createEvent: (data: EventFormData) => Promise<MayorEvent | null>;
  updateEvent: (id: string, data: Partial<EventFormData>) => Promise<MayorEvent | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  updateEventStatus: (id: string, status: 'confirmed' | 'pending' | 'cancelled') => Promise<boolean>;
  getEventById: (id: string) => MayorEvent | undefined;
  getEventsForDate: (date: string) => MayorEvent[];
  refreshEvents: () => Promise<void>;
}

export const useEvents = (options: UseEventsOptions = {}): UseEventsReturn => {
  const { autoFetch = true, startDate, endDate } = options;
  
  const [events, setEvents] = useState<MayorEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Données de démonstration pour le mode hors ligne ou test
  const getDemoEvents = useCallback((): MayorEvent[] => {
    const today = new Date();
    const getDateString = (daysOffset: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + daysOffset);
      return date.toISOString().split('T')[0];
    };

    return [
      {
        id: '1',
        title: 'Conseil Municipal',
        description: 'Réunion mensuelle du conseil municipal. Ordre du jour: budget 2026, projets urbains.',
        date: getDateString(0),
        startTime: '09:00',
        endTime: '12:00',
        category: 'conseil',
        status: 'confirmed',
        priority: 'high',
        color: 'blue',
        location: { name: 'Salle du Conseil', address: 'Mairie', room: 'Salle A' },
        participants: [
          { id: '1', name: 'M. le Maire', role: 'Président', confirmed: true },
          { id: '2', name: 'Mme Dupont', role: 'Adjointe', confirmed: true },
          { id: '3', name: 'M. Martin', role: 'Conseiller', confirmed: true }
        ],
        isAllDay: false,
        isRecurring: true,
        recurringPattern: 'monthly',
        notes: 'Prévoir les documents budgétaires',
        createdAt: new Date(),
        updatedAt: new Date(),
        reminders: [60, 1440]
      },
      {
        id: '2',
        title: 'Inauguration École Primaire',
        description: 'Inauguration de la nouvelle aile de l\'école primaire Jean Jaurès.',
        date: getDateString(1),
        startTime: '14:00',
        endTime: '16:00',
        category: 'inauguration',
        status: 'confirmed',
        priority: 'high',
        color: 'green',
        location: { name: 'École Jean Jaurès', address: '15 rue de la République', room: '' },
        participants: [
          { id: '1', name: 'M. le Maire', role: 'Officiant', confirmed: true },
          { id: '4', name: 'Mme Directrice', role: 'Hôte', confirmed: true }
        ],
        isAllDay: false,
        isRecurring: false,
        notes: 'Discours préparé, ciseaux pour ruban',
        createdAt: new Date(),
        updatedAt: new Date(),
        reminders: [60]
      },
      {
        id: '3',
        title: 'Réunion Service Urbanisme',
        description: 'Point sur les permis de construire en cours.',
        date: getDateString(0),
        startTime: '14:30',
        endTime: '15:30',
        category: 'reunion',
        status: 'pending',
        priority: 'medium',
        color: 'orange',
        location: { name: 'Bureau du Maire', address: 'Mairie', room: 'Bureau 101' },
        participants: [
          { id: '5', name: 'M. Architecte', role: 'Responsable Urbanisme', confirmed: false }
        ],
        isAllDay: false,
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        reminders: [15]
      },
      {
        id: '4',
        title: 'Cérémonie Vœux du Personnel',
        description: 'Cérémonie annuelle des vœux aux agents municipaux.',
        date: getDateString(2),
        startTime: '10:00',
        endTime: '12:00',
        category: 'ceremonie',
        status: 'confirmed',
        priority: 'medium',
        color: 'purple',
        location: { name: 'Salle des Fêtes', address: 'Place de la Mairie', room: '' },
        participants: [],
        isAllDay: false,
        isRecurring: false,
        notes: 'Prévoir buffet pour 150 personnes',
        createdAt: new Date(),
        updatedAt: new Date(),
        reminders: [60, 1440]
      },
      {
        id: '5',
        title: 'Rendez-vous Préfecture',
        description: 'Discussion sur les dotations de l\'État.',
        date: getDateString(3),
        startTime: '11:00',
        endTime: '12:30',
        category: 'rendez-vous',
        status: 'confirmed',
        priority: 'urgent',
        color: 'red',
        location: { name: 'Préfecture', address: 'Avenue de la Préfecture', room: 'Bureau du Préfet' },
        participants: [
          { id: '6', name: 'M. le Préfet', role: 'Préfet', confirmed: true }
        ],
        isAllDay: false,
        isRecurring: false,
        notes: 'Dossiers financiers à préparer',
        createdAt: new Date(),
        updatedAt: new Date(),
        reminders: [60, 1440]
      },
      {
        id: '6',
        title: 'Visite Chantier Médiathèque',
        description: 'Visite du chantier de la nouvelle médiathèque.',
        date: getDateString(4),
        startTime: '09:30',
        endTime: '11:00',
        category: 'visite',
        status: 'confirmed',
        priority: 'medium',
        color: 'cyan',
        location: { name: 'Chantier Médiathèque', address: 'Rue des Arts', room: '' },
        participants: [
          { id: '7', name: 'M. Chef de Chantier', role: 'Guide', confirmed: true }
        ],
        isAllDay: false,
        isRecurring: false,
        notes: 'Casque de chantier obligatoire',
        createdAt: new Date(),
        updatedAt: new Date(),
        reminders: [30]
      },
      {
        id: '7',
        title: 'Réception Associations',
        description: 'Réception annuelle des présidents d\'associations.',
        date: getDateString(5),
        startTime: '18:00',
        endTime: '21:00',
        category: 'reception',
        status: 'confirmed',
        priority: 'medium',
        color: 'pink',
        location: { name: 'Salon d\'Honneur', address: 'Mairie', room: '' },
        participants: [],
        isAllDay: false,
        isRecurring: false,
        notes: 'Discours de remerciement prévu',
        createdAt: new Date(),
        updatedAt: new Date(),
        reminders: [60]
      },
      {
        id: '8',
        title: 'Commission Finances',
        description: 'Préparation du budget prévisionnel 2026.',
        date: getDateString(1),
        startTime: '09:00',
        endTime: '11:00',
        category: 'reunion',
        status: 'confirmed',
        priority: 'high',
        color: 'indigo',
        location: { name: 'Salle de Réunion B', address: 'Mairie', room: 'Salle B' },
        participants: [
          { id: '8', name: 'Mme Trésorière', role: 'Directrice Finances', confirmed: true },
          { id: '2', name: 'Mme Dupont', role: 'Adjointe aux Finances', confirmed: true }
        ],
        isAllDay: false,
        isRecurring: true,
        recurringPattern: 'weekly',
        createdAt: new Date(),
        updatedAt: new Date(),
        reminders: [30]
      }
    ];
  }, []);

  // Fetch events from API or use demo data
  const fetchEvents = useCallback(async (params?: { startDate?: string; endDate?: string }) => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API
      const fetchedEvents = await eventService.getEvents({
        startDate: params?.startDate || startDate,
        endDate: params?.endDate || endDate
      });
      setEvents(fetchedEvents);
      setIsOnline(true);
    } catch (err) {
      console.warn('API non disponible, utilisation des données de démonstration');
      // Use demo data when API is not available
      setEvents(getDemoEvents());
      setIsOnline(false);
      // Don't set error for demo mode
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, getDemoEvents]);

  // Create event
  const createEvent = useCallback(async (data: EventFormData): Promise<MayorEvent | null> => {
    setLoading(true);
    try {
      if (isOnline) {
        const newEvent = await eventService.createEvent(data);
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
      } else {
        // Mode hors ligne - créer localement
        const newEvent: MayorEvent = {
          id: `local-${Date.now()}`,
          ...data,
          status: 'pending',
          participants: data.participants.map((p, i) => ({ 
            ...p, 
            id: `p-${i}`, 
            confirmed: false 
          })),
          location: data.location.name ? data.location : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'événement');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Update event
  const updateEvent = useCallback(async (id: string, data: Partial<EventFormData>): Promise<MayorEvent | null> => {
    setLoading(true);
    try {
      if (isOnline) {
        const updatedEvent = await eventService.updateEvent(id, data);
        setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
        return updatedEvent;
      } else {
        // Mode hors ligne
        setEvents(prev => prev.map(e => {
          if (e.id === id) {
            return { ...e, ...data, updatedAt: new Date() } as MayorEvent;
          }
          return e;
        }));
        return events.find(e => e.id === id) || null;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isOnline, events]);

  // Delete event
  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (isOnline) {
        await eventService.deleteEvent(id);
      }
      setEvents(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Update event status
  const updateEventStatus = useCallback(async (
    id: string, 
    status: 'confirmed' | 'pending' | 'cancelled'
  ): Promise<boolean> => {
    try {
      if (isOnline) {
        await eventService.updateEventStatus(id, status);
      }
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      return true;
    } catch (err) {
      setError('Erreur lors du changement de statut');
      return false;
    }
  }, [isOnline]);

  // Get event by ID
  const getEventById = useCallback((id: string): MayorEvent | undefined => {
    return events.find(e => e.id === id);
  }, [events]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: string): MayorEvent[] => {
    return events.filter(e => e.date === date).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
  }, [events]);

  // Refresh events
  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch, fetchEvents]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    getEventById,
    getEventsForDate,
    refreshEvents
  };
};

export default useEvents;
