import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useThemeStore } from '../../stores/themeStore';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isDark } = useThemeStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password?.length >= 8 },
    { label: 'Contains uppercase', met: /[A-Z]/.test(password || '') },
    { label: 'Contains lowercase', met: /[a-z]/.test(password || '') },
    { label: 'Contains number', met: /[0-9]/.test(password || '') },
  ];

  const onSubmit = async (data: ResetPasswordFormData) => {
    const token = searchParams.get('token');

    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        token,
        password: data.password,
      });
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className={`rounded-2xl shadow-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Reset Password
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Enter your new password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                style={isDark ? { colorScheme: 'dark' } : {}}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 [&:-webkit-autofill]:!bg-gray-700 [&:-webkit-autofill]:!text-white'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {req.met ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                style={isDark ? { colorScheme: 'dark' } : {}}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 [&:-webkit-autofill]:!bg-gray-700 [&:-webkit-autofill]:!text-white'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
