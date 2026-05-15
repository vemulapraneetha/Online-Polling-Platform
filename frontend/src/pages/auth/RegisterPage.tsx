/**
 * RegisterPage — username + email + password + confirm password.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { registerUser, loginUser } from '../../api/auth';
import { handleApiError } from '../../utils/errorHandler';
import { useState } from 'react';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username is too long')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { setToken, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setIsSubmitting(true);
    try {
      await registerUser({
        email: data.email,
        username: data.username,
        password: data.password,
      });
      // Auto-login after registration
      const tokenResponse = await loginUser({
        email: data.email,
        password: data.password,
      });
      setToken(tokenResponse.access_token);
      await refreshUser();
      toast.success('Account created! Welcome to PollHub!');
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
        <p className="text-sm text-slate-500">Join PollHub and start creating polls</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Username"
          placeholder="johndoe"
          error={errors.username?.message}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          {...register('username')}
        />

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
          placeholder="At least 8 characters"
          error={errors.password?.message}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          {...register('confirmPassword')}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
}
