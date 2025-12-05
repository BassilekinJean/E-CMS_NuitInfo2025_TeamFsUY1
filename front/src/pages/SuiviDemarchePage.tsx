import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, FileText, CheckCircle, Clock, XCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import api from '../api/client';
import { Link } from 'react-router-dom';

type SuiviFormData = {
  numero: string;
};

type EtapeDemarche = {
  numero: number;
  titre: string;
  date: string | null;
  complete: boolean;
};

type DemarcheResult = {
  numero_suivi: string;
  type: string;
  statut: string;
  statut_display: string;
  date_demande: string;
  date_prise_en_charge: string | null;
  date_traitement: string | null;
  commune_nom: string;
  progression: number;
  etapes: EtapeDemarche[];
};

export function SuiviDemarchePage() {
  const { tenant } = useTenant();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SuiviFormData>();
  const [result, setResult] = useState<DemarcheResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: SuiviFormData) => {
    try {
      setError(null);
      setResult(null);
      const response = await api.get<DemarcheResult>(`/suivi/demarche/${data.numero}/`);
      setResult(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de trouver cette démarche. Vérifiez le numéro.");
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
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Suivi de démarche</h1>
            <p className="text-gray-600">
              Entrez votre numéro de suivi pour consulter l'état d'avancement de votre dossier.
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
                    placeholder="Ex: DEM-2025-XXXX"
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
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-800 mb-1">Démarche introuvable</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Résultats */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-8">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Dossier N°</div>
                  <div className="text-xl font-mono font-bold text-gray-800">{result.numero_suivi}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Statut</div>
                    <div className={`font-semibold px-3 py-1 rounded-full text-sm inline-block
                      ${result.statut === 'validee' || result.statut === 'completee' ? 'bg-green-100 text-green-700' : 
                        result.statut === 'rejetee' || result.statut === 'annulee' ? 'bg-red-100 text-red-700' : 
                        'bg-blue-100 text-blue-700'}`}
                    >
                      {result.statut_display}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{result.type}</h3>
                  <p className="text-gray-500 text-sm">
                    Demande effectuée le {new Date(result.date_demande).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Ligne verticale */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-8 relative">
                    {result.etapes.map((etape, index) => (
                      <div key={index} className="flex gap-6">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 
                          ${etape.complete ? 'bg-green-500 border-green-500 text-white' : 
                            index === 0 || result.etapes[index-1]?.complete ? 'bg-white border-blue-500 text-blue-500' : 
                            'bg-white border-gray-300 text-gray-300'}`}
                        >
                          {etape.complete ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-bold">{etape.numero}</span>
                          )}
                        </div>
                        <div className="pt-1">
                          <h4 className={`font-medium ${etape.complete ? 'text-gray-800' : 'text-gray-500'}`}>
                            {etape.titre}
                          </h4>
                          {etape.date && (
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(etape.date).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SuiviDemarchePage;
