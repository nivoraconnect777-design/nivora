import { motion } from 'framer-motion';
import { useThemeStore } from '../stores/themeStore';
import { Sparkles, Users, Image, Video } from 'lucide-react';

export default function HomePage() {
  const { isDark } = useThemeStore();

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
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <Sparkles className={`w-20 h-20 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <Sparkles className={`w-20 h-20 ${isDark ? 'text-purple-400' : 'text-purple-600'} opacity-30`} />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r ${
            isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
          } bg-clip-text text-transparent`}
        >
          Welcome to Nivora
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          Share moments, connect with friends, and discover amazing content
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all ${
              isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-xl'
            }`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -mr-16 -mt-16`} />
            
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>

            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {feature.title}
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={`text-center py-16 rounded-2xl ${
          isDark ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
        </motion.div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Your feed is empty
        </h2>
        <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Start following users to see their posts here
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          Explore Users
        </motion.button>
      </motion.div>
    </div>
  );
}
