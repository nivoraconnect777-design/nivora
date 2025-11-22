import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { Sparkles, Users, Image, Video, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { isDark } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: Image,
      title: 'Share Photos',
      description: 'Post your favorite moments',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Video,
      title: 'Create Reels',
      description: 'Short videos that inspire',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Users,
      title: 'Connect',
      description: 'Follow friends and creators',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-blue-50 to-purple-50'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className={`w-12 h-12 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1
              className={`text-5xl font-bold bg-gradient-to-r ${
                isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
              } bg-clip-text text-transparent`}
            >
              Nivora
            </h1>
          </div>
          <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Share moments, connect with friends, and discover amazing content
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 text-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-xl font-semibold transition-colors text-lg ${
                  isDark
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-center p-12 rounded-2xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ready to join?
          </h2>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Create your account and start connecting today
          </p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all text-lg"
            >
              Create Account
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
