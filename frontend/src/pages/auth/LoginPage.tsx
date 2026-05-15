/**
 * LoginPage — email + password login with Zod validation.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { loginUser } from '../../api/auth';
import { handleApiError } from '../../utils/errorHandler';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { setToken, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true);
    try {
      const response = await loginUser(data);
      setToken(response.access_token);
      await refreshUser();
      toast.success('Welcome back!');
      navigate('/feed');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          {...register('password')}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Create one
        </Link>
      </p>
    </>
  );
}
