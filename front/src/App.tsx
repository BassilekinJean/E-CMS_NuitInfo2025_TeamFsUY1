import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './LandingPage';
import { Login } from './components/Login';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { EmailVerification } from './components/EmailVerification';
import { OTPVerification } from './components/OTPVerification';
import { ToastProvider } from './components/ToastProvider';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  TenantHomePage, 
  PublicSitePage,
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

// CMS Components
import { MayorDashboard } from './cms_components/MayorDashboard';
import { DashboardContent } from './cms_components/DashboardContent';
import MayorSchedule from './cms_components/Evenement';
import { Publications } from './cms_components/Publications';
import { Parametres } from './cms_components/Parametres';
import SiteWebEditor from './cms_components/SiteWebEditor';

// Protected Route Component for CMS
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

// Wrapper component for Login with navigation
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Redirect to CMS if already authenticated
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/cms/mayor-dashboard';
    return <Navigate to={from} replace />;
  }
  
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
function TenantRoutes() {
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
        {/* Accueil commune - Site personnalisé par le gérant */}
        <Route path="/" element={<PublicSitePage />} />
        
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
        
        {/* CMS Admin Routes (Protected) */}
        <Route path="/cms/mayor-dashboard" element={
          <ProtectedRoute>
            <MayorDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardContent />} />
          <Route path="publications" element={<Publications />} />
          <Route path="evenements" element={<MayorSchedule />} />
          <Route path="site-web" element={<SiteWebEditor />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>
        
        {/* Auth (partagé) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        
        {/* Fallback → accueil commune */}
        <Route path="*" element={<PublicSitePage />} />
      </Routes>
    );
  }
  
  // Pas un tenant - retourne null pour laisser les routes principales gérer
  return null;
}

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <TenantProvider>
            <AppContent />
          </TenantProvider>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
};

/**
 * Contenu principal de l'application
 * Gère le routage conditionnel basé sur le tenant
 */
function AppContent() {
  const { isTenantSite, isLoading: tenantLoading } = useTenant();
  
  // Si on est sur un tenant, utiliser TenantRoutes
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (isTenantSite) {
    return <TenantRoutes />;
  }
  
  // Routes pour le portail national (sans tenant)
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<OTPVerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/contact" element={<LandingPage />} />
      <Route path="/features" element={<LandingPage />} />
      
      {/* CMS Routes - Mayor Dashboard (Protected) */}
      <Route path="/cms/mayor-dashboard" element={
        <ProtectedRoute>
          <MayorDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardContent />} />
        <Route path="publications" element={<Publications />} />
        <Route path="evenements" element={<MayorSchedule />} />
        <Route path="site-web" element={<SiteWebEditor />} />
        <Route path="parametres" element={<Parametres />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;