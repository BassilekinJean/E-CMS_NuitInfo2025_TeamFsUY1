// cms_components/services/eventService.ts
import type { MayorEvent, EventFormData } from '../types/events';

// Configuration de l'API
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

// Types pour les réponses API
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Transformer les données du backend Django vers le format frontend
const transformEventFromApi = (apiEvent: any): MayorEvent => ({
  id: apiEvent.id?.toString() || '',
  title: apiEvent.title || apiEvent.nom || '',
  description: apiEvent.description || '',
  date: apiEvent.date || apiEvent.date_debut?.split('T')[0] || '',
  startTime: apiEvent.start_time || apiEvent.temps_debut || apiEvent.date_debut?.split('T')[1]?.slice(0, 5) || '09:00',
  endTime: apiEvent.end_time || apiEvent.temps_fin || apiEvent.date_fin?.split('T')[1]?.slice(0, 5) || '10:00',
  category: apiEvent.category || apiEvent.categorie || 'autre',
  status: apiEvent.status || apiEvent.statut || 'pending',
  priority: apiEvent.priority || apiEvent.priorite || 'medium',
  color: apiEvent.color || apiEvent.couleur || 'blue',
  location: apiEvent.location || apiEvent.lieu ? {
    name: apiEvent.location?.name || apiEvent.lieu || '',
    address: apiEvent.location?.address || apiEvent.adresse || '',
    room: apiEvent.location?.room || apiEvent.salle || ''
  } : undefined,
  participants: (apiEvent.participants || []).map((p: any) => ({
    id: p.id?.toString() || '',
    name: p.name || p.nom || '',
    role: p.role || '',
    email: p.email || '',
    avatar: p.avatar || '',
    confirmed: p.confirmed ?? p.confirme ?? false
  })),
  isAllDay: apiEvent.is_all_day || apiEvent.journee_entiere || false,
  isRecurring: apiEvent.is_recurring || apiEvent.recurrent || false,
  recurringPattern: apiEvent.recurring_pattern || apiEvent.pattern_recurrence,
  notes: apiEvent.notes || '',
  createdAt: new Date(apiEvent.created_at || apiEvent.date_creation || Date.now()),
  updatedAt: new Date(apiEvent.updated_at || apiEvent.date_modification || Date.now()),
  reminders: apiEvent.reminders || apiEvent.rappels || []
});

// Transformer les données du frontend vers le format Django
const transformEventToApi = (event: EventFormData): any => ({
  title: event.title,
  nom: event.title, // Pour compatibilité Django FR
  description: event.description,
  date: event.date,
  start_time: event.startTime,
  temps_debut: event.startTime,
  end_time: event.endTime,
  temps_fin: event.endTime,
  category: event.category,
  categorie: event.category,
  priority: event.priority,
  priorite: event.priority,
  color: event.color,
  couleur: event.color,
  location: event.location.name ? {
    name: event.location.name,
    address: event.location.address,
    room: event.location.room
  } : null,
  lieu: event.location.name || null,
  adresse: event.location.address || null,
  salle: event.location.room || null,
  participants: event.participants.map(p => ({
    name: p.name,
    nom: p.name,
    email: p.email,
    role: p.role
  })),
  is_all_day: event.isAllDay,
  journee_entiere: event.isAllDay,
  is_recurring: event.isRecurring,
  recurrent: event.isRecurring,
  recurring_pattern: event.recurringPattern,
  pattern_recurrence: event.recurringPattern,
  notes: event.notes,
  reminders: event.reminders,
  rappels: event.reminders
});

// Headers par défaut
const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Service API pour les événements
export const eventService = {
  // Récupérer tous les événements
  async getEvents(params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    status?: string;
  }): Promise<MayorEvent[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);

      const url = `${API_BASE_URL}/events/?${queryParams.toString()}`;
      const response = await fetch(url, { headers: getHeaders() });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des événements');
      
      const data = await response.json();
      // Gérer pagination Django REST Framework
      const events = data.results || data;
      return events.map(transformEventFromApi);
    } catch (error) {
      console.error('EventService.getEvents error:', error);
      throw error;
    }
  },

  // Récupérer un événement par ID
  async getEvent(id: string): Promise<MayorEvent> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}/`, { 
        headers: getHeaders() 
      });
      
      if (!response.ok) throw new Error('Événement non trouvé');
      
      const data = await response.json();
      return transformEventFromApi(data);
    } catch (error) {
      console.error('EventService.getEvent error:', error);
      throw error;
    }
  },

  // Créer un événement
  async createEvent(eventData: EventFormData): Promise<MayorEvent> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(transformEventToApi(eventData))
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }
      
      const data = await response.json();
      return transformEventFromApi(data);
    } catch (error) {
      console.error('EventService.createEvent error:', error);
      throw error;
    }
  },

  // Mettre à jour un événement
  async updateEvent(id: string, eventData: Partial<EventFormData>): Promise<MayorEvent> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(transformEventToApi(eventData as EventFormData))
      });
      
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      
      const data = await response.json();
      return transformEventFromApi(data);
    } catch (error) {
      console.error('EventService.updateEvent error:', error);
      throw error;
    }
  },

  // Supprimer un événement
  async deleteEvent(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
    } catch (error) {
      console.error('EventService.deleteEvent error:', error);
      throw error;
    }
  },

  // Changer le statut d'un événement
  async updateEventStatus(id: string, status: 'confirmed' | 'pending' | 'cancelled'): Promise<MayorEvent> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}/status/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, statut: status })
      });
      
      if (!response.ok) throw new Error('Erreur lors du changement de statut');
      
      const data = await response.json();
      return transformEventFromApi(data);
    } catch (error) {
      console.error('EventService.updateEventStatus error:', error);
      throw error;
    }
  },

  // Récupérer les événements d'une semaine spécifique
  async getWeekEvents(weekStart: Date): Promise<MayorEvent[]> {
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.getEvents({ startDate, endDate });
  },

  // Récupérer les événements d'un mois spécifique
  async getMonthEvents(year: number, month: number): Promise<MayorEvent[]> {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    return this.getEvents({ startDate, endDate });
  },

  // Récupérer les événements du jour
  async getTodayEvents(): Promise<MayorEvent[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getEvents({ startDate: today, endDate: today });
  },

  // Récupérer les prochains événements
  async getUpcomingEvents(limit: number = 5): Promise<MayorEvent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/upcoming/?limit=${limit}`, {
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération');
      
      const data = await response.json();
      const events = data.results || data;
      return events.map(transformEventFromApi);
    } catch (error) {
      console.error('EventService.getUpcomingEvents error:', error);
      throw error;
    }
  }
};

export default eventService;
