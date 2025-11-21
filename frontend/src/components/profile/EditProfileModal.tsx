import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, User, FileText, AtSign, CheckCircle, XCircle } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { isDark } = useThemeStore();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
  });
  
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePicUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Username validation states
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string>('');

  // Check username availability with debounce
  useEffect(() => {
    const checkUsername = async () => {
      const username = formData.username.trim();
      
      // Reset if empty or same as current
      if (!username || username === user?.username) {
        setUsernameAvailable(null);
        setUsernameError('');
        return;
      }

      // Validate format
      if (username.length < 3) {
        setUsernameError('Username must be at least 3 characters');
        setUsernameAvailable(false);
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setUsernameError('Username can only contain letters, numbers, and underscores');
        setUsernameAvailable(false);
        return;
      }

      setIsCheckingUsername(true);
      setUsernameError('');

      try {
        const response = await api.get(`/api/users/check-username/${username}`);
        const available = response.data.data.available;
        setUsernameAvailable(available);
        if (!available) {
          setUsernameError('This username is already taken. Try a different one.');
        }
      } catch (error) {
        console.error('Username check error:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timer = setTimeout(checkUsername, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [formData.username, user?.username]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      // Get upload signature from backend
      const signatureResponse = await api.post('/api/media/upload-signature', {
        folder: 'profile_pictures',
      });

      const { signature, timestamp, cloudName, apiKey, folder } = signatureResponse.data.data;

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('folder', folder);
      formData.append('transformation', 'c_fill,g_face,h_150,w_150');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await uploadResponse.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated (user object exists in store)
    if (!user) {
      toast.error('You need to log in first');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    setIsLoading(true);

    try {
      let profilePicUrl = user?.profilePicUrl;

      // Upload new profile picture if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          profilePicUrl = await uploadToCloudinary(selectedFile);
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload image. Please try again.');
          setIsUploading(false);
          setIsLoading(false);
          return;
        }
        setIsUploading(false);
      }

      // Check if username is available before submitting
      if (formData.username !== user?.username && !usernameAvailable) {
        toast.error('Please choose an available username');
        setIsLoading(false);
        return;
      }

      // Update profile
      const response = await api.put('/api/users/profile/update', {
        username: formData.username,
        displayName: formData.displayName,
        bio: formData.bio,
        profilePicUrl,
      });

      const updatedUser = response.data.data;
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error: any) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.error?.message 
          || error.response?.data?.message 
          || error.message 
          || 'Failed to update profile';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-lg rounded-2xl shadow-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Edit Profile
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {user?.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <label
                      htmlFor="profile-pic"
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                    </label>
                    <input
                      id="profile-pic"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Click to change profile picture
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 transition-all ${
                        usernameError
                          ? 'border-red-500 focus:ring-red-500'
                          : usernameAvailable
                          ? 'border-green-500 focus:ring-green-500'
                          : 'focus:ring-blue-500'
                      } ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="your_username"
                    />
                    {/* Status Icon */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCheckingUsername ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      ) : usernameAvailable === true ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : usernameAvailable === false ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  {usernameError && (
                    <p className="text-xs mt-1 text-red-500">{usernameError}</p>
                  )}
                  {usernameAvailable && formData.username !== user?.username && (
                    <p className="text-xs mt-1 text-green-500">Username is available!</p>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Your display name"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Bio
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      maxLength={150}
                      rows={3}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <p className={`text-xs mt-1 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formData.bio.length}/150
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || isUploading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading || isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
