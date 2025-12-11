import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Link as LinkIcon, Check } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { StreamChat } from 'stream-chat';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

interface SharePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    postUrl: string;
    postCaption?: string;
}

interface User {
    id: string;
    username: string;
    displayName: string;
    profilePicUrl?: string;
}

export default function SharePostModal({
    isOpen,
    onClose,
    postId,
    postUrl,
    postCaption
}: SharePostModalProps) {
    const { isDark } = useThemeStore();
    const { user: currentUser } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Fetch followers and following
    useEffect(() => {
        if (isOpen && currentUser) {
            fetchUsers();
        }
    }, [isOpen, currentUser]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Fetch both followers and following using user ID
            const [followersRes, followingRes] = await Promise.all([
                api.get(`/api/follow/${currentUser?.id}/followers`),
                api.get(`/api/follow/${currentUser?.id}/following`)
            ]);

            const followers = followersRes.data.data?.followers || [];
            const following = followingRes.data.data?.following || [];

            // Combine and deduplicate
            const allUsers = [...followers, ...following];
            const uniqueUsers = Array.from(
                new Map(allUsers.map(u => [u.id, u])).values()
            );

            setUsers(uniqueUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter users based on search query
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(
            u =>
                u.username.toLowerCase().includes(query) ||
                u.displayName.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    // Toggle user selection
    const toggleUserSelection = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    // Handle share via DM
    const handleShareViaDM = async () => {
        if (selectedUsers.size === 0) return;

        setIsSending(true);
        try {
            // Get Stream Chat client
            const tokenRes = await api.post('/api/stream/token');
            const { token } = tokenRes.data.data;

            const client = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
            await client.connectUser(
                {
                    id: currentUser!.id,
                    name: currentUser!.displayName,
                    image: currentUser!.profilePicUrl
                },
                token
            );

            const shareText = message.trim()
                ? `${message}\n\n📎 Shared post: ${postUrl}`
                : `📎 Shared post: ${postUrl}`;

            // Send to each selected user
            const promises = Array.from(selectedUsers).map(async userId => {
                const channel = client.channel('messaging', {
                    members: [currentUser!.id, userId]
                });
                await channel.create();
                await channel.sendMessage({ text: shareText });
            });

            await Promise.all(promises);

            toast.success(
                `Post shared with ${selectedUsers.size} ${selectedUsers.size === 1 ? 'person' : 'people'
                }`
            );

            // Disconnect and close
            await client.disconnectUser();
            onClose();
            resetState();
        } catch (error) {
            console.error('Failed to share post:', error);
            toast.error('Failed to share post');
        } finally {
            setIsSending(false);
        }
    };

    // Handle external platform sharing
    const handleExternalShare = (platform: string) => {
        const encodedUrl = encodeURIComponent(postUrl);
        const encodedText = encodeURIComponent(
            postCaption || `Check out this post on Nivora!`
        );

        const urls: Record<string, string> = {
            copyLink: '',
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            messenger: `fb-messenger://share?link=${encodedUrl}`,
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            email: `mailto:?subject=Check out this post&body=${encodedText}%20${encodedUrl}`,
            threads: `https://threads.net/intent/post?text=${encodedText}%20${encodedUrl}`,
            x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        };

        if (platform === 'copyLink') {
            navigator.clipboard.writeText(postUrl);
            toast.success('Link copied to clipboard!');
        } else {
            window.open(urls[platform], '_blank', 'noopener,noreferrer');
        }
    };

    const resetState = () => {
        setSearchQuery('');
        setSelectedUsers(new Set());
        setMessage('');
    };

    const handleClose = () => {
        onClose();
        resetState();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'
                                }`}
                            style={{ maxHeight: '90vh' }}
                        >
                            {/* Header */}
                            <div
                                className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                                    }`}
                            >
                                <button
                                    onClick={handleClose}
                                    className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <h2
                                    className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                                        }`}
                                >
                                    Share
                                </h2>
                                <div className="w-8" /> {/* Spacer for centering */}
                            </div>

                            {/* Search Bar */}
                            <div className="p-4">
                                <div
                                    className={`relative flex items-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                                        }`}
                                >
                                    <Search
                                        className={`absolute left-3 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                            }`}
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search"
                                        className={`w-full pl-10 pr-4 py-2.5 bg-transparent border-none outline-none ${isDark
                                            ? 'text-white placeholder-gray-500'
                                            : 'text-gray-900 placeholder-gray-500'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* User List */}
                            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div
                                        className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                            }`}
                                    >
                                        {searchQuery ? 'No users found' : 'No followers or following'}
                                    </div>
                                ) : (
                                    <div className="px-4 pb-4">
                                        {filteredUsers.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => toggleUserSelection(user.id)}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${isDark
                                                    ? 'hover:bg-gray-800'
                                                    : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={
                                                            user.profilePicUrl ||
                                                            `https://ui-avatars.com/api/?name=${user.username}&background=random`
                                                        }
                                                        alt={user.username}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                    {selectedUsers.has(user.id) && (
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p
                                                        className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'
                                                            }`}
                                                    >
                                                        {user.username}
                                                    </p>
                                                    <p
                                                        className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {user.displayName}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bottom Section - Conditional */}
                            <div
                                className={`sticky bottom-0 border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                                    }`}
                            >
                                {selectedUsers.size > 0 ? (
                                    // Message Input + Send Button
                                    <div className="p-4 space-y-3">
                                        <textarea
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            placeholder="Write a message..."
                                            rows={2}
                                            className={`w-full px-4 py-2.5 rounded-lg border resize-none outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                                }`}
                                        />
                                        <button
                                            onClick={handleShareViaDM}
                                            disabled={isSending}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                                        >
                                            {isSending
                                                ? 'Sending...'
                                                : `Send separately (${selectedUsers.size})`}
                                        </button>
                                    </div>
                                ) : (
                                    // External Platform Options
                                    <div className="p-4">
                                        <div className="grid grid-cols-4 gap-4">
                                            <ExternalShareButton
                                                icon={<LinkIcon className="w-6 h-6" />}
                                                label="Copy link"
                                                onClick={() => handleExternalShare('copyLink')}
                                                isDark={isDark}
                                            />
                                            <ExternalShareButton
                                                icon={
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                    </svg>
                                                }
                                                label="Facebook"
                                                onClick={() => handleExternalShare('facebook')}
                                                isDark={isDark}
                                            />
                                            <ExternalShareButton
                                                icon={
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                                    </svg>
                                                }
                                                label="WhatsApp"
                                                onClick={() => handleExternalShare('whatsapp')}
                                                isDark={isDark}
                                            />
                                            <ExternalShareButton
                                                icon={
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 0c-6.627 0-12 4.975-12 11.111 0 3.497 1.745 6.616 4.472 8.652v4.237l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111 0-6.136-5.373-11.111-12-11.111zm1.193 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z" />
                                                    </svg>
                                                }
                                                label="Messenger"
                                                onClick={() => handleExternalShare('messenger')}
                                                isDark={isDark}
                                            />
                                            <ExternalShareButton
                                                icon={
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z" />
                                                    </svg>
                                                }
                                                label="Email"
                                                onClick={() => handleExternalShare('email')}
                                                isDark={isDark}
                                            />
                                            <ExternalShareButton
                                                icon={
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a9.925 9.925 0 0 1 3.116.365c.003-.295.01-.59.02-.889.015-.36.036-.724.065-1.094l1.99.283c-.03.378-.053.754-.071 1.126-.01.208-.018.416-.024.623.329.226.62.467.877.721.427.423.776.93 1.04 1.514 1.163 2.574.835 5.776-1.562 8.131C18.612 23.116 16.217 24 12.186 24zm-.014-7.718c1.008-.047 1.806-.436 2.37-1.156.565-.72.94-1.8 1.116-3.21-.057-.015-.114-.03-.171-.044a7.973 7.973 0 0 0-2.517-.403c-1.086.063-2.065.403-2.75.958-.684.554-1.046 1.27-1.018 2.016.028.74.396 1.37 1.034 1.773.638.402 1.468.57 2.336.53.2-.01.4-.027.6-.05z" />
                                                    </svg>
                                                }
                                                label="Threads"
                                                onClick={() => handleExternalShare('threads')}
                                                isDark={isDark}
                                            />
                                            <ExternalShareButton
                                                icon={
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                }
                                                label="X"
                                                onClick={() => handleExternalShare('x')}
                                                isDark={isDark}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

// External Share Button Component
interface ExternalShareButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isDark: boolean;
}

function ExternalShareButton({ icon, label, onClick, isDark }: ExternalShareButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
            <div
                className={`w-14 h-14 rounded-full flex items-center justify-center border ${isDark
                    ? 'border-gray-700 text-gray-300'
                    : 'border-gray-300 text-gray-700'
                    }`}
            >
                {icon}
            </div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {label}
            </span>
        </button>
    );
}
