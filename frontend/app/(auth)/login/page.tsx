'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useLoginMutation } from '@/app/api/authApi'; // ← import from your RTK Query slice
import { useAppDispatch } from '@/store/hooks'; // assuming you have typed hooks
import { setCredentials } from '@/app/api/features/authSlice';
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [login, { isLoading, error: loginError }] = useLoginMutation();

  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Optional: redirect if already logged in (better via middleware in production)
  useEffect(() => {
    // You can improve this with getCurrentUserQuery or just check for token in localStorage/cookies
    const token = localStorage.getItem('access_token'); // or document.cookie check
    if (token) {
      router.push(callbackUrl);
    }
  }, [callbackUrl, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const response = await login({
        email: values.email,
        password: values.password,
      }).unwrap();

      // Assuming your backend returns { access_token, user, ... }
      dispatch(
        setCredentials({
          accessToken: response.accessToken,
          user: response.user,
          // refreshToken: response.refresh_token, // if using
        })
      );

      // Store token persistently if "remember me" (or use httpOnly cookie from backend)
      if (values.rememberMe) {
        localStorage.setItem('access_token', response.accessToken);
      } else {
        // session only → can clear on tab close or use short-lived cookie
      }

      router.push(callbackUrl);
    } catch (err: any) {
      // RTK Query already sets error state, but you can show custom toast here
      console.error('Login failed:', err);
      form.setError('root', {
        type: 'manual',
        message: err?.data?.message || 'Invalid email or password. Please try again.',
      });
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Sign in</h1>
      <p className="text-gray-600 mb-8">Welcome back! Please enter your information.</p>

      {/* Global form error (e.g. invalid credentials) */}
      {form.formState.errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {form.formState.errors.root.message}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your email address"
                    type="email"
                    autoComplete="email"
                    {...field}
                    className="h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      autoComplete="current-password"
                      {...field}
                      className="h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      id="rememberMe"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none cursor-pointer select-none"
                  >
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />
            <Link href="/forgot-password" className="text-sm text-[#9747ff] hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-black hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Form>
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-6 h-12 border-gray-300"
          onClick={() => console.log('Google sign in')}
          disabled={isLoading}
          type="button"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don't have an account yet?{' '}
        <Link href="/signup" className="text-[#9747ff] hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </>
  );
}
