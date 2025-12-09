import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Film,
  MessageCircle,
  User,
  Sparkles,
  PlusSquare,
  Heart,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { isDark } = useThemeStore();
  const { openCreateMenu } = useUIStore();
  const { unreadCount, lastNotification, notificationCounts, fetchUnreadCount, clearLastNotification } = useNotificationStore();

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Optional: Poll for notifications if no socket
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  useEffect(() => {
    if (lastNotification) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
        clearLastNotification();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastNotification, clearLastNotification]);

  const isActive = (path: string) => location.pathname === path;

  // Show sidebar on all authenticated pages
  if (!isAuthenticated) return null;

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r z-40 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
    >
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
            <Sparkles className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </motion.div>
          <span
            className={`text-2xl font-bold bg-gradient-to-r ${isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
              } bg-clip-text text-transparent`}
          >
            Nivora
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        <SidebarLink
          to="/home"
          icon={Home}
          label="Home"
          active={isActive('/home')}
          isDark={isDark}
        />
        <SidebarLink
          to="/search"
          icon={Search}
          label="Search"
          active={isActive('/search')}
          isDark={isDark}
        />
        <SidebarLink
          to="/reels"
          icon={Film}
          label="Reels"
          active={isActive('/reels')}
          isDark={isDark}
        />
        <SidebarLink
          to="/messages"
          icon={MessageCircle}
          label="Messages"
          active={isActive('/messages')}
          isDark={isDark}
        />

        {/* Custom Notification Link with Pop-up */}
        <Link to="/notifications" className="relative block group">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/notifications')
              ? isDark
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-blue-50 text-blue-600'
              : isDark
                ? 'text-gray-400 group-hover:text-white group-hover:bg-gray-800'
                : 'text-gray-600 group-hover:text-gray-900 group-hover:bg-gray-100'
              }`}
          >
            <div className="relative">
              <Heart className={`w-5 h-5 ${isActive('/notifications') ? 'fill-current' : ''}`} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
              )}
            </div>
            <span className="font-medium">Notifications</span>
          </motion.div>

          {/* Notification Pop-up */}
          <AnimatePresence>
            {showPopup && lastNotification && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 flex gap-1 pointer-events-none z-50 min-w-max"
              >
                {/* Like Count Pop-up */}
                {notificationCounts.like > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500 shadow-lg text-white">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold">{notificationCounts.like}</span>
                  </div>
                )}

                {/* Comment Count Pop-up */}
                {notificationCounts.comment > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500 shadow-lg text-white">
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold">{notificationCounts.comment}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <SidebarLink
          to={`/profile/${user?.username || ''}`}
          icon={User}
          label="Profile"
          active={location.pathname.startsWith('/profile')}
          isDark={isDark}
        />

        <SidebarLink
          to="/settings"
          icon={Settings}
          label="Settings"
          active={isActive('/settings')}
          isDark={isDark}
        />

        <button
          id="create-trigger"
          onClick={openCreateMenu}
          className={`w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isDark
            ? 'text-gray-400 hover:text-white hover:bg-gray-800'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
          <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all">
            <PlusSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium">Create</span>
        </button>
      </nav>
    </aside>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  isDark: boolean;
}

function SidebarLink({ to, icon: Icon, label, active, isDark }: SidebarLinkProps) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
          ? isDark
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-blue-50 text-blue-600'
          : isDark
            ? 'text-gray-400 hover:text-white hover:bg-gray-800'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </motion.div>
    </Link>
  );
}
