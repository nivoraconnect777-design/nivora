import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get('success');

      if (success !== 'true') {
        setError('Authentication failed');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        // Tokens are in httpOnly cookies, fetch user data
        const response = await api.get('/api/auth/me');
        const user = response.data.data.user;
        
        // Store user in auth store (tokens are in httpOnly cookies)
        setAuth(user);
        toast.success('Successfully signed in with Google!');
        navigate('/');
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setError('Failed to fetch user data');
        toast.error('Authentication failed');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">
          {error || 'Completing sign in...'}
        </p>
      </div>
    </div>
  );
}
