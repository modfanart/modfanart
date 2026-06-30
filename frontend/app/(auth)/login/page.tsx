'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
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
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/services/api/features/authSlice';
import { API_BASE_URL } from '@/services';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        values.email,
        values.password
      );

      const idToken = await credential.user.getIdToken();

      const syncRes = await fetch(`${API_BASE_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!syncRes.ok) throw new Error('Auth sync failed');

      const { user } = await syncRes.json();
      dispatch(setCredentials({ accessToken: idToken, user }));

      router.push('/');
    } catch (err: any) {
      const message =
        err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : err?.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err?.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please try again later.'
          : 'Something went wrong. Please try again.';

      form.setError('root', { type: 'manual', message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Sign in</h1>
      <p className="text-gray-600 mb-8">Welcome back! Please enter your information.</p>

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

      <p className="mt-8 text-center text-sm text-gray-600">
        Don&apos;t have an account yet?{' '}
        <Link href="/signup" className="text-[#9747ff] hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </>
  );
}
