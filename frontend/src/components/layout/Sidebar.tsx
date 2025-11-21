import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Film,
  MessageCircle,
  Bell,
  User,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Show sidebar on all authenticated pages
  if (!isAuthenticated) return null;

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r z-40 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
            <Sparkles className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </motion.div>
          <span
            className={`text-2xl font-bold bg-gradient-to-r ${
              isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
            } bg-clip-text text-transparent`}
          >
            Nivora
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        <SidebarLink
          to="/"
          icon={Home}
          label="Home"
          active={isActive('/')}
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
        <SidebarLink
          to="/notifications"
          icon={Bell}
          label="Notifications"
          active={isActive('/notifications')}
          isDark={isDark}
        />
        <SidebarLink
          to="/profile"
          icon={User}
          label="Profile"
          active={isActive('/profile')}
          isDark={isDark}
        />
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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          active
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
