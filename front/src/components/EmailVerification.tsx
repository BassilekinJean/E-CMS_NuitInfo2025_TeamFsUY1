import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function EmailVerification({ token, onSuccess }: { token?: string; onSuccess: () => void }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Simulate email verification
    const timer = setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      // In production, this would verify the token with your backend
      setStatus('success');
    }, 2000);

    return () => clearTimeout(timer);
  }, [token]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      onSuccess();
    }
  }, [status, countdown, onSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50 p-4 relative overflow-hidden">
      {/* Professional Background - Subtle geometric patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-100 to-transparent rounded-full opacity-60"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-yellow-100 to-transparent rounded-full opacity-60"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vérification en cours...</h2>
              <p className="text-gray-600">
                Nous vérifions votre adresse email. Veuillez patienter.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Email vérifié !</h2>
              <p className="text-gray-600 mb-8">
                Votre adresse email a été vérifiée avec succès. Vous allez être redirigé dans <strong>{countdown}</strong> secondes.
              </p>
              <button
                onClick={onSuccess}
                className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Continuer maintenant
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de vérification</h2>
              <p className="text-gray-600 mb-8">
                Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien.
              </p>
              <button
                onClick={() => window.location.href = '#login'}
                className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Retour à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
