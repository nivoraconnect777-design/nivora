import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Film, MessageCircle, User, Sun, Moon, LogOut, Menu, PlusSquare } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import toast from 'react-hot-toast';
import StoryTray from '../stories/StoryTray';
import MobileMenu from './MobileMenu';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => useUIStore.getState().openCreatePostModal()}
              className={`p-2 rounded-full ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
            >
              <PlusSquare className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDark ? 'text-yellow-400' : 'text-gray-600'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
            <MobileNavLink to="/messages" icon={MessageCircle} active={isActive('/messages')} isDark={isDark} label="Messages" />
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

  return (
    <div ref={containerRef}>
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
    </div>
  );
}
