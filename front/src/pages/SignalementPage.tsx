import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertTriangle, MapPin, Camera, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import api from '../api/client';
import { Link } from 'react-router-dom';

type SignalementFormData = {
  titre: string;
  categorie: string;
  description: string;
  adresse: string;
  nom_signaleur?: string;
  email_signaleur?: string;
  telephone_signaleur?: string;
};

export function SignalementPage() {
  const { tenant } = useTenant();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SignalementFormData>();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [numeroSuivi, setNumeroSuivi] = useState<string | null>(null);

  const onSubmit = async (data: SignalementFormData) => {
    if (!tenant) return;
    
    try {
      setSubmitStatus('idle');
      const response = await api.signalements.create({
        ...data,
        commune: tenant.id
      });
      
      setNumeroSuivi(response.numero_suivi || null);
      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    }
  };

  if (!tenant) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              {tenant.logo && (
                <img src={tenant.logo} alt={tenant.nom} className="w-10 h-10 rounded-full object-cover" />
              )}
              <span className="font-bold text-xl text-gray-800">{tenant.nom}</span>
            </Link>
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-800">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Signaler un problème</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Aidez-nous à améliorer notre commune en signalant les problèmes que vous rencontrez 
              (voirie, éclairage, propreté, etc.).
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Signalement enregistré !</h2>
                <p className="text-gray-600 mb-6">
                  Merci pour votre contribution citoyenne. Votre signalement a bien été pris en compte.
                </p>
                
                {numeroSuivi && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-sm mx-auto mb-8">
                    <p className="text-sm text-gray-500 mb-1">Votre numéro de suivi :</p>
                    <p className="text-xl font-mono font-bold text-gray-800 select-all">{numeroSuivi}</p>
                    <p className="text-xs text-gray-400 mt-2">Conservez ce numéro pour suivre l'avancement.</p>
                  </div>
                )}
                
                <div className="flex justify-center gap-4">
                  <Link 
                    to="/suivi-signalement" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Suivre mon signalement
                  </Link>
                  <button 
                    onClick={() => setSubmitStatus('idle')}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Faire un autre signalement
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    Une erreur est survenue lors de l'envoi du signalement. Veuillez réessayer.
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                      Titre du signalement <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="titre"
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                      placeholder="Ex: Nid de poule rue de la République"
                      {...register('titre', { required: 'Ce champ est requis' })}
                    />
                    {errors.titre && <p className="text-red-500 text-xs mt-1">{errors.titre.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="categorie"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition bg-white"
                      {...register('categorie', { required: 'Ce champ est requis' })}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      <option value="voirie">Voirie / Route</option>
                      <option value="eclairage">Éclairage public</option>
                      <option value="proprete">Propreté / Déchets</option>
                      <option value="espaces_verts">Espaces verts</option>
                      <option value="securite">Sécurité</option>
                      <option value="autre">Autre</option>
                    </select>
                    {errors.categorie && <p className="text-red-500 text-xs mt-1">{errors.categorie.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                      Localisation <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="adresse"
                        type="text"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                        placeholder="Adresse ou lieu-dit"
                        {...register('adresse', { required: 'Ce champ est requis' })}
                      />
                    </div>
                    {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description détaillée
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition resize-none"
                    placeholder="Décrivez le problème le plus précisément possible..."
                    {...register('description')}
                  ></textarea>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Vos coordonnées (optionnel)</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Renseignez vos coordonnées si vous souhaitez être tenu informé de l'avancement.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nom_signaleur" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet
                      </label>
                      <input
                        id="nom_signaleur"
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                        {...register('nom_signaleur')}
                      />
                    </div>
                    <div>
                      <label htmlFor="email_signaleur" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="email_signaleur"
                        type="email"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                        {...register('email_signaleur')}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-70 transition shadow-sm hover:shadow"
                    style={{ backgroundColor: tenant.couleur_primaire }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer le signalement
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SignalementPage;
