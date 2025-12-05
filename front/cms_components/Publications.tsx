// cms_components/Publications.tsx - Gestion des publications responsive
import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  X,
  Search,
  FileText,
  Image,
  Eye,
  Heart,
  MessageSquare,
  Edit,
  Trash2,
  Menu,
  Loader2,
  Check,
  Upload,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

interface DashboardContextType {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

// Types
interface Publication {
  id: string;
  type: 'post' | 'communique';
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  author: string;
  createdAt: string;
  publishedAt?: string;
  image?: string;
  views: number;
  likes: number;
  comments: number;
}

interface PublicationFormData {
  type: 'post' | 'communique';
  title: string;
  content: string;
  category: string;
  image?: string;
  status: 'draft' | 'published';
}

const categories = [
  { value: 'actualites', label: 'Actualités' },
  { value: 'evenements', label: 'Événements' },
  { value: 'services', label: 'Services' },
  { value: 'annonces', label: 'Annonces' },
  { value: 'culture', label: 'Culture' },
];

const defaultFormData: PublicationFormData = {
  type: 'post',
  title: '',
  content: '',
  category: 'actualites',
  image: undefined,
  status: 'draft',
};

// Publication Card Component
const PublicationCard = ({ 
  publication, 
  onEdit, 
  onDelete,
  onView
}: { 
  publication: Publication; 
  onEdit: () => void; 
  onDelete: () => void;
  onView: () => void;
}) => {
  const category = categories.find(c => c.value === publication.category);
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group animate-fadeIn">
      {/* Image */}
      {publication.image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={publication.image} 
            alt={publication.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              publication.type === 'communique' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {publication.type === 'communique' ? 'Communiqué' : 'Post'}
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              {category?.label}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            publication.status === 'published' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {publication.status === 'published' ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        
        <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{publication.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{publication.content}</p>
        
        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{publication.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(publication.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-500 pb-4 border-b border-slate-100">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {publication.views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {publication.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {publication.comments}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Voir
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Publication Form Modal
const PublicationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isEditing 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: PublicationFormData) => void;
  initialData?: PublicationFormData;
  isEditing: boolean;
}) => {
  const [formData, setFormData] = useState<PublicationFormData>(initialData || defaultFormData);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(initialData || defaultFormData);
  }, [initialData, isOpen]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setUploading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/upload', { method: 'POST', body: formData });
      // const data = await response.json();
      // setFormData(prev => ({ ...prev, image: data.url }));
      
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(formData);
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl animate-modalIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-lg font-bold text-slate-800">
            {isEditing ? 'Modifier la publication' : 'Nouvelle publication'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'post', label: 'Post', icon: FileText },
              { value: 'communique', label: 'Communiqué', icon: Calendar },
            ].map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as 'post' | 'communique' })}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <type.icon className="w-5 h-5" />
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Titre</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Titre de la publication"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Image de couverture</label>
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-all ${
                formData.image ? 'p-2' : 'p-6'
              } ${uploading ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              {formData.image ? (
                <div className="relative aspect-video rounded-xl overflow-hidden group">
                  <img 
                    src={formData.image} 
                    alt="Couverture" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-slate-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: undefined })}
                      className="p-2 bg-white rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  {uploading ? (
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  ) : (
                    <>
                      <Image className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="text-sm text-slate-600 font-medium">
                        Glissez une image ici ou
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Parcourir
                      </button>
                    </>
                  )}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Contenu</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
              placeholder="Rédigez votre contenu ici..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {isEditing ? 'Mettre à jour' : 'Publier'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
export const Publications = () => {
  const { setIsSidebarOpen } = useOutletContext<DashboardContextType>();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Charger les publications depuis le backend
  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      try {
        // TODO: Remplacer par l'appel API réel
        // const response = await fetch('/api/publications');
        // const data = await response.json();
        // setPublications(data);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setPublications([]);
      } catch (error) {
        console.error('Erreur chargement publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Filtrer les publications
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || pub.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || pub.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreatePublication = async (data: PublicationFormData) => {
    // TODO: Appel API pour créer
    const newPub: Publication = {
      id: Date.now().toString(),
      ...data,
      author: 'Maire',
      createdAt: new Date().toISOString(),
      publishedAt: data.status === 'published' ? new Date().toISOString() : undefined,
      views: 0,
      likes: 0,
      comments: 0,
    };
    
    setPublications([newPub, ...publications]);
    setShowModal(false);
  };

  const handleUpdatePublication = async (data: PublicationFormData) => {
    if (!editingPublication) return;
    
    setPublications(publications.map(p => 
      p.id === editingPublication.id ? { ...p, ...data } : p
    ));
    setEditingPublication(null);
    setShowModal(false);
  };

  const handleDeletePublication = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) return;
    setPublications(publications.filter(p => p.id !== id));
  };

  const openEditModal = (pub: Publication) => {
    setEditingPublication(pub);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Publications
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Gérez vos actualités et communiqués</p>
              </div>
            </div>
            
            <button
              onClick={() => { setEditingPublication(null); setShowModal(true); }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle publication</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="px-4 sm:px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          >
            <option value="all">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          >
            <option value="all">Tous statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-4 text-slate-500">Chargement des publications...</p>
          </div>
        ) : filteredPublications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredPublications.map(pub => (
              <PublicationCard
                key={pub.id}
                publication={pub}
                onEdit={() => openEditModal(pub)}
                onDelete={() => handleDeletePublication(pub.id)}
                onView={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-100">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucune publication</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Aucune publication ne correspond à votre recherche'
                : 'Commencez par créer votre première publication'
              }
            </p>
            <button
              onClick={() => { setEditingPublication(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Créer une publication
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      <PublicationModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingPublication(null); }}
        onSubmit={editingPublication ? handleUpdatePublication : handleCreatePublication}
        initialData={editingPublication ? {
          type: editingPublication.type,
          title: editingPublication.title,
          content: editingPublication.content,
          category: editingPublication.category,
          image: editingPublication.image,
          status: editingPublication.status,
        } : undefined}
        isEditing={!!editingPublication}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-modalIn {
          animation: modalIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Publications;
