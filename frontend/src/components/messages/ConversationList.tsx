import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import api from '../../lib/api';
import { useThemeStore } from '../../stores/themeStore';

interface Conversation {
    id: string;
    otherUser: {
        id: string;
        username: string;
        profilePicUrl: string;
        displayName: string;
    };
    lastMessage: {
        text: string;
        createdAt: string;
        isOwn: boolean;
    } | null;
    updatedAt: string;
}

interface ConversationListProps {
    onSelectConversation: (conversationId: string, user: any) => void;
    selectedConversationId: string | null;
}

export default function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { isDark } = useThemeStore();

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/api/messages/conversations');
            setConversations(response.data.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.otherUser.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-r`}>
            <div className="p-4 border-b border-gray-800">
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search messages"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg ${isDark ? 'bg-gray-900 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => onSelectConversation(conv.id, conv.otherUser)}
                        className={`flex items-center p-4 cursor-pointer hover:bg-gray-800/50 transition-colors ${selectedConversationId === conv.id ? 'bg-gray-800' : ''
                            }`}
                    >
                        <img
                            src={conv.otherUser.profilePicUrl || `https://ui-avatars.com/api/?name=${conv.otherUser.username}`}
                            alt={conv.otherUser.username}
                            className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {conv.otherUser.displayName || conv.otherUser.username}
                                </h3>
                                {conv.lastMessage && (
                                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                        {format(new Date(conv.lastMessage.createdAt), 'MMM d')}
                                    </span>
                                )}
                            </div>
                            {conv.lastMessage ? (
                                <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'} ${!conv.lastMessage.isOwn ? 'font-medium' : ''}`}>
                                    {conv.lastMessage.isOwn ? 'You: ' : ''}{conv.lastMessage.text}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Start a conversation</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
