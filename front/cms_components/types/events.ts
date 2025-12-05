// cms_components/types/events.ts

export type EventStatus = 'confirmed' | 'pending' | 'cancelled';
export type EventPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EventCategory = 
  | 'reunion' 
  | 'ceremonie' 
  | 'conseil' 
  | 'inauguration' 
  | 'reception' 
  | 'rendez-vous'
  | 'visite'
  | 'autre';

export type EventColor = 
  | 'blue' 
  | 'green' 
  | 'red' 
  | 'orange' 
  | 'purple' 
  | 'pink' 
  | 'cyan' 
  | 'yellow'
  | 'indigo';

export interface EventParticipant {
  id: string;
  name: string;
  role?: string;
  email?: string;
  avatar?: string;
  confirmed: boolean;
}

export interface EventLocation {
  name: string;
  address?: string;
  room?: string;
}

export interface MayorEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string; // Format: HH:mm
  category: EventCategory;
  status: EventStatus;
  priority: EventPriority;
  color: EventColor;
  location?: EventLocation;
  participants: EventParticipant[];
  isAllDay: boolean;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  reminders?: number[]; // Minutes avant l'événement
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  priority: EventPriority;
  color: EventColor;
  location: {
    name: string;
    address: string;
    room: string;
  };
  participants: { name: string; email: string; role: string }[];
  isAllDay: boolean;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  notes: string;
  reminders: number[];
}

export const EVENT_CATEGORIES: { value: EventCategory; label: string; icon: string }[] = [
  { value: 'reunion', label: 'Réunion', icon: 'Users' },
  { value: 'ceremonie', label: 'Cérémonie', icon: 'Award' },
  { value: 'conseil', label: 'Conseil Municipal', icon: 'Building2' },
  { value: 'inauguration', label: 'Inauguration', icon: 'Scissors' },
  { value: 'reception', label: 'Réception', icon: 'Wine' },
  { value: 'rendez-vous', label: 'Rendez-vous', icon: 'Calendar' },
  { value: 'visite', label: 'Visite officielle', icon: 'MapPin' },
  { value: 'autre', label: 'Autre', icon: 'MoreHorizontal' }
];

export const EVENT_COLORS: { value: EventColor; label: string; bg: string; text: string; border: string }[] = [
  { value: 'blue', label: 'Bleu', bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
  { value: 'green', label: 'Vert', bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
  { value: 'red', label: 'Rouge', bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  { value: 'purple', label: 'Violet', bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
  { value: 'pink', label: 'Rose', bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-600' },
  { value: 'cyan', label: 'Cyan', bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-600' },
  { value: 'yellow', label: 'Jaune', bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-500' },
  { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-600' }
];

export const EVENT_PRIORITIES: { value: EventPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Basse', color: 'text-gray-500' },
  { value: 'medium', label: 'Moyenne', color: 'text-blue-500' },
  { value: 'high', label: 'Haute', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-500' }
];

export const DEFAULT_EVENT_FORM: EventFormData = {
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '10:00',
  category: 'reunion',
  priority: 'medium',
  color: 'blue',
  location: { name: '', address: '', room: '' },
  participants: [],
  isAllDay: false,
  isRecurring: false,
  notes: '',
  reminders: [15, 60]
};

// Helpers
export const getColorClasses = (color: EventColor) => {
  const colorMap = EVENT_COLORS.find(c => c.value === color);
  return colorMap ? `${colorMap.bg} ${colorMap.text} ${colorMap.border}` : 'bg-gray-500 text-white border-gray-600';
};

export const getCategoryInfo = (category: EventCategory) => {
  return EVENT_CATEGORIES.find(c => c.value === category) || EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
};

export const formatEventTime = (startTime: string, endTime: string) => {
  return `${startTime} - ${endTime}`;
};

export const getEventDuration = (startTime: string, endTime: string): number => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
};
