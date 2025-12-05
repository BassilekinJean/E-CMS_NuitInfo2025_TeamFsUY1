import { useState, useEffect, useRef } from 'react';
import { Mail, RefreshCw, CheckCircle, Clock, ArrowLeft, Shield } from 'lucide-react';
import { useToast } from './ToastProvider';

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  onResend: () => void;
}

export function OTPVerification({ email, onSuccess, onBack, onResend }: OTPVerificationProps) {
  const toast = useToast();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isExpired) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isExpired]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer color based on time left
  const getTimerColor = () => {
    if (timeLeft > 60) return 'text-green-600';
    if (timeLeft > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get progress percentage
  const getProgress = () => {
    return (timeLeft / 120) * 100;
  };

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle key down for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  // Verify OTP
  const handleVerify = async (code: string) => {
    if (isExpired) {
      setError('Le code a expiré. Veuillez demander un nouveau code.');
      toast.error('Code expiré', 'Veuillez demander un nouveau code');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Simulate API verification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo: accept any 6-digit code (in production, verify with backend)
    if (code.length === 6) {
      toast.success('Vérification réussie !', 'Vous allez être redirigé...');
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      toast.error('Code incorrect', 'Veuillez réessayer');
      setError('Code incorrect. Veuillez réessayer.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }

    setIsVerifying(false);
  };

  // Resend OTP
  const handleResend = async () => {
    setIsResending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTimeLeft(120);
    setIsExpired(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    onResend();
    setIsResending(false);
    toast.info('Code renvoyé', 'Un nouveau code a été envoyé à votre email');
    inputRefs.current[0]?.focus();
  };

  // Mask email for display
  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
      return `${username[0]}***@${domain}`;
    }
    return `${username.slice(0, 3)}***@${domain}`;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50 p-4 relative overflow-hidden">
        {/* Professional Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-100 to-transparent rounded-full opacity-60"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-yellow-100 to-transparent rounded-full opacity-60"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vérification réussie !</h2>
            <p className="text-gray-600 mb-4">
              Votre email a été vérifié avec succès. Vous allez être redirigé...
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
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
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
      >
        <div className="p-2 rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow">
          <ArrowLeft className="h-5 w-5" />
        </div>
        <span className="font-medium">Retour</span>
      </button>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification OTP</h2>
            <p className="text-gray-600">
              Nous avons envoyé un code de vérification à
            </p>
            <p className="text-green-600 font-semibold mt-1">{maskEmail(email)}</p>
          </div>

          {/* Timer Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke={timeLeft > 60 ? '#22c55e' : timeLeft > 30 ? '#eab308' : '#ef4444'}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - getProgress() / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Clock className={`h-5 w-5 mx-auto mb-1 ${getTimerColor()}`} />
                  <span className={`text-xl font-bold ${getTimerColor()}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying || isExpired}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
                  ${digit ? 'border-green-500 bg-green-50' : 'border-gray-300'}
                  ${isExpired ? 'bg-gray-100 text-gray-400' : 'focus:border-green-500 focus:ring-4 focus:ring-green-100'}
                  ${error ? 'border-red-500 bg-red-50' : ''}
                `}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerify(otp.join(''))}
            disabled={otp.some((d) => !d) || isVerifying || isExpired}
            className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-4 rounded-xl hover:from-green-700 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Vérification...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Vérifier le code
              </>
            )}
          </button>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            {isExpired ? (
              <div className="space-y-3">
                <p className="text-red-600 font-medium">Le code a expiré</p>
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  {isResending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Renvoyer un nouveau code
                    </>
                  )}
                </button>
              </div>
            ) : (
              <p className="text-gray-600">
                Vous n'avez pas reçu le code ?{' '}
                <button
                  onClick={handleResend}
                  disabled={isResending || timeLeft > 90}
                  className={`font-semibold transition-colors ${
                    timeLeft > 90
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {isResending ? 'Envoi...' : timeLeft > 90 ? `Renvoyer dans ${timeLeft - 90}s` : 'Renvoyer'}
                </button>
              </p>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl border border-green-200">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Pour votre sécurité, ne partagez jamais ce code avec personne. 
                Notre équipe ne vous demandera jamais votre code OTP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
