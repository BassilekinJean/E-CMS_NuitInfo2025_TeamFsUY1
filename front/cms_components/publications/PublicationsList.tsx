// cms_components/publications/PublicationsList.tsx
import { useState } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  FileText,
  Megaphone,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  Trash2,
  Eye,
  ChevronDown,
  Heart,
  MessageCircle
} from 'lucide-react';
import type { Publication, PublicationType, PublicationStatus } from '../types/publications';
import { PublicationCard } from './PublicationCard';

interface PublicationsListProps {
  publications: Publication[];
  onEdit: (publication: Publication) => void;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onAddComment: (id: string, content: string) => void;
  onView: (publication: Publication) => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'mostLiked' | 'mostViewed';

export const PublicationsList = ({
  publications,
  onEdit,
  onDelete,
  onLike,
  onAddComment,
  onView
}: PublicationsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<PublicationType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PublicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Filter publications
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = 
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || pub.type === filterType;
    const matchesStatus = filterStatus === 'all' || pub.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort publications
  const sortedPublications = [...filteredPublications].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'mostLiked':
        return b.likes - a.likes;
      case 'mostViewed':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  // Stats
  const stats = {
    total: publications.length,
    posts: publications.filter(p => p.type === 'post').length,
    communiques: publications.filter(p => p.type === 'communique').length,
    published: publications.filter(p => p.status === 'published').length,
    drafts: publications.filter(p => p.status === 'draft').length,
    scheduled: publications.filter(p => p.status === 'scheduled').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Total"
          value={stats.total}
          color="gray"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Posts"
          value={stats.posts}
          color="blue"
          onClick={() => setFilterType(filterType === 'post' ? 'all' : 'post')}
          active={filterType === 'post'}
        />
        <StatCard
          icon={<Megaphone className="h-5 w-5" />}
          label="Communiqués"
          value={stats.communiques}
          color="orange"
          onClick={() => setFilterType(filterType === 'communique' ? 'all' : 'communique')}
          active={filterType === 'communique'}
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Publiés"
          value={stats.published}
          color="green"
          onClick={() => setFilterStatus(filterStatus === 'published' ? 'all' : 'published')}
          active={filterStatus === 'published'}
        />
        <StatCard
          icon={<Edit3 className="h-5 w-5" />}
          label="Brouillons"
          value={stats.drafts}
          color="gray"
          onClick={() => setFilterStatus(filterStatus === 'draft' ? 'all' : 'draft')}
          active={filterStatus === 'draft'}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Programmés"
          value={stats.scheduled}
          color="blue"
          onClick={() => setFilterStatus(filterStatus === 'scheduled' ? 'all' : 'scheduled')}
          active={filterStatus === 'scheduled'}
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre, contenu, catégorie ou tag..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Toggle Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-colors ${
                showFilters || filterType !== 'all' || filterStatus !== 'all'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filtres
              {(filterType !== 'all' || filterStatus !== 'all') && (
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {(filterType !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
              >
                <option value="newest">Plus récent</option>
                <option value="oldest">Plus ancien</option>
                <option value="mostLiked">Plus aimés</option>
                <option value="mostViewed">Plus vus</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex gap-2">
                <FilterButton
                  active={filterType === 'all'}
                  onClick={() => setFilterType('all')}
                >
                  Tous
                </FilterButton>
                <FilterButton
                  active={filterType === 'post'}
                  onClick={() => setFilterType('post')}
                  icon={<FileText className="h-4 w-4" />}
                >
                  Posts
                </FilterButton>
                <FilterButton
                  active={filterType === 'communique'}
                  onClick={() => setFilterType('communique')}
                  icon={<Megaphone className="h-4 w-4" />}
                >
                  Communiqués
                </FilterButton>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <div className="flex gap-2">
                <FilterButton
                  active={filterStatus === 'all'}
                  onClick={() => setFilterStatus('all')}
                >
                  Tous
                </FilterButton>
                <FilterButton
                  active={filterStatus === 'published'}
                  onClick={() => setFilterStatus('published')}
                  icon={<CheckCircle className="h-4 w-4" />}
                >
                  Publiés
                </FilterButton>
                <FilterButton
                  active={filterStatus === 'draft'}
                  onClick={() => setFilterStatus('draft')}
                  icon={<Edit3 className="h-4 w-4" />}
                >
                  Brouillons
                </FilterButton>
                <FilterButton
                  active={filterStatus === 'scheduled'}
                  onClick={() => setFilterStatus('scheduled')}
                  icon={<Calendar className="h-4 w-4" />}
                >
                  Programmés
                </FilterButton>
              </div>
            </div>

            {/* Clear Filters */}
            {(filterType !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="self-end px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {sortedPublications.length} publication{sortedPublications.length > 1 ? 's' : ''} trouvée{sortedPublications.length > 1 ? 's' : ''}
      </div>

      {/* Publications Grid/List */}
      {sortedPublications.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedPublications.map(publication => (
              <PublicationCard
                key={publication.id}
                publication={publication}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
                onAddComment={onAddComment}
                isAdmin={true}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPublications.map(publication => (
              <PublicationListItem
                key={publication.id}
                publication={publication}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState searchTerm={searchTerm} />
      )}
    </div>
  );
};

// Sub-components
const StatCard = ({
  icon,
  label,
  value,
  color,
  onClick,
  active
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'gray' | 'blue' | 'orange' | 'green';
  onClick?: () => void;
  active?: boolean;
}) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600'
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all ${
        active
          ? `border-${color === 'gray' ? 'gray' : color}-500 ${colors[color]}`
          : 'border-transparent bg-white hover:border-gray-200'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </button>
  );
};

const FilterButton = ({
  active,
  onClick,
  icon,
  children
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {icon}
    {children}
  </button>
);

const PublicationListItem = ({
  publication,
  onEdit,
  onDelete,
  onView
}: {
  publication: Publication;
  onEdit: (publication: Publication) => void;
  onDelete: (id: string) => void;
  onView: (publication: Publication) => void;
}) => {
  const isPost = publication.type === 'post';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Media Preview */}
        {publication.media.length > 0 ? (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            {publication.media[0].type === 'image' ? (
              <img
                src={publication.media[0].url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <video src={publication.media[0].url} className="w-full h-full object-cover" />
            )}
          </div>
        ) : (
          <div className={`w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isPost ? 'bg-blue-100' : 'bg-orange-100'
          }`}>
            {isPost ? (
              <FileText className="h-8 w-8 text-blue-600" />
            ) : (
              <Megaphone className="h-8 w-8 text-orange-600" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              isPost ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {isPost ? 'Post' : 'Communiqué'}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              publication.status === 'published' ? 'bg-green-100 text-green-700' :
              publication.status === 'draft' ? 'bg-gray-100 text-gray-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {publication.status === 'published' ? 'Publié' :
               publication.status === 'draft' ? 'Brouillon' : 'Programmé'}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{publication.title}</h3>
          <p className="text-sm text-gray-600 truncate">{publication.content}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{publication.author.name}</span>
            <span>{new Date(publication.createdAt).toLocaleDateString('fr-FR')}</span>
            {isPost && (
              <>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {publication.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {publication.comments.length}</span>
              </>
            )}
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {publication.views}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onView(publication)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEdit(publication)}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Edit3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(publication.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {searchTerm ? 'Aucune publication trouvée' : 'Aucune publication'}
    </h3>
    <p className="text-gray-500 max-w-md mx-auto">
      {searchTerm
        ? 'Essayez de modifier vos critères de recherche ou vos filtres.'
        : 'Créez votre première publication en cliquant sur le bouton "Nouvelle publication".'}
    </p>
  </div>
);

export default PublicationsList;
