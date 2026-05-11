import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowUpRight } from 'lucide-react';
import { AxiosError } from 'axios';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginInput = z.infer<typeof loginSchema>;
type SignupInput = z.infer<typeof signupSchema>;
type FormInput = LoginInput | SignupInput;

export function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(mode === 'signup' ? signupSchema : loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormInput) => {
    setServerError(null);
    try {
      if (mode === 'signup') {
        await signup(data.email, data.password);
      } else {
        await login(data.email, data.password);
      }
      // No nav — App re-renders when AuthContext.user is set.
    } catch (err) {
      const fallback = mode === 'login' ? 'Sign in failed' : 'Sign up failed';
      const message =
        err instanceof AxiosError
          ? (err.response?.data?.error as string | undefined) ?? fallback
          : fallback;
      setServerError(message);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    reset({ email: '', password: '' });
    setServerError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-1.5">
          <ArrowUpRight className="size-5 text-indigo-600" />
          <span className="text-lg font-semibold text-gray-900">LeadFlow</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'login'
              ? 'Enter your email and password to continue.'
              : 'Sign up to start tracking your leads.'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoFocus
                autoComplete="email"
                placeholder="you@example.com"
                className="h-10 rounded-md px-3 text-sm"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'signup' ? 'At least 8 characters' : ''}
                className="h-10 rounded-md px-3 text-sm"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full rounded-md bg-indigo-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Loading…' : mode === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          Demo: <span className="font-mono">demo@leadflow.test</span> /{' '}
          <span className="font-mono">demo1234</span>
        </div>
      </div>
    </div>
  );
}
