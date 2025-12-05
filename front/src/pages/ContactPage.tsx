import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { contactService } from '../api/services';
import { Link } from 'react-router-dom';

type ContactFormData = {
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
};

export function ContactPage() {
  const { tenant } = useTenant();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: ContactFormData) => {
    if (!tenant) return;
    
    try {
      setSubmitStatus('idle');
      setErrorMessage(null);
      
      await contactService.envoyer({
        ...data,
        commune: tenant.id
      });
      
      setSubmitStatus('success');
      reset();
    } catch (error: any) {
      console.error(error);
      setSubmitStatus('error');
      setErrorMessage(error.message || "Une erreur est survenue lors de l'envoi du message.");
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Contactez-nous</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vous avez une question, une suggestion ou une demande particulière ? 
              N'hésitez pas à nous contacter via le formulaire ci-dessous ou par nos coordonnées directes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Coordonnées */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Nos coordonnées</h2>
                
                <div className="space-y-6">
                  {tenant.adresse && (
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: tenant.couleur_primaire + '20', color: tenant.couleur_primaire }}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Adresse</h3>
                        <p className="text-gray-600 text-sm mt-1">{tenant.adresse}</p>
                      </div>
                    </div>
                  )}

                  {tenant.telephone && (
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: tenant.couleur_primaire + '20', color: tenant.couleur_primaire }}
                      >
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Téléphone</h3>
                        <p className="text-gray-600 text-sm mt-1">{tenant.telephone}</p>
                      </div>
                    </div>
                  )}

                  {tenant.email && (
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: tenant.couleur_primaire + '20', color: tenant.couleur_primaire }}
                      >
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Email</h3>
                        <p className="text-gray-600 text-sm mt-1">{tenant.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {tenant.horaires_ouverture && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-4">Horaires d'ouverture</h3>
                    <div className="space-y-2">
                      {Object.entries(tenant.horaires_ouverture).map(([jour, horaire]) => (
                        <div key={jour} className="flex justify-between text-sm">
                          <span className="text-gray-500">{jour}</span>
                          <span className="text-gray-800 font-medium">{horaire as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Formulaire */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Envoyez-nous un message</h2>

                {submitStatus === 'success' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Message envoyé !</h3>
                    <p className="text-green-700 mb-6">
                      Merci de nous avoir contactés. Votre message a bien été reçu et sera traité dans les plus brefs délais.
                    </p>
                    <button 
                      onClick={() => setSubmitStatus('idle')}
                      className="text-green-700 font-medium hover:underline"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {submitStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-red-800">Erreur d'envoi</h3>
                          <p className="text-red-700 text-sm mt-1">
                            {errorMessage || "Une erreur est survenue. Veuillez réessayer plus tard."}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="nom"
                          type="text"
                          className={`w-full px-4 py-2 rounded-lg border ${errors.nom ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'} focus:outline-none focus:ring-2 transition`}
                          placeholder="Votre nom"
                          {...register('nom', { required: 'Ce champ est requis' })}
                        />
                        {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'} focus:outline-none focus:ring-2 transition`}
                          placeholder="votre@email.com"
                          {...register('email', { 
                            required: 'Ce champ est requis',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Adresse email invalide"
                            }
                          })}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          id="telephone"
                          type="tel"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                          placeholder="+237 6XX XX XX XX"
                          {...register('telephone')}
                        />
                      </div>

                      <div>
                        <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-1">
                          Sujet <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="sujet"
                          type="text"
                          className={`w-full px-4 py-2 rounded-lg border ${errors.sujet ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'} focus:outline-none focus:ring-2 transition`}
                          placeholder="Objet de votre message"
                          {...register('sujet', { required: 'Ce champ est requis' })}
                        />
                        {errors.sujet && <p className="text-red-500 text-xs mt-1">{errors.sujet.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={6}
                        className={`w-full px-4 py-2 rounded-lg border ${errors.message ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'} focus:outline-none focus:ring-2 transition resize-none`}
                        placeholder="Votre message..."
                        {...register('message', { required: 'Ce champ est requis' })}
                      ></textarea>
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-sm hover:shadow"
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
                            Envoyer le message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ContactPage;
