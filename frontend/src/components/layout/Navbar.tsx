import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Film, MessageCircle, User, Sun, Moon, LogOut, Menu, PlusSquare, Heart, Clock, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import { useNotificationStore } from '../../stores/notificationStore';
import toast from 'react-hot-toast';
import StoryTray from '../stories/StoryTray';
import MobileMenu from './MobileMenu';
import { useState, useRef, useEffect } from 'react';
import { useSearchHistory } from '../../hooks/useSearchHistory';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { unreadCount, lastNotification, notificationCounts, fetchUnreadCount, clearLastNotification } = useNotificationStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  return (
    <>
      {/* Mobile Top Bar - Logo */}
      {isAuthenticated && (
        <nav
          className={`md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b px-4 h-16 flex items-center justify-between ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
            }`}
        >
          <Link to="/" className="flex items-center gap-2">
            <span
              className={`text-xl font-bold bg-gradient-to-r ${isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
                } bg-clip-text text-transparent`}
            >
              Nivora
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Notification Icon */}

            {/* Message Icon */}
            <Link to="/messages" className="p-2">
              <MessageCircle className={`w-6 h-6 ${isDark ? 'text-gray-200' : 'text-gray-800'}`} />
            </Link>

            {/* Create Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => useUIStore.getState().openCreateMenu()}
              className={`p-2 rounded-full ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
            >
              <PlusSquare className="w-6 h-6" />
            </motion.button>
          </div>
        </nav>
      )}

      {/* Desktop Top Bar - Search and Actions */}
      {isAuthenticated && isHomePage && (
        <nav
          className={`hidden md:block fixed top-0 left-64 right-0 z-40 backdrop-blur-xl border-b ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
            }`}
        >
          <div className="px-6">
            <div className="flex items-center justify-between h-32">
              {/* Expandable Search */}
              <ExpandableSearch isDark={isDark} />

              {/* Story Tray */}
              <div className="flex-1 flex items-center justify-start mx-8 overflow-hidden h-full">
                <StoryTray isDark={isDark} />
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-xl transition-colors ${isDark
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
                  className={`p-2.5 rounded-xl transition-colors ${isDark
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
          className={`md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
            }`}
        >
          <div className="flex items-center justify-around h-16 px-2">
            <MobileNavLink to="/home" icon={Home} active={isActive('/home')} isDark={isDark} label="Home" />
            <MobileNavLink to="/search" icon={Search} active={isActive('/search')} isDark={isDark} label="Search" />
            <MobileNavLink to="/reels" icon={Film} active={isActive('/reels')} isDark={isDark} label="Reels" />
            <MobileNavLink to={`/profile/${useAuthStore.getState().user?.username || ''}`} icon={User} active={location.pathname.startsWith('/profile')} isDark={isDark} label="Profile" />

            {/* Hamburger Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </nav>
      )}

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Spacer for fixed navbar */}
      {isAuthenticated && isHomePage && <div className="h-32 hidden md:block" />}
    </>
  );
}

interface MobileNavLinkProps {
  to: string;
  icon: React.ElementType;
  active: boolean;
  isDark: boolean;
  label: string;
}

function MobileNavLink({ to, icon: Icon, active, isDark, label }: MobileNavLinkProps) {
  return (
    <Link to={to} className="flex-1">
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={`flex flex-col items-center justify-center h-full transition-colors ${active
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Import search history hook
  const { history, addToHistory, removeFromHistory } = useSearchHistory();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!query) {
          setIsExpanded(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleUserClick = (user: any) => {
    addToHistory(user);
    navigate(`/profile/${user.username}`);
    setIsExpanded(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <motion.form
        onSubmit={handleSubmit}
        initial={false}
        animate={{ width: isExpanded ? 300 : 48 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`relative flex items-center h-12 rounded-xl overflow-hidden transition-colors ${isDark
          ? isExpanded ? 'bg-gray-800 ring-2 ring-blue-500/50' : 'bg-gray-800 hover:bg-gray-700'
          : isExpanded ? 'bg-gray-100 ring-2 ring-blue-500/20' : 'bg-gray-100 hover:bg-gray-200'
          }`}
      >
        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className={`absolute left-0 top-0 w-12 h-12 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
        >
          <Search className="w-5 h-5" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className={`w-full h-full pl-12 pr-4 bg-transparent border-none outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'
            }`}
          onFocus={() => setIsExpanded(true)}
        />
      </motion.form>

      {/* Recent Searches Dropdown */}
      <AnimatePresence>
        {isExpanded && !query && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
          >
            <div className="p-3">
              <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Recent
              </h3>
              <div className="space-y-1">
                {history.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all group ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                  >
                    <Clock className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />

                    <div
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                    >
                      {user.profilePicUrl ? (
                        <img
                          src={user.profilePicUrl}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">
                            {user.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.displayName || user.username}
                          </p>
                          {user.isVerified && (
                            <svg className="w-3 h-3 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(user.id);
                      }}
                      className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
