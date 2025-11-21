import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies
});

// Request interceptor - Cookies are sent automatically with withCredentials: true
api.interceptors.request.use(
  (config) => {
    // No need to manually add token - httpOnly cookies are sent automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token (refreshToken is in httpOnly cookie)
        await axios.post(`${API_URL}/api/auth/refresh`, {}, {
          withCredentials: true, // Send cookies
        });

        // Retry original request (new accessToken is now in cookie)
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
