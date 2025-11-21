import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import { useThemeStore } from '../stores/themeStore';
import { Sun, Moon } from 'lucide-react';

export default function LoginPage() {
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-black'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Toaster position="top-center" />
      
      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full shadow-lg transition-colors ${
          isDark
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </motion.button>

      <LoginForm />
    </div>
  );
}
