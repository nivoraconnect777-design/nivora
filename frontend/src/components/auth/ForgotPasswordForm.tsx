import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useThemeStore } from '../../stores/themeStore';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { isDark } = useThemeStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/auth/forgot-password', data);
      setEmailSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div
          className={`rounded-2xl shadow-xl p-8 text-center ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex justify-center mb-6">
            <Mail className="w-20 h-20 text-blue-500" />
          </div>
          <h1
            className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Check your email
          </h1>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            We've sent a password reset link to your email address.
          </p>
          <div
            className={`p-4 rounded-xl mb-6 ${
              isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50'
            }`}
          >
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
              Please check your inbox and click the link to reset your password.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    );
  }

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
            Forgot Password?
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                style={isDark ? { colorScheme: 'dark' } : {}}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 [&:-webkit-autofill]:!bg-gray-700 [&:-webkit-autofill]:!text-white'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
