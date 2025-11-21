import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Film, MessageCircle, User, Sun, Moon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import toast from 'react-hot-toast';

export default function Navbar() {
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

  return (
    <>
      {/* Desktop Top Bar - Search and Actions */}
      {isAuthenticated && location.pathname === '/' && (
        <nav
          className={`hidden md:block fixed top-0 left-64 right-0 z-40 backdrop-blur-xl border-b ${
            isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
          }`}
        >
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              {/* Expandable Search */}
              <ExpandableSearch isDark={isDark} />

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-xl transition-colors ${
                    isDark
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={isDark ? 'Light Mode' : 'Dark Mode'}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.button>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className={`p-2.5 rounded-xl transition-colors ${
                    isDark
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Navbar - Bottom */}
      {isAuthenticated && (
        <nav
          className={`md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t ${
            isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-around h-16 px-2">
            <MobileNavLink to="/" icon={Home} active={isActive('/')} isDark={isDark} />
            <MobileNavLink to="/search" icon={Search} active={isActive('/search')} isDark={isDark} />
            <MobileNavLink to="/reels" icon={Film} active={isActive('/reels')} isDark={isDark} />
            <MobileNavLink to="/messages" icon={MessageCircle} active={isActive('/messages')} isDark={isDark} />
            <MobileNavLink to="/profile" icon={User} active={isActive('/profile')} isDark={isDark} />
          </div>
        </nav>
      )}

      {/* Spacer for fixed navbar - only on homepage */}
      {isAuthenticated && location.pathname === '/' && <div className="h-16 hidden md:block" />}
    </>
  );
}

interface MobileNavLinkProps {
  to: string;
  icon: React.ElementType;
  active: boolean;
  isDark: boolean;
}

function MobileNavLink({ to, icon: Icon, active, isDark }: MobileNavLinkProps) {
  return (
    <Link to={to} className="flex-1">
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={`flex flex-col items-center justify-center h-full transition-colors ${
          active
            ? isDark
              ? 'text-blue-400'
              : 'text-blue-600'
            : isDark
            ? 'text-gray-500'
            : 'text-gray-600'
        }`}
      >
        <Icon className="w-6 h-6" />
      </motion.div>
    </Link>
  );
}


// Expandable Search Component
function ExpandableSearch({ isDark }: { isDark: boolean }) {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSearchClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
        isDark
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Search className="w-5 h-5" />
      <span className="text-sm">Search users...</span>
    </motion.button>
  );
}
