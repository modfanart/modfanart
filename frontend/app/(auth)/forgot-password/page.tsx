'use client';

import { useState } from 'react';
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
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setUserEmail(values.email);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  }

  return (
    <>
      <Link href="/login" className="flex items-center text-gray-600 mb-4 hover:text-gray-900">
        <ArrowLeft size={16} className="mr-1" /> Back to sign in
      </Link>

      {isSubmitted ? (
        <div>
          <h1 className="text-3xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <span className="font-medium">{userEmail}</span>
          </p>
          <p className="mb-8">
            Please check your email and follow the instructions to reset your password.
          </p>
          <Link href="/login">
            <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white">
              Back to Sign in
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-2">Forgot password?</h1>
          <p className="text-gray-600 mb-8">No worries, we'll send you reset instructions.</p>

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
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Reset password'}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </>
  );
}
