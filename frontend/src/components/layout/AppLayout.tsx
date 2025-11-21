import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';

export default function AppLayout() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      <Sidebar />
      <Navbar />
      <main className={`pb-16 md:pb-0 ${isAuthenticated ? 'md:ml-64' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
