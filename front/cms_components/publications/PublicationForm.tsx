// cms_components/publications/PublicationForm.tsx
import { useState, useRef, useCallback } from 'react';
import {
  X,
  Image,
  Video,
  Upload,
  Calendar,
  Tag,
  FileText,
  Megaphone,
  Eye,
  Save,
  Send,
  Trash2,
  Plus,
  AlertCircle
} from 'lucide-react';
import type { 
  PublicationFormData, 
  PublicationType 
} from '../types/publications';
import { CATEGORIES, DEFAULT_FORM_DATA } from '../types/publications';

interface PublicationFormProps {
  onSubmit: (data: PublicationFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PublicationFormData>;
  isEditing?: boolean;
}

export const PublicationForm = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  isEditing = false 
}: PublicationFormProps) => {
  const [formData, setFormData] = useState<PublicationFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (type: PublicationType) => {
    setFormData(prev => ({
      ...prev,
      type,
      commentsEnabled: type === 'post' // Désactiver les commentaires pour les communiqués
    }));
  };

  const handleMediaUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const newMedia: { file: File; preview: string; type: 'image' | 'video' }[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        newMedia.push({
          file,
          preview: URL.createObjectURL(file),
          type: 'image'
        });
      } else if (file.type.startsWith('video/')) {
        newMedia.push({
          file,
          preview: URL.createObjectURL(file),
          type: 'video'
        });
      }
    });

    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia.map(m => m.file)],
      mediaPreview: [...prev.mediaPreview, ...newMedia]
    }));
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleMediaUpload(e.dataTransfer.files);
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
      mediaPreview: prev.mediaPreview.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est requis';
    }
    if (formData.status === 'scheduled' && !formData.scheduledAt) {
      newErrors.scheduledAt = 'La date de programmation est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (status: 'draft' | 'published' | 'scheduled') => {
    const dataToSubmit = { ...formData, status };
    if (validate()) {
      onSubmit(dataToSubmit);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? 'Modifier la publication' : 'Nouvelle publication'}
            </h2>
            <p className="text-blue-100 mt-1">
              Créez un {formData.type === 'post' ? 'post' : 'communiqué'} pour votre mairie
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Type de publication */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Type de publication
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleTypeChange('post')}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                formData.type === 'post'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <FileText className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Post</div>
                <div className="text-xs opacity-70">Avec likes et commentaires</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('communique')}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                formData.type === 'communique'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Megaphone className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Communiqué</div>
                <div className="text-xs opacity-70">Lecture seule, officiel</div>
              </div>
            </button>
          </div>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Entrez le titre de votre publication..."
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Contenu */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contenu <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Rédigez le contenu de votre publication..."
            rows={8}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.content ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.content}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.content.length} caractères
          </p>
        </div>

        {/* Upload de médias */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Médias (images ou vidéos)
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleMediaUpload(e.target.files)}
              className="hidden"
            />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ou cliquez pour sélectionner
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Image className="h-4 w-4" /> Images
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Video className="h-4 w-4" /> Vidéos
              </span>
            </div>
          </div>

          {/* Aperçu des médias */}
          {formData.mediaPreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.mediaPreview.map((media, index) => (
                <div key={index} className="relative group">
                  {media.type === 'image' ? (
                    <img
                      src={media.preview}
                      alt={`Média ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={media.preview}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    {media.type === 'image' ? 'Image' : 'Vidéo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Catégorie et Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Ajouter un tag..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Programmation */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Calendar className="h-4 w-4" />
            Programmer la publication
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.status !== 'scheduled'}
                onChange={() => setFormData(prev => ({ ...prev, status: 'draft', scheduledAt: undefined }))}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-600">Publication immédiate</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.status === 'scheduled'}
                onChange={() => setFormData(prev => ({ ...prev, status: 'scheduled' }))}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-600">Programmer</span>
            </label>
          </div>
          {formData.status === 'scheduled' && (
            <input
              type="datetime-local"
              value={formData.scheduledAt?.toISOString().slice(0, 16) || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                scheduledAt: e.target.value ? new Date(e.target.value) : undefined 
              }))}
              className={`mt-3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.scheduledAt ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          )}
        </div>

        {/* Options pour les posts */}
        {formData.type === 'post' && (
          <div className="bg-blue-50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.commentsEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, commentsEnabled: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Autoriser les commentaires</span>
                <p className="text-sm text-gray-600">Les visiteurs pourront commenter ce post</p>
              </div>
            </label>
          </div>
        )}

        {/* Info communiqué */}
        {formData.type === 'communique' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <Megaphone className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">Communiqué officiel</p>
              <p className="text-sm text-orange-700">
                Les communiqués sont en lecture seule. Les visiteurs ne peuvent pas liker ni commenter.
                Ils sont marqués comme officiels sur le site de la mairie.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer avec actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
          >
            Annuler
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              <Save className="h-5 w-5" />
              Brouillon
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              <Eye className="h-5 w-5" />
              Aperçu
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(formData.status === 'scheduled' ? 'scheduled' : 'published')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                formData.type === 'post'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {formData.status === 'scheduled' ? (
                <>
                  <Calendar className="h-5 w-5" />
                  Programmer
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Publier
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationForm;
