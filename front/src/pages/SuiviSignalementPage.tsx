import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, AlertTriangle, CheckCircle, Clock, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { signalementService } from '../api/services';
import { Link } from 'react-router-dom';

type SuiviFormData = {
  numero: string;
};

type SignalementResult = {
  numero_suivi: string;
  titre: string;
  categorie: string;
  categorie_display: string;
  statut: string;
  statut_display: string;
  date_signalement: string;
  date_resolution: string | null;
  commune_nom: string;
  adresse: string;
  commentaire_resolution: string;
};

export function SuiviSignalementPage() {
  const { tenant } = useTenant();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SuiviFormData>();
  const [result, setResult] = useState<SignalementResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: SuiviFormData) => {
    try {
      setError(null);
      setResult(null);
      const response = await signalementService.suivi(data.numero);
      setResult(response as SignalementResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de trouver ce signalement. Vérifiez le numéro.");
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
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Suivi de signalement</h1>
            <p className="text-gray-600">
              Entrez votre numéro de suivi pour consulter l'état de traitement de votre signalement.
            </p>
          </div>

          {/* Formulaire de recherche */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="numero" className="sr-only">Numéro de suivi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="numero"
                    type="text"
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.numero ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'} rounded-lg focus:outline-none focus:ring-2 transition`}
                    placeholder="Ex: SIG-2025-XXXX"
                    {...register('numero', { required: 'Le numéro de suivi est requis' })}
                  />
                </div>
                {errors.numero && <p className="text-red-500 text-xs mt-1 ml-1">{errors.numero.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70 transition shadow-sm hover:shadow"
                style={{ backgroundColor: tenant.couleur_primaire }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Rechercher
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8 animate-in fade-in slide-in-from-top-4">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-800 mb-1">Signalement introuvable</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Résultats */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-8">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Signalement N°</div>
                  <div className="text-xl font-mono font-bold text-gray-800">{result.numero_suivi}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Statut</div>
                    <div className={`font-semibold px-3 py-1 rounded-full text-sm inline-block
                      ${result.statut === 'resolu' ? 'bg-green-100 text-green-700' : 
                        result.statut === 'rejete' ? 'bg-red-100 text-red-700' : 
                        result.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'}`}
                    >
                      {result.statut_display}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{result.titre}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      {result.categorie_display}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <Clock className="w-4 h-4" />
                      {new Date(result.date_signalement).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <MapPin className="w-4 h-4" />
                      {result.adresse}
                    </span>
                  </div>
                </div>

                {/* État d'avancement */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                  <h4 className="font-medium text-gray-800 mb-4">État du traitement</h4>
                  
                  {result.statut === 'resolu' ? (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-800">Problème résolu</h5>
                        <p className="text-green-700 text-sm mt-1">
                          Ce signalement a été traité le {result.date_resolution && new Date(result.date_resolution).toLocaleDateString('fr-FR')}.
                        </p>
                        {result.commentaire_resolution && (
                          <div className="mt-3 bg-white p-3 rounded border border-green-200 text-sm text-gray-600 italic">
                            "{result.commentaire_resolution}"
                          </div>
                        )}
                      </div>
                    </div>
                  ) : result.statut === 'en_cours' ? (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-blue-800">Traitement en cours</h5>
                        <p className="text-blue-700 text-sm mt-1">
                          Nos services sont en train de traiter votre signalement.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">En attente de prise en charge</h5>
                        <p className="text-gray-600 text-sm mt-1">
                          Votre signalement a été reçu et sera bientôt traité.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SuiviSignalementPage;
