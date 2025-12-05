import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from './ToastProvider';

interface ResetPasswordProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export function ResetPassword({ onSuccess, onBack }: ResetPasswordProps) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[a-z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/[0-9]/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { password?: string; confirmPassword?: string } = {};

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Erreur de validation', 'Veuillez corriger les erreurs');
      return;
    }

    toast.success('Mot de passe réinitialisé !', 'Vous pouvez maintenant vous connecter');
    // Simulate password reset
    setIsSubmitted(true);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['bg-gray-300', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50 p-4 relative overflow-hidden">
        {/* Professional Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-100 to-transparent rounded-full opacity-60"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-yellow-100 to-transparent rounded-full opacity-60"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mot de passe réinitialisé !</h2>
            <p className="text-gray-600 mb-8">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <button
              onClick={onSuccess}
              className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Back Button - Top Left */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
        >
          <div className="p-2 rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="font-medium">Retour</span>
        </button>
      )}

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-gray-900 mb-2">Nouveau mot de passe</h2>
            <p className="text-gray-600">
              Créez un nouveau mot de passe sécurisé pour votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({});
                  }}
                  className={`w-full pl-12 pr-12 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Force : <span className={passwordStrength >= 4 ? 'text-green-600' : 'text-gray-600'}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </p>
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                <p className={`text-sm flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`h-4 w-4 ${password.length >= 8 ? '' : 'opacity-30'}`} />
                  Au moins 8 caractères
                </p>
                <p className={`text-sm flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`h-4 w-4 ${/[A-Z]/.test(password) ? '' : 'opacity-30'}`} />
                  Une majuscule
                </p>
                <p className={`text-sm flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`h-4 w-4 ${/[a-z]/.test(password) ? '' : 'opacity-30'}`} />
                  Une minuscule
                </p>
                <p className={`text-sm flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`h-4 w-4 ${/[0-9]/.test(password) ? '' : 'opacity-30'}`} />
                  Un chiffre
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({});
                  }}
                  className={`w-full pl-12 pr-12 py-3 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Réinitialiser le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
