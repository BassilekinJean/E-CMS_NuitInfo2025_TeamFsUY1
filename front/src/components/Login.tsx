import { useState } from 'react';
import { Building2, Lock, Mail, Eye, EyeOff, Shield, Users, Globe, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { useToast } from './ToastProvider';

interface LoginProps {
  onForgotPassword?: () => void;
  onBackToHome?: () => void;
}

export function Login({ onForgotPassword, onBackToHome }: LoginProps) {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Champs requis', 'Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success/failure
    if (formData.email === 'admin@mairie.cm' && formData.password === 'admin123') {
      toast.success('Connexion réussie', 'Bienvenue sur CameroonCMS !');
    } else {
      toast.error('Échec de connexion', 'Email ou mot de passe incorrect');
    }
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const features = [
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Connexion cryptée SSL'
    },
    {
      icon: Users,
      title: 'Multi-utilisateurs',
      description: 'Gestion des rôles et permissions'
    },
    {
      icon: Globe,
      title: 'Accessible',
      description: 'De n\'importe où, à tout moment'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex relative overflow-hidden">
      {/* Professional Background - Subtle geometric patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-100 to-transparent rounded-full opacity-60"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-yellow-100 to-transparent rounded-full opacity-60"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-green-50 to-transparent rounded-full opacity-40"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Back to Home Button - Top Left */}
      {onBackToHome && (
        <button
          onClick={onBackToHome}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
        >
          <div className="p-2 rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="font-medium flex items-center gap-1">
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </span>
        </button>
      )}

      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            {/* Logo and Header */}
            <div className="text-center">
              <a href="/" className="inline-flex items-center gap-3 mb-8 group">
                <div className="bg-gradient-to-br from-green-600 to-yellow-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-xl font-bold text-gray-900">CameroonCMS</span>
                  <span className="block text-gray-500 text-sm">Espace Administrateur</span>
                </div>
              </a>
            <div className="space-y-2">
              <h1 className="text-gray-900">
                Bienvenue
              </h1>
              <p className="text-gray-600">
                Connectez-vous pour gérer votre site municipal
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Adresse Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="admin@mairie.cm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Mot de Passe
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <span className="ml-2 text-gray-700 group-hover:text-gray-900 transition-colors">
                    Se souvenir de moi
                  </span>
                </label>
                <button 
                  type="button"
                  onClick={onForgotPassword}
                  className="text-green-600 hover:text-green-700 transition-colors"
                >
                  Mot de passe oublié?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-3.5 px-6 rounded-xl hover:from-green-700 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    Se Connecter
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Pas encore de compte?{' '}
                <a href="#contact" className="text-green-600 hover:text-green-700 transition-colors">
                  Demander une démo gratuite
                </a>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Connexion sécurisée SSL 256-bit</span>
            </div>
            <p className="text-gray-600">
              Besoin d'aide?{' '}
              <a href="mailto:support@camerooncms.cm" className="text-green-600 hover:text-green-700 transition-colors">
                Contactez le support
              </a>
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Right Side - Image with Cameroon Flag Colors Overlay (Hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Modern African City Hall"
            className="w-full h-full object-cover"
          />
          {/* Cameroon Flag Colors Overlay - Three vertical stripes */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-green-600/70"></div>
            <div className="flex-1 bg-red-600/70"></div>
            <div className="flex-1 bg-yellow-500/70"></div>
          </div>
          {/* Additional gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
        </div>

        {/* Star in the center (like Cameroon flag) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg 
            className="w-64 h-64 text-yellow-400/30" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 p-12 flex items-center justify-center">
          <div className="max-w-lg text-white space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Gérez votre Mairie en toute simplicité
              </h2>
              <p className="text-lg text-white/90">
                Accédez à votre tableau de bord pour publier des actualités, gérer les événements, 
                et communiquer efficacement avec vos citoyens.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 bg-white/15 backdrop-blur-md p-4 rounded-xl border border-white/30 hover:bg-white/25 transition-all"
                >
                  <div className="bg-white/25 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">{feature.title}</div>
                    <p className="text-white/80">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">50+</div>
                <p className="text-white/80">Mairies</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">99.9%</div>
                <p className="text-white/80">Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <p className="text-white/80">Support</p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/15 backdrop-blur-md p-6 rounded-xl border border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/25 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">Marie Kouadio</div>
                  <p className="text-white/80">Secrétaire Générale</p>
                </div>
              </div>
              <p className="text-white/90 italic">
                "CameroonCMS a transformé notre communication avec les citoyens. 
                Interface simple et efficace!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}