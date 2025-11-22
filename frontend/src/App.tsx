import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import EmailVerificationHandler from './pages/EmailVerificationHandler';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Router>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email-pending" element={<VerifyEmailPage />} />
            <Route path="/verify-email" element={<EmailVerificationHandler />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* App routes (with layout) */}
            <Route element={<AppLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/explore" element={<PlaceholderPage title="Explore" />} />
              <Route path="/reels" element={<PlaceholderPage title="Reels" />} />
              <Route path="/messages" element={<PlaceholderPage title="Messages" />} />
              <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Temporary placeholder component
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">{title} page coming soon...</p>
      </div>
    </div>
  );
}

export default App;
