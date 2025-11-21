import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export default function EmailVerificationHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent double verification in React StrictMode
      if (hasVerified.current) return;
      hasVerified.current = true;

      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await api.get(`/api/auth/verify-email?token=${token}`);
        
        // Auto-login the user with the returned tokens
        const { user, accessToken, refreshToken } = response.data;
        setAuth(user, accessToken, refreshToken);
        
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Redirect to homepage after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.error?.message || 'Verification failed. The link may be expired.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-blue-50 to-purple-50'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div
          className={`rounded-2xl shadow-xl p-8 text-center ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {status === 'loading' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="flex justify-center mb-6"
              >
                <Loader2 className="w-20 h-20 text-blue-500" />
              </motion.div>
              <h1
                className={`text-2xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Verifying your email...
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <CheckCircle className="w-20 h-20 text-green-500" />
              </motion.div>
              <h1
                className={`text-3xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Email Verified! 🎉
              </h1>
              <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {message}
              </p>
              <div
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50'
                }`}
              >
                <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                  Redirecting to homepage in 2 seconds...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <XCircle className="w-20 h-20 text-red-500" />
              </motion.div>
              <h1
                className={`text-3xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Verification Failed
              </h1>
              <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {message}
              </p>
              <div
                className={`p-4 rounded-xl mb-6 ${
                  isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50'
                }`}
              >
                <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                  The verification link may have expired or is invalid.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
