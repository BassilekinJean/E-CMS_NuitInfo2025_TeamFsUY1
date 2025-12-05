// cms_components/publications/PublicationCard.tsx
import { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Share2,
  Calendar,
  Clock,
  FileText,
  Megaphone,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react';
import type { Publication, Comment } from '../types/publications';

interface PublicationCardProps {
  publication: Publication;
  onEdit?: (publication: Publication) => void;
  onDelete?: (id: string) => void;
  onLike?: (id: string) => void;
  onAddComment?: (id: string, content: string) => void;
  isAdmin?: boolean;
}

export const PublicationCard = ({
  publication,
  onEdit,
  onDelete,
  onLike,
  onAddComment,
  isAdmin = true
}: PublicationCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFullContent, setShowFullContent] = useState(false);

  const isPost = publication.type === 'post';
  const hasMedia = publication.media.length > 0;
  const hasMultipleMedia = publication.media.length > 1;

  const getStatusBadge = () => {
    const styles = {
      published: 'bg-green-100 text-green-800 border-green-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    const labels = {
      published: 'Publié',
      draft: 'Brouillon',
      scheduled: 'Programmé'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[publication.status]}`}>
        {labels[publication.status]}
      </span>
    );
  };

  const getTypeBadge = () => {
    if (isPost) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          <FileText className="h-3 w-3" />
          Post
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
        <Megaphone className="h-3 w-3" />
        Communiqué
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return formatDate(date);
  };

  const handleSubmitComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(publication.id, newComment.trim());
      setNewComment('');
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {publication.author.avatar ? (
              <img
                src={publication.author.avatar}
                alt={publication.author.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {publication.author.name.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900">{publication.author.name}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{publication.author.role}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(publication.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getTypeBadge()}
            {getStatusBadge()}
            
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={() => {
                        onEdit?.(publication);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.(publication.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{publication.title}</h3>
        
        <div className="text-gray-700 whitespace-pre-wrap">
          {showFullContent ? publication.content : truncateContent(publication.content)}
          {publication.content.length > 200 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-blue-600 hover:text-blue-700 font-medium ml-1"
            >
              {showFullContent ? 'Voir moins' : 'Voir plus'}
            </button>
          )}
        </div>

        {/* Tags */}
        {publication.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {publication.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Category */}
        <div className="mt-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
            {publication.category}
          </span>
        </div>
      </div>

      {/* Media Gallery */}
      {hasMedia && (
        <div className="relative">
          {publication.media[currentMediaIndex].type === 'image' ? (
            <img
              src={publication.media[currentMediaIndex].url}
              alt={publication.media[currentMediaIndex].alt || 'Image'}
              className="w-full h-80 object-cover"
            />
          ) : (
            <video
              src={publication.media[currentMediaIndex].url}
              controls
              className="w-full h-80 object-cover"
            />
          )}

          {/* Media type indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-lg text-white text-xs">
            {publication.media[currentMediaIndex].type === 'image' ? (
              <ImageIcon className="h-3 w-3" />
            ) : (
              <Video className="h-3 w-3" />
            )}
            {hasMultipleMedia && `${currentMediaIndex + 1}/${publication.media.length}`}
          </div>

          {/* Navigation arrows */}
          {hasMultipleMedia && (
            <>
              <button
                onClick={() => setCurrentMediaIndex(prev => prev > 0 ? prev - 1 : publication.media.length - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentMediaIndex(prev => prev < publication.media.length - 1 ? prev + 1 : 0)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Media dots */}
          {hasMultipleMedia && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {publication.media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {isPost && (
            <>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {publication.likes} j'aime
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {publication.comments.length} commentaires
              </span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {publication.views} vues
          </span>
        </div>
        {publication.scheduledAt && publication.status === 'scheduled' && (
          <span className="flex items-center gap-1 text-blue-600">
            <Calendar className="h-4 w-4" />
            Programmé le {formatDate(publication.scheduledAt)}
          </span>
        )}
      </div>

      {/* Actions bar - Only for posts */}
      {isPost && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-around">
          <button
            onClick={() => onLike?.(publication.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              publication.likedByCurrentUser
                ? 'text-red-500 bg-red-50'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className={`h-5 w-5 ${publication.likedByCurrentUser ? 'fill-current' : ''}`} />
            <span className="font-medium">J'aime</span>
          </button>
          
          {publication.commentsEnabled && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Commenter</span>
            </button>
          )}
          
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="font-medium">Partager</span>
          </button>
        </div>
      )}

      {/* Communiqué notice */}
      {!isPost && (
        <div className="px-4 py-3 border-t border-gray-100 bg-orange-50">
          <div className="flex items-center gap-2 text-orange-700 text-sm">
            <Megaphone className="h-4 w-4" />
            <span>Communiqué officiel - Lecture seule</span>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {isPost && showComments && publication.commentsEnabled && (
        <div className="border-t border-gray-100">
          {/* Comment input */}
          <div className="p-4 flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              M
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                placeholder="Écrire un commentaire..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Comments list */}
          {publication.comments.length > 0 && (
            <div className="px-4 pb-4 space-y-3">
              {publication.comments.slice(0, 3).map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
              {publication.comments.length > 3 && (
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Voir les {publication.comments.length - 3} autres commentaires
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentItem = ({ comment }: { comment: Comment }) => {
  return (
    <div className="flex gap-3">
      {comment.authorAvatar ? (
        <img
          src={comment.authorAvatar}
          alt={comment.authorName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
          {comment.authorName.charAt(0)}
        </div>
      )}
      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl px-4 py-2">
          <span className="font-semibold text-sm text-gray-900">{comment.authorName}</span>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <button className="hover:text-blue-600">J'aime</button>
          <button className="hover:text-blue-600">Répondre</button>
          <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
          {comment.likes > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              {comment.likes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationCard;
