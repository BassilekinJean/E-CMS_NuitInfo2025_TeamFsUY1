// Types pour le système de publications

export type PublicationType = 'post' | 'communique';
export type MediaType = 'text' | 'image' | 'video';
export type PublicationStatus = 'published' | 'draft' | 'scheduled';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  likes: number;
}

export interface Publication {
  id: string;
  type: PublicationType;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  media: MediaItem[];
  category: string;
  tags: string[];
  status: PublicationStatus;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Uniquement pour les posts
  likes: number;
  likedByCurrentUser: boolean;
  comments: Comment[];
  commentsEnabled: boolean;
  
  // Statistiques
  views: number;
}

export interface PublicationFormData {
  type: PublicationType;
  title: string;
  content: string;
  category: string;
  tags: string[];
  media: File[];
  mediaPreview: { file: File; preview: string; type: 'image' | 'video' }[];
  status: PublicationStatus;
  scheduledAt?: Date;
  commentsEnabled: boolean;
}

export const CATEGORIES = [
  'Actualités',
  'Événements',
  'Travaux',
  'Environnement',
  'Culture',
  'Sport',
  'Social',
  'Urbanisme',
  'Économie',
  'Administration',
  'Sécurité',
  'Santé',
  'Éducation',
  'Transport'
];

export const DEFAULT_FORM_DATA: PublicationFormData = {
  type: 'post',
  title: '',
  content: '',
  category: 'Actualités',
  tags: [],
  media: [],
  mediaPreview: [],
  status: 'draft',
  commentsEnabled: true
};
