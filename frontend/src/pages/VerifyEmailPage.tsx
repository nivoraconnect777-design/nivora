import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { Link } from 'react-router-dom';

export default function VerifyEmailPage() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <Mail className="w-20 h-20 text-blue-500" />
              <CheckCircle className="w-8 h-8 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
          </motion.div>

          <h1
            className={`text-3xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Check your email
          </h1>

          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            We've sent a verification link to your email address.
          </p>

          <div
            className={`p-4 rounded-xl mb-6 ${
              isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50'
            }`}
          >
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
              Please check your inbox and click the verification link to activate your account.
            </p>
          </div>

          <div className={`text-sm space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>Didn't receive the email?</p>
            <p>Check your spam folder or contact support.</p>
          </div>

          <Link
            to="/login"
            className="mt-8 inline-block text-blue-500 hover:text-blue-600 font-semibold"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
