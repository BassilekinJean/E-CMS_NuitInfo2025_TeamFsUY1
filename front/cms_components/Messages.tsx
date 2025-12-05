// ComponentsCms/Messages.tsx
import { useState } from 'react';
import { 
  Mail, 
  Search, 
  Star,
  Trash2,
  Reply,
  Clock,
  User,
  ChevronRight,
  X
} from 'lucide-react';

interface Message {
  id: number;
  from: string;
  email: string;
  subject: string;
  preview: string;
  content: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  category: 'general' | 'complaint' | 'request' | 'suggestion';
}

export const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      subject: 'Demande de renseignements - Carte d\'identité',
      preview: 'Bonjour, je souhaiterais connaître les documents nécessaires pour...',
      content: 'Bonjour,\n\nJe souhaiterais connaître les documents nécessaires pour le renouvellement de ma carte d\'identité. Pourriez-vous également m\'indiquer les horaires d\'ouverture du service ?\n\nCordialement,\nJean Dupont',
      date: '2025-12-05T10:30:00',
      isRead: false,
      isStarred: true,
      category: 'request'
    },
    {
      id: 2,
      from: 'Marie Martin',
      email: 'marie.martin@email.com',
      subject: 'Problème de stationnement',
      preview: 'Madame, Monsieur, je me permets de vous écrire concernant...',
      content: 'Madame, Monsieur,\n\nJe me permets de vous écrire concernant un problème récurrent de stationnement sur la rue de la République. Des véhicules sont régulièrement garés sur le trottoir, gênant le passage des piétons.\n\nPourriez-vous envisager une action ?\n\nMerci d\'avance,\nMarie Martin',
      date: '2025-12-04T15:45:00',
      isRead: true,
      isStarred: false,
      category: 'complaint'
    },
    {
      id: 3,
      from: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      subject: 'Suggestion pour le parc municipal',
      preview: 'Bonjour, j\'aurais une suggestion concernant l\'aménagement...',
      content: 'Bonjour,\n\nJ\'aurais une suggestion concernant l\'aménagement du parc municipal. Il serait formidable d\'y installer une aire de jeux pour les enfants de 3 à 6 ans.\n\nMerci de prendre en considération cette demande.\n\nBien cordialement,\nPierre Durand',
      date: '2025-12-03T09:15:00',
      isRead: true,
      isStarred: true,
      category: 'suggestion'
    },
    {
      id: 4,
      from: 'Sophie Bernard',
      email: 'sophie.bernard@email.com',
      subject: 'Question sur les horaires de la bibliothèque',
      preview: 'Bonjour, pourriez-vous me confirmer si la bibliothèque...',
      content: 'Bonjour,\n\nPourriez-vous me confirmer si la bibliothèque municipale sera ouverte pendant les vacances de Noël ?\n\nMerci d\'avance pour votre réponse.\n\nCordialement,\nSophie Bernard',
      date: '2025-12-02T14:00:00',
      isRead: false,
      isStarred: false,
      category: 'general'
    },
  ]);

  const getCategoryBadge = (category: Message['category']) => {
    const styles = {
      general: 'bg-gray-100 text-gray-800',
      complaint: 'bg-red-100 text-red-800',
      request: 'bg-blue-100 text-blue-800',
      suggestion: 'bg-green-100 text-green-800'
    };
    const labels = {
      general: 'Général',
      complaint: 'Réclamation',
      request: 'Demande',
      suggestion: 'Suggestion'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[category]}`}>
        {labels[category]}
      </span>
    );
  };

  const toggleStar = (id: number) => {
    setMessages(messages.map(msg =>
      msg.id === id ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const markAsRead = (id: number) => {
    setMessages(messages.map(msg =>
      msg.id === id ? { ...msg, isRead: true } : msg
    ));
  };

  const openMessage = (message: Message) => {
    markAsRead(message.id);
    setSelectedMessage(message);
  };

  const filteredMessages = messages.filter(msg =>
    msg.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-gray-50">
      {/* Messages List */}
      <div className={`flex-1 flex flex-col ${selectedMessage ? 'hidden lg:flex lg:w-1/2' : 'w-full'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600">
              {messages.filter(m => !m.isRead).length} non lu(s)
            </p>
          </div>
        </header>

        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Messages List */}
        <main className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div 
                key={message.id}
                onClick={() => openMessage(message)}
                className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
                  !message.isRead ? 'bg-blue-50/50' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleStar(message.id); }}
                    className="mt-1"
                  >
                    <Star className={`h-5 w-5 ${
                      message.isStarred 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`} />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`font-semibold truncate ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {message.from}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatDate(message.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`truncate ${!message.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {message.subject}
                      </span>
                      {getCategoryBadge(message.category)}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{message.preview}</p>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun message trouvé</h3>
              <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </main>
      </div>

      {/* Message Detail */}
      {selectedMessage && (
        <div className="flex-1 flex flex-col bg-white border-l border-gray-200">
          {/* Detail Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <button 
              onClick={() => setSelectedMessage(null)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <Reply className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedMessage.subject}</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedMessage.from}</p>
                  <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4" />
                <span>{formatDate(selectedMessage.date)}</span>
                {getCategoryBadge(selectedMessage.category)}
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.content}</p>
            </div>
          </div>

          {/* Reply Box */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <textarea
              placeholder="Écrire une réponse..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
