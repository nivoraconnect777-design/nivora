import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../stores/themeStore';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import { Toaster } from 'react-hot-toast';

export default function ResetPasswordPage() {
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
      <Toaster position="top-center" />
      <ResetPasswordForm />
    </div>
  );
}
