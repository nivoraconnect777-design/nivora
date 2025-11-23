import { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import { useAuthStore } from '../stores/authStore';

export default function MessagesPage() {
    const { isDark } = useThemeStore();
    const { user } = useAuthStore();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const handleSelectConversation = (conversationId: string, otherUser: any) => {
        setSelectedConversationId(conversationId);
        setSelectedUser(otherUser);
    };

    return (
        <div className={`flex h-[calc(100vh-4rem)] ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            {/* Conversation List - Hidden on mobile if chat is open */}
            <div className={`w-full md:w-80 lg:w-96 border-r ${isDark ? 'border-gray-800' : 'border-gray-200'} 
                ${selectedConversationId ? 'hidden md:block' : 'block'}`}>
                <ConversationList
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversationId}
                />
            </div>

            {/* Chat Window - Hidden on mobile if no chat selected */}
            <div className={`flex-1 ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversationId && selectedUser ? (
                    <ChatWindow
                        conversationId={selectedConversationId}
                        currentUser={user}
                        otherUser={selectedUser}
                        onBack={() => setSelectedConversationId(null)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className={`w-24 h-24 rounded-full border-2 mb-4 flex items-center justify-center
                                ${isDark ? 'border-white text-white' : 'border-gray-900 text-gray-900'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
                        <p className="text-gray-500">Send private photos and messages to a friend or group.</p>
                        <button className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                            Send Message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
