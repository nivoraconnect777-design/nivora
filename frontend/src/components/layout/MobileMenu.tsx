import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Compass, Bookmark, Settings, Sun, Moon, LogOut, User, PlusSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import toast from 'react-hot-toast';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { isDark, toggleTheme } = useThemeStore();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
        onClose();
    };

    const handleThemeToggle = () => {
        toggleTheme();
        toast.success(isDark ? 'Light mode enabled' : 'Dark mode enabled', {
            icon: isDark ? '☀️' : '🌙',
            duration: 2000,
        });
    };

    const menuItems = [
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Compass, label: 'Explore', path: '/explore' },
        { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={`fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 md:hidden ${isDark ? 'bg-gray-900' : 'bg-white'
                            } shadow-2xl`}
                    >
                        {/* Header */}
                        <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Menu
                                </h2>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className={`p-2 rounded-xl transition-colors ${isDark
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <X className="w-6 h-6" />
                                </motion.button>
                            </div>

                            {/* User Profile Section */}
                            <Link
                                to={`/profile/${user?.username || ''}`}
                                onClick={onClose}
                                className="flex items-center gap-3 group"
                            >
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
                                    {user?.profilePicUrl ? (
                                        <img
                                            src={user.profilePicUrl}
                                            alt={user.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className={`font-semibold truncate group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'
                                            }`}
                                    >
                                        {user?.username}
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        View Profile
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Menu Items */}
                        <nav className="p-4 space-y-1">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0 }}
                            >
                                <button
                                    onClick={() => {
                                        useUIStore.getState().openCreateMenu();
                                        onClose();
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDark
                                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                                        <PlusSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-medium">Create</span>
                                </button>
                            </motion.div>
                            {menuItems.map((item, index) => (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link to={item.path} onClick={onClose}>
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDark
                                                ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Divider */}
                        <div className={`mx-4 my-2 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />

                        {/* Theme Toggle & Logout */}
                        <div className="p-4 space-y-1">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleThemeToggle}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDark
                                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDark
                                    ? 'text-red-400 hover:bg-red-500/20'
                                    : 'text-red-600 hover:bg-red-50'
                                    }`}
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </motion.button>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Nivora © 2024
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
