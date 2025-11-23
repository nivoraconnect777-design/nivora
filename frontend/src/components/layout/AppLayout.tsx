import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CreatePostModal from '../common/CreatePostModal';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';

export default function AppLayout() {
  const { isDark } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Verify session on mount to handle stale auth state
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/api/auth/me').catch(() => {
        // Error handling is done by api interceptor (redirects to login on 401)
      });
    }
  }, [isAuthenticated]);

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
      <Sidebar />
      <Navbar />
      <main className={`pb-16 md:pb-0 ${isAuthenticated ? 'md:ml-64' : ''}`}>
        <Outlet />
      </main>
      <CreatePostModal />
    </div>
  );
}
