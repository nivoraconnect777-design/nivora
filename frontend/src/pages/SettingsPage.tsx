import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { motion } from 'framer-motion';
import {
    User,
    Lock,
    Bell,
    Moon,
    Sun,
    Shield,
    Smartphone,
    LogOut,
    ChevronRight,
    Monitor,
    Eye,
    EyeOff
} from 'lucide-react';
import EditProfileModal from '../components/profile/EditProfileModal';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user, logout, updateUser } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Password Visibility State
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Notification Toggles
    const [notifications, setNotifications] = useState({
        push: false, // Default to false, check on mount
        email: true,
        likes: true,
        comments: true,
        messages: true,
    });

    useEffect(() => {
        const checkPushStatus = async () => {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setNotifications(prev => ({ ...prev, push: !!subscription }));
            }
        };

        checkPushStatus();

        // Fetch latest user data to check hasPassword status
        api.get('/api/auth/me')
            .then(res => {
                if (res.data.success) {
                    updateUser(res.data.data.user);
                }
            })
            .catch(err => console.error('Failed to fetch user info', err));
    }, [updateUser]);

    // ... (handlePasswordChange remains same)

    const handlePushToggle = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast.error('Push notifications are not supported via this browser.');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // If already subscribed, unsubscribe
                await subscription.unsubscribe();
                setNotifications(prev => ({ ...prev, push: false }));
                toast.success('Push notifications disabled');
                // Optional: Call backend to remove subscription if endpoint exists
            } else {
                // Subscribe
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast.error('Permission denied');
                    return;
                }

                const publicVapidKey = 'BKXoTvbbjBNL8F_al8XG0lqsc6JMZlMtcf8X57QrKUKPncsCIIL9GpOfUg-z-o-UOkN0U7TjiOV_mAXIJ3GVQvk';

                const urlBase64ToUint8Array = (base64String: string) => {
                    const padding = '='.repeat((4 - base64String.length % 4) % 4);
                    const base64 = (base64String + padding)
                        .replace(/\-/g, '+')
                        .replace(/_/g, '/');

                    const rawData = window.atob(base64);
                    const outputArray = new Uint8Array(rawData.length);

                    for (let i = 0; i < rawData.length; ++i) {
                        outputArray[i] = rawData.charCodeAt(i);
                    }
                    return outputArray;
                };

                const newSubscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                });

                await api.post('/api/notifications/subscribe', newSubscription);
                toast.success('Push notifications enabled!');
                setNotifications(prev => ({ ...prev, push: true }));
            }

        } catch (error) {
            console.error('Error toggling push:', error);
            toast.error('Failed to update push settings');
        }
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success("Preference updated");
    };

    return (
        <div className={`min-h-screen pb-20 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage your account preferences and security.
                    </p>
                </header>

                {/* Account Section */}
                <section className={`rounded-xl overflow-hidden border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Account
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src={user?.profilePicUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                                    alt={user?.username}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                />
                                <div>
                                    <h3 className="font-semibold text-lg">{user?.displayName}</h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>@{user?.username}</p>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditProfileOpen(true)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className={`rounded-xl overflow-hidden border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            Security
                        </h2>
                    </div>
                    <div className="p-6">
                        {!user?.hasPassword && (
                            <div className={`mb-6 p-4 rounded-lg flex gap-3 ${isDark ? 'bg-yellow-900/20 text-yellow-200' : 'bg-yellow-50 text-yellow-800'}`}>
                                <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold mb-1">Verify or complete your security</h3>
                                    <p className="text-sm opacity-90">
                                        Your account is currently secured with Google. Adding a password provides an alternative login method and reduces account vulnerabilities.
                                        You can do this now or later.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                            {user?.hasPassword && (
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className={`w-full pl-10 pr-12 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {user?.hasPassword ? 'New Password' : 'Create Password'}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={`w-full pl-10 pr-12 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        placeholder={user?.hasPassword ? "Enter new password (min 8 chars)" : "Create a strong password (min 8 chars)"}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full pl-10 pr-12 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Updating...' : (user?.hasPassword ? 'Update Password' : 'Set Password')}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className={`rounded-xl overflow-hidden border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Bell className="w-5 h-5 text-yellow-500" />
                            Notifications
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between py-2">
                                <div className="capitalize font-medium text-gray-700 dark:text-gray-300">
                                    {key === 'push' ? 'Push Notifications' : `${key} Notifications`}
                                </div>
                                <button
                                    onClick={() => key === 'push' ? handlePushToggle() : toggleNotification(key as keyof typeof notifications)}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Danger Zone */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
            />
        </div>
    );
}
