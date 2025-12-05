import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { newsletterService } from '../api/services';
import { useTenant } from '../contexts/TenantContext';

type NewsletterFormData = {
  email: string;
  nom?: string;
};

export function NewsletterSubscribe() {
  const { tenant } = useTenant();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewsletterFormData>();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const onSubmit = async (data: NewsletterFormData) => {
    if (!tenant) return;
    
    try {
      setStatus('idle');
      await newsletterService.subscribe({
        ...data,
        commune: tenant.id
      });
      setStatus('success');
      setMessage('Inscription réussie ! Merci de vous être abonné.');
      reset();
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || "Une erreur est survenue lors de l'inscription.");
    }
  };

  if (!tenant) return null;

  return (
    <div className="bg-gray-100 rounded-2xl p-8 md:p-10">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Mail className="w-6 h-6" style={{ color: tenant.couleur_primaire }} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Restez informé</h3>
          </div>
          <p className="text-gray-600">
            Abonnez-vous à la newsletter de {tenant.nom} pour recevoir les dernières actualités, 
            événements et informations municipales directement dans votre boîte mail.
          </p>
        </div>

        <div className="w-full md:w-1/2 lg:w-5/12">
          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700 mb-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {message}
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'} focus:outline-none focus:ring-2 transition`}
                  {...register('email', { 
                    required: 'Email requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email invalide"
                    }
                  })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70 transition shadow-sm hover:shadow"
                style={{ backgroundColor: tenant.couleur_primaire }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'S\'abonner'
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                En vous abonnant, vous acceptez de recevoir nos emails. Vous pourrez vous désinscrire à tout moment.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
