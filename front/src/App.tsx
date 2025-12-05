import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './LandingPage';
import { Login } from './components/Login';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { EmailVerification } from './components/EmailVerification';
import { OTPVerification } from './components/OTPVerification';
import { ToastProvider } from './components/ToastProvider';

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

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
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
      </Router>
    </ToastProvider>
  );
};

export default App;