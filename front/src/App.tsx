import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './LandingPage';
import { Login } from './components/Login';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { EmailVerification } from './components/EmailVerification';
import { OTPVerification } from './components/OTPVerification';
import { ToastProvider } from './components/ToastProvider';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { AuthProvider } from './contexts/AuthContext';
import { 
  TenantHomePage, 
  ActualitesPage, 
  ActualiteDetailPage,
  EvenementsPage,
  ProjetsPage,
  ProjetDetailPage,
  TransparencePage,
  PageCMSPage,
  ContactPage,
  ServicesPage,
  SuiviDemarchePage,
  SuiviSignalementPage,
  FAQPage,
  SignalementPage
} from './pages';

// Wrapper component for Login with navigation
function LoginPage() {
  const navigate = useNavigate();
  return (
    <Login 
      onForgotPassword={() => navigate('/forgot-password')}
      onBackToHome={() => navigate('/')}
    />
  );
}

// Wrapper component for ForgotPassword with navigation
function ForgotPasswordPage() {
  const navigate = useNavigate();
  return (
    <ForgotPassword 
      onBack={() => navigate('/login')}
      onSubmit={(email) => navigate('/verify-otp', { state: { email } })}
    />
  );
}

// Wrapper component for OTPVerification with navigation
function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || 'user@example.com';
  
  return (
    <OTPVerification 
      email={email}
      onSuccess={() => navigate('/reset-password')}
      onBack={() => navigate('/forgot-password')}
      onResend={() => console.log('Resending OTP to', email)}
    />
  );
}

// Wrapper component for ResetPassword with navigation
function ResetPasswordPage() {
  const navigate = useNavigate();
  return (
    <ResetPassword 
      onSuccess={() => navigate('/login')}
      onBack={() => navigate('/verify-otp')}
    />
  );
}

// Wrapper component for EmailVerification with navigation
function EmailVerificationPage() {
  const navigate = useNavigate();
  return (
    <EmailVerification 
      onSuccess={() => navigate('/login')} 
    />
  );
}

/**
 * Routeur conditionnel basé sur le tenant
 * - Si sous-domaine (ex: yaounde.ecms.cm) → routes du site communal
 * - Sinon (ex: ecms.cm) → portail national (landing page)
 */
function AppRoutes() {
  const { isTenantSite, isLoading } = useTenant();
  
  // Afficher un loader pendant le chargement initial du tenant
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // Routes pour un site communal (tenant)
  if (isTenantSite) {
    return (
      <Routes>
        {/* Accueil commune */}
        <Route path="/" element={<TenantHomePage />} />
        
        {/* Actualités */}
        <Route path="/actualites" element={<ActualitesPage />} />
        <Route path="/actualites/:slug" element={<ActualiteDetailPage />} />
        
        {/* Événements / Agenda */}
        <Route path="/evenements" element={<EvenementsPage />} />
        <Route path="/agenda" element={<EvenementsPage />} />
        
        {/* Projets / Transparence */}
        <Route path="/projets" element={<ProjetsPage />} />
        <Route path="/projets/:slug" element={<ProjetDetailPage />} />
        
        {/* Transparence */}
        <Route path="/transparence" element={<TransparencePage />} />
        <Route path="/documents" element={<TransparencePage />} />
        
        {/* Services & Démarches */}
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/suivi-demarche" element={<SuiviDemarchePage />} />
        <Route path="/signalement" element={<SignalementPage />} />
        <Route path="/suivi-signalement" element={<SuiviSignalementPage />} />
        
        {/* Contact & FAQ */}
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        
        {/* Pages CMS dynamiques */}
        <Route path="/pages/:slug" element={<PageCMSPage />} />
        
        {/* Auth (partagé) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        
        {/* Fallback → accueil commune */}
        <Route path="*" element={<TenantHomePage />} />
      </Routes>
    );
  }
  
  // Routes pour le portail national
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<OTPVerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/contact" element={<LandingPage />} />
      <Route path="/features" element={<LandingPage />} />
      {/* Fallback route */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <TenantProvider>
            <AppRoutes />
          </TenantProvider>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
};

export default App;