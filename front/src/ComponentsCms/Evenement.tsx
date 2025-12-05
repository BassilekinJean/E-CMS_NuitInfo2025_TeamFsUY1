import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  X
} from 'lucide-react';

interface EventAttendee {
  name: string;
  avatar: string;
}

interface EventItem {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: EventAttendee[];
  color: 'green' | 'orange' | 'yellow' | 'blue' | 'pink' | 'cyan' | 'purple';
  status: 'confirmed' | 'pending';
}

const EventReservationCalendar = () => {
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const events: EventItem[] = [
    {
      id: 1,
      title: 'Shooting Stars',
      date: '2025-05-12',
      startTime: '09:00',
      endTime: '11:00',
      attendees: [
        { name: 'John D.', avatar: '👨' },
        { name: 'Sarah M.', avatar: '👩' }
      ],
      color: 'green',
      status: 'confirmed'
    },
    {
      id: 2,
      title: 'The Amazing Hubble',
      date: '2025-05-13',
      startTime: '11:45',
      endTime: '13:00',
      attendees: [
        { name: 'Mike P.', avatar: '👨‍💼' },
        { name: 'Lisa K.', avatar: '👩‍💼' }
      ],
      color: 'orange',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Choosing A Quality Childcare Set',
      date: '2025-05-15',
      startTime: '11:00',
      endTime: '13:00',
      attendees: [
        { name: 'Tom H.', avatar: '👨‍🏫' },
        { name: 'Anna B.', avatar: '👩‍🏫' }
      ],
      color: 'orange',
      status: 'confirmed'
    },
    {
      id: 4,
      title: 'Astronomy Binoculars: A Great Alternative',
      date: '2025-05-15',
      startTime: '14:00',
      endTime: '16:30',
      attendees: [
        { name: 'Chris W.', avatar: '👨‍🔬' },
        { name: 'Emma S.', avatar: '👩‍🔬' }
      ],
      color: 'yellow',
      status: 'confirmed'
    },
    {
      id: 5,
      title: 'The Amazing Hubble',
      date: '2025-05-14',
      startTime: '13:15',
      endTime: '15:00',
      attendees: [
        { name: 'David L.', avatar: '👨‍🚀' },
        { name: 'Sophie R.', avatar: '👩‍🚀' },
        { name: 'Alex M.', avatar: '👨‍💻' }
      ],
      color: 'blue',
      status: 'confirmed'
    },
    {
      id: 6,
      title: 'Astronomy Binoculars',
      date: '2025-05-14',
      startTime: '16:00',
      endTime: '17:30',
      attendees: [
        { name: 'Ryan T.', avatar: '👨‍🎓' },
        { name: 'Mia C.', avatar: '👩‍🎓' }
      ],
      color: 'pink',
      status: 'pending'
    },
    {
      id: 7,
      title: 'Universe Through A Child\'s Eyes',
      date: '2025-05-17',
      startTime: '11:45',
      endTime: '14:00',
      attendees: [
        { name: 'Paul D.', avatar: '👨‍🏫' },
        { name: 'Rachel N.', avatar: '👩‍🏫' }
      ],
      color: 'orange',
      status: 'confirmed'
    },
    {
      id: 8,
      title: 'Quality Childcare Set',
      date: '2025-05-18',
      startTime: '14:00',
      endTime: '16:00',
      attendees: [
        { name: 'Mark J.', avatar: '👨' },
        { name: 'Julia F.', avatar: '👩' }
      ],
      color: 'cyan',
      status: 'confirmed'
    }
  ];

  const weekDays = [
    { full: 'Monday', short: 'Lun', date: 12 },
    { full: 'Tuesday', short: 'Mar', date: 13 },
    { full: 'Wednesday', short: 'Mer', date: 14 },
    { full: 'Thursday', short: 'Jeu', date: 15 },
    { full: 'Friday', short: 'Ven', date: 16 },
    { full: 'Saturday', short: 'Sam', date: 17 },
    { full: 'Sunday', short: 'Dim', date: 18 }
  ];

  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8h to 20h
  
  const getColorClasses = (color: EventItem['color']) => {
    const colors = {
      green: 'bg-green-500 hover:bg-green-600 text-white border-green-600',
      orange: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600',
      yellow: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-500',
      blue: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600',
      pink: 'bg-pink-500 hover:bg-pink-600 text-white border-pink-600',
      cyan: 'bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-600',
      purple: 'bg-purple-500 hover:bg-purple-600 text-white border-purple-600'
    };
    return colors[color];
  };

  const getEventPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startInMinutes = (startHour - 8) * 60 + startMin;
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    
    return {
      top: `${(startInMinutes / 60) * 80}px`,
      height: `${(duration / 60) * 80}px`
    };
  };

  const handleEventClick = (event: EventItem) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h1>
            <p className="text-sm text-gray-600">Calendrier des événements</p>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium shadow-md transition-colors">
            <Plus className="h-5 w-5" />
            <span>Nouvel Événement</span>
          </button>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Date Navigation */}
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm">
              Aujourd'hui
            </button>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <span className="text-base sm:text-lg font-semibold text-gray-900 min-w-[160px] text-center">
                Mai 12 - 18, 2025
              </span>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button className="px-3 py-2 rounded-md font-medium text-xs sm:text-sm transition-colors text-gray-600 hover:bg-white">
              Mois
            </button>
            <button className="px-3 py-2 bg-white rounded-md font-medium text-xs sm:text-sm shadow-sm text-gray-900">
              Semaine
            </button>
            <button className="px-3 py-2 rounded-md font-medium text-xs sm:text-sm transition-colors text-gray-600 hover:bg-white">
              Jour
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1000px]">
          {/* Week Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <div className="grid grid-cols-8">
              {/* Time column header */}
              <div className="border-r border-gray-200 bg-gray-50"></div>
              
              {/* Day headers */}
              {weekDays.map((day) => (
                <div 
                  key={day.date} 
                  className="border-r last:border-r-0 border-gray-200 p-4 text-center bg-gray-50"
                >
                  <div className="font-bold text-gray-900 text-lg">{day.date}</div>
                  <div className="text-sm text-gray-600">{day.short}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Body with Time Grid */}
          <div className="relative">
            <div className="grid grid-cols-8">
              {/* Time column */}
              <div className="border-r border-gray-200 bg-gray-50">
                {timeSlots.map((hour) => (
                  <div 
                    key={hour} 
                    className="h-20 border-b border-gray-200 px-3 py-2 text-sm font-medium text-gray-600"
                  >
                    {hour}:00
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const dayEvents = events.filter(e => {
                  const eventDate = new Date(e.date).getDate();
                  return eventDate === day.date;
                });

                return (
                  <div 
                    key={day.date} 
                    className="relative border-r last:border-r-0 border-gray-200"
                  >
                    {/* Time slot backgrounds */}
                    {timeSlots.map((hour) => (
                      <div 
                        key={hour} 
                        className="h-20 border-b border-gray-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
                      />
                    ))}

                    {/* Events positioned absolutely */}
                    {dayEvents.map((event) => {
                      const position = getEventPosition(event.startTime, event.endTime);
                      return (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`absolute left-1 right-1 ${getColorClasses(event.color)} rounded-lg p-2 cursor-pointer shadow-md border-l-4 overflow-hidden transition-all`}
                          style={{
                            top: position.top,
                            height: position.height,
                            minHeight: '60px'
                          }}
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold opacity-90">
                                {event.startTime}
                              </span>
                              <span className={`w-2 h-2 rounded-full ${
                                event.status === 'confirmed' ? 'bg-white' : 'bg-yellow-300'
                              }`}></span>
                            </div>
                            
                            <h3 className="font-bold text-sm mb-1 line-clamp-2">
                              {event.title}
                            </h3>
                            
                            <div className="flex items-center -space-x-1 mt-auto">
                              {event.attendees.slice(0, 2).map((attendee, idx) => (
                                <div 
                                  key={idx}
                                  className="w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs"
                                  title={attendee.name}
                                >
                                  {attendee.avatar}
                                </div>
                              ))}
                              {event.attendees.length > 2 && (
                                <div className="w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs font-bold">
                                  +{event.attendees.length - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedEvent.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedEvent.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                  </span>
                </div>
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{selectedEvent.date}</span>
              </div>

              <div className="flex items-center space-x-3 text-gray-700">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{selectedEvent.startTime} - {selectedEvent.endTime}</span>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  Participants ({selectedEvent.attendees.length})
                </h3>
                <div className="space-y-2">
                  {selectedEvent.attendees.map((attendee, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                        {attendee.avatar}
                      </div>
                      <span className="font-medium text-gray-900">{attendee.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Modifier</span>
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Trash2 className="h-5 w-5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventReservationCalendar;