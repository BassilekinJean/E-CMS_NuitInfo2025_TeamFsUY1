// cms_components/Publications.tsx
import { useState, useCallback } from 'react';
import { 
  Plus, 
  X,
  ArrowLeft
} from 'lucide-react';
import type { Publication, PublicationFormData, Comment } from './types/publications';
import { PublicationForm } from './publications/PublicationForm';
import { PublicationsList } from './publications/PublicationsList';
import { PublicationCard } from './publications/PublicationCard';

// Données de démonstration
const DEMO_PUBLICATIONS: Publication[] = [
  {
    id: '1',
    type: 'post',
    title: 'Le marché de Noël 2025 est annoncé !',
    content: `Chers habitants,

Nous avons le plaisir de vous annoncer que le traditionnel marché de Noël se tiendra cette année du 15 au 24 décembre sur la place de la mairie.

Au programme :
• Plus de 50 exposants locaux
• Animations pour enfants
• Patinoire gratuite
• Concerts tous les soirs

Venez nombreux partager ces moments de convivialité !`,
    author: {
      id: '1',
      name: 'M. Jean Dupont',
      role: 'Maire',
      avatar: undefined
    },
    media: [
      {
        id: 'm1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800',
        alt: 'Marché de Noël'
      },
      {
        id: 'm2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800',
        alt: 'Décorations de Noël'
      }
    ],
    category: 'Événements',
    tags: ['noël', 'marché', 'fêtes', 'animations'],
    status: 'published',
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01'),
    publishedAt: new Date('2025-12-01'),
    likes: 156,
    likedByCurrentUser: false,
    comments: [
      {
        id: 'c1',
        authorName: 'Marie Martin',
        content: 'Super nouvelle ! Nous avons hâte d\'y être avec les enfants.',
        createdAt: new Date('2025-12-01T14:30:00'),
        likes: 12
      },
      {
        id: 'c2',
        authorName: 'Pierre Durand',
        content: 'La patinoire gratuite, quelle bonne idée !',
        createdAt: new Date('2025-12-01T15:45:00'),
        likes: 8
      },
      {
        id: 'c3',
        authorName: 'Sophie Leroy',
        content: 'Y aura-t-il des stands de vin chaud ?',
        createdAt: new Date('2025-12-02T09:15:00'),
        likes: 5
      }
    ],
    commentsEnabled: true,
    views: 1234
  },
  {
    id: '2',
    type: 'communique',
    title: 'Fermeture exceptionnelle de la mairie',
    content: `COMMUNIQUÉ OFFICIEL

La mairie sera exceptionnellement fermée le vendredi 20 décembre 2025 en raison de travaux de maintenance sur le système électrique.

Les services en ligne restent accessibles sur notre site internet.

Pour toute urgence, veuillez contacter le numéro d'astreinte : 01 23 45 67 89

Nous vous prions de nous excuser pour la gêne occasionnée.

Le Secrétariat Général`,
    author: {
      id: '2',
      name: 'Service Communication',
      role: 'Administration',
      avatar: undefined
    },
    media: [],
    category: 'Administration',
    tags: ['fermeture', 'travaux', 'information'],
    status: 'published',
    createdAt: new Date('2025-12-03'),
    updatedAt: new Date('2025-12-03'),
    publishedAt: new Date('2025-12-03'),
    likes: 0,
    likedByCurrentUser: false,
    comments: [],
    commentsEnabled: false,
    views: 567
  },
  {
    id: '3',
    type: 'post',
    title: 'Inauguration du nouveau parc écologique',
    content: `Après deux ans de travaux, nous sommes fiers de vous présenter le nouveau parc écologique de la ville !

🌳 3 hectares de verdure
🦋 Jardin des papillons
🌿 Potager communautaire
🚴 Pistes cyclables
♿ Accessibilité PMR complète

L'inauguration aura lieu le samedi 14 décembre à 10h en présence de M. le Maire.

#écologie #nature #ville #patrimoine`,
    author: {
      id: '3',
      name: 'Service Environnement',
      role: 'Direction Environnement',
      avatar: undefined
    },
    media: [
      {
        id: 'm3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
        alt: 'Parc écologique'
      }
    ],
    category: 'Environnement',
    tags: ['écologie', 'parc', 'nature', 'inauguration'],
    status: 'published',
    createdAt: new Date('2025-11-28'),
    updatedAt: new Date('2025-11-28'),
    publishedAt: new Date('2025-11-28'),
    likes: 89,
    likedByCurrentUser: true,
    comments: [
      {
        id: 'c4',
        authorName: 'Lucas Bernard',
        content: 'Enfin ! C\'est une excellente initiative pour notre ville.',
        createdAt: new Date('2025-11-28T16:00:00'),
        likes: 15
      }
    ],
    commentsEnabled: true,
    views: 892
  },
  {
    id: '4',
    type: 'communique',
    title: 'Alerte météo - Vigilance orange neige-verglas',
    content: `[ALERTE] COMMUNIQUÉ OFFICIEL - ALERTE MÉTÉO [ALERTE]

Météo France a placé notre département en vigilance orange neige-verglas à compter de ce soir 18h.

RECOMMANDATIONS :
• Limitez vos déplacements
• Équipez vos véhicules de pneus neige
• Sécurisez les personnes vulnérables
• Évitez les zones à risque

Les équipes municipales sont mobilisées pour le salage des routes principales.

Numéro d'urgence : 01 23 45 67 00

Restez prudents.`,
    author: {
      id: '1',
      name: 'M. Jean Dupont',
      role: 'Maire',
      avatar: undefined
    },
    media: [],
    category: 'Sécurité',
    tags: ['météo', 'alerte', 'neige', 'sécurité'],
    status: 'published',
    createdAt: new Date('2025-12-04'),
    updatedAt: new Date('2025-12-04'),
    publishedAt: new Date('2025-12-04'),
    likes: 0,
    likedByCurrentUser: false,
    comments: [],
    commentsEnabled: false,
    views: 2341
  },
  {
    id: '5',
    type: 'post',
    title: 'Résultats du concours photo "Ma ville en couleurs"',
    content: `Les résultats sont tombés ! Merci aux 234 participants pour leurs magnifiques clichés.

 1er prix : Sophie Martin - "Lever de soleil sur le clocher"
 2ème prix : Thomas Petit - "Reflets d'automne"  
 3ème prix : Emma Dubois - "La fontaine en hiver"

Une exposition des 20 meilleures photos aura lieu à la médiathèque du 10 au 31 décembre.

Félicitations à tous les participants !`,
    author: {
      id: '4',
      name: 'Service Culture',
      role: 'Direction Culture',
      avatar: undefined
    },
    media: [
      {
        id: 'm4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        alt: 'Photo gagnante'
      }
    ],
    category: 'Culture',
    tags: ['concours', 'photo', 'culture', 'exposition'],
    status: 'scheduled',
    scheduledAt: new Date('2025-12-10T09:00:00'),
    createdAt: new Date('2025-12-02'),
    updatedAt: new Date('2025-12-02'),
    likes: 0,
    likedByCurrentUser: false,
    comments: [],
    commentsEnabled: true,
    views: 0
  },
  {
    id: '6',
    type: 'post',
    title: 'Brouillon - Vœux du Maire 2026',
    content: `Chers habitants,

En ce début d'année 2026, je tenais à vous adresser mes vœux les plus sincères...

[À COMPLÉTER]`,
    author: {
      id: '1',
      name: 'M. Jean Dupont',
      role: 'Maire',
      avatar: undefined
    },
    media: [],
    category: 'Actualités',
    tags: ['vœux', '2026'],
    status: 'draft',
    createdAt: new Date('2025-12-05'),
    updatedAt: new Date('2025-12-05'),
    likes: 0,
    likedByCurrentUser: false,
    comments: [],
    commentsEnabled: true,
    views: 0
  }
];

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export const Publications = () => {
  const [publications, setPublications] = useState<Publication[]>(DEMO_PUBLICATIONS);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<string | null>(null);

  // Handlers
  const handleCreatePublication = useCallback((data: PublicationFormData) => {
    const newPublication: Publication = {
      id: Date.now().toString(),
      type: data.type,
      title: data.title,
      content: data.content,
      author: {
        id: '1',
        name: 'M. Jean Dupont',
        role: 'Maire'
      },
      media: data.mediaPreview.map((m, index) => ({
        id: `media-${Date.now()}-${index}`,
        type: m.type,
        url: m.preview,
        alt: `Media ${index + 1}`
      })),
      category: data.category,
      tags: data.tags,
      status: data.status,
      scheduledAt: data.scheduledAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: data.status === 'published' ? new Date() : undefined,
      likes: 0,
      likedByCurrentUser: false,
      comments: [],
      commentsEnabled: data.type === 'post' && data.commentsEnabled,
      views: 0
    };

    setPublications(prev => [newPublication, ...prev]);
    setViewMode('list');
  }, []);

  const handleEditPublication = useCallback((data: PublicationFormData) => {
    if (!selectedPublication) return;

    setPublications(prev => prev.map(pub => {
      if (pub.id === selectedPublication.id) {
        return {
          ...pub,
          type: data.type,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
          status: data.status,
          scheduledAt: data.scheduledAt,
          updatedAt: new Date(),
          commentsEnabled: data.type === 'post' && data.commentsEnabled
        };
      }
      return pub;
    }));

    setViewMode('list');
    setSelectedPublication(null);
  }, [selectedPublication]);

  const handleDeletePublication = useCallback((id: string) => {
    setPublicationToDelete(id);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (publicationToDelete) {
      setPublications(prev => prev.filter(pub => pub.id !== publicationToDelete));
      setShowDeleteModal(false);
      setPublicationToDelete(null);
    }
  }, [publicationToDelete]);

  const handleLike = useCallback((id: string) => {
    setPublications(prev => prev.map(pub => {
      if (pub.id === id && pub.type === 'post') {
        return {
          ...pub,
          likes: pub.likedByCurrentUser ? pub.likes - 1 : pub.likes + 1,
          likedByCurrentUser: !pub.likedByCurrentUser
        };
      }
      return pub;
    }));
  }, []);

  const handleAddComment = useCallback((id: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: 'Admin',
      content,
      createdAt: new Date(),
      likes: 0
    };

    setPublications(prev => prev.map(pub => {
      if (pub.id === id) {
        return {
          ...pub,
          comments: [...pub.comments, newComment]
        };
      }
      return pub;
    }));
  }, []);

  const handleViewPublication = useCallback((publication: Publication) => {
    setSelectedPublication(publication);
    setViewMode('view');
  }, []);

  const handleEditClick = useCallback((publication: Publication) => {
    setSelectedPublication(publication);
    setViewMode('edit');
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {viewMode !== 'list' && (
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedPublication(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {viewMode === 'list' && 'Publications'}
                {viewMode === 'create' && 'Nouvelle publication'}
                {viewMode === 'edit' && 'Modifier la publication'}
                {viewMode === 'view' && 'Aperçu'}
              </h1>
              <p className="text-sm text-gray-600">
                {viewMode === 'list' && 'Gérez vos posts et communiqués officiels'}
                {viewMode === 'create' && 'Créez un nouveau post ou communiqué'}
                {viewMode === 'edit' && selectedPublication?.title}
                {viewMode === 'view' && selectedPublication?.title}
              </p>
            </div>
          </div>
          
          {viewMode === 'list' && (
            <button 
              onClick={() => setViewMode('create')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 font-medium shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvelle publication</span>
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {viewMode === 'list' && (
          <PublicationsList
            publications={publications}
            onEdit={handleEditClick}
            onDelete={handleDeletePublication}
            onLike={handleLike}
            onAddComment={handleAddComment}
            onView={handleViewPublication}
          />
        )}

        {viewMode === 'create' && (
          <div className="max-w-4xl mx-auto">
            <PublicationForm
              onSubmit={handleCreatePublication}
              onCancel={() => setViewMode('list')}
            />
          </div>
        )}

        {viewMode === 'edit' && selectedPublication && (
          <div className="max-w-4xl mx-auto">
            <PublicationForm
              onSubmit={handleEditPublication}
              onCancel={() => {
                setViewMode('list');
                setSelectedPublication(null);
              }}
              initialData={{
                type: selectedPublication.type,
                title: selectedPublication.title,
                content: selectedPublication.content,
                category: selectedPublication.category,
                tags: selectedPublication.tags,
                status: selectedPublication.status,
                scheduledAt: selectedPublication.scheduledAt,
                commentsEnabled: selectedPublication.commentsEnabled
              }}
              isEditing
            />
          </div>
        )}

        {viewMode === 'view' && selectedPublication && (
          <div className="max-w-2xl mx-auto">
            <PublicationCard
              publication={selectedPublication}
              onEdit={handleEditClick}
              onDelete={handleDeletePublication}
              onLike={handleLike}
              onAddComment={handleAddComment}
              isAdmin={true}
            />
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirmer la suppression</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publications;
