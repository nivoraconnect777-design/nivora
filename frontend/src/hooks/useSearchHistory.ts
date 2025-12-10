import { useState, useEffect } from 'react';

interface SearchHistoryUser {
    id: string;
    username: string;
    displayName: string;
    profilePicUrl: string;
    isVerified: boolean;
}

const STORAGE_KEY = 'nivora_search_history';
const MAX_HISTORY_ITEMS = 10;

export function useSearchHistory() {
    const [history, setHistory] = useState<SearchHistoryUser[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }, [history]);

    const addToHistory = (user: SearchHistoryUser) => {
        setHistory((prev) => {
            // Remove if already exists
            const filtered = prev.filter((item) => item.id !== user.id);
            // Add to beginning
            const updated = [user, ...filtered];
            // Keep only MAX_HISTORY_ITEMS
            return updated.slice(0, MAX_HISTORY_ITEMS);
        });
    };

    const removeFromHistory = (userId: string) => {
        setHistory((prev) => prev.filter((item) => item.id !== userId));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
    };
}
