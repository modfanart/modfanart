'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Eye, EyeOff, Palette, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRegisterMutation } from '@/app/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/app/api/features/authSlice';
// ────────────────────────────────────────────────
// Zod Schemas (unchanged)
// ────────────────────────────────────────────────
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

const accountTypeSchema = z.object({
  accountType: z.enum(['artist', 'brand']),
});

const accountInfoSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters.' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores.',
      }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
type AccountTypeValues = z.infer<typeof accountTypeSchema>;
type AccountInfoValues = z.infer<typeof accountInfoSchema>;

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoValues | null>(null);
  const [accountType, setAccountType] = useState<AccountTypeValues | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [register, { isLoading: isRegistering, error: registerError }] = useRegisterMutation();

  // ────────────────────────────────────────────────
  // Form instances
  // ────────────────────────────────────────────────
  const personalInfoForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const accountTypeForm = useForm<AccountTypeValues>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: {
      accountType: 'artist',
    },
  });

  const accountInfoForm = useForm<AccountInfoValues>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  // ────────────────────────────────────────────────
  // Submit handlers
  // ────────────────────────────────────────────────
  const onPersonalInfoSubmit = (values: PersonalInfoValues) => {
    setPersonalInfo(values);
    setStep(2);
  };

  const onAccountTypeSubmit = (values: AccountTypeValues) => {
    setAccountType(values);
    setStep(3);
  };

  const onAccountInfoSubmit = async (values: AccountInfoValues) => {
    if (!personalInfo || !accountType) return;

    try {
      const payload = {
        username: values.username.trim(),
        email: personalInfo.email.trim(),
        password: values.password,
        // Optional: if your backend supports sending extra profile data during signup
        // firstName: personalInfo.firstName,
        // lastName: personalInfo.lastName,
        // accountType: accountType.accountType,
      };

      const response = await register(payload).unwrap();

      // Store tokens + user in redux
      dispatch(
        setCredentials({
     accessToken: response.accessToken,
          user: response.user,
        })
      );

      setAccountCreated(true);
    } catch (err) {
      // RTK Query error is already caught → shown in UI below
      console.error('Registration error:', err);
    }
  };

  const handleBackToSignIn = () => {
    router.push('/login');
  };

  // ────────────────────────────────────────────────
  // Success screen (unchanged)
  // ────────────────────────────────────────────────
  if (accountCreated) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold mb-2">Account Created</h1>
        <p className="text-gray-600 mb-6">Thank you for signing up!</p>

        <p className="mb-2">A confirmation email has been sent to:</p>
        <p className="font-medium mb-6">{personalInfo?.email}</p>

        <p className="mb-8">
          Please click on the link in the <span className="font-medium">email</span> to activate
          your account.
        </p>

        <Button
          onClick={handleBackToSignIn}
          className="w-full h-12 bg-black hover:bg-gray-800 text-white"
        >
          Back to Sign in
        </Button>
      </div>
    );
  }

  // Extract server error message safely
  const serverErrorMessage =
    registerError && 'data' in registerError
      ? (registerError.data as any)?.message ||
        (registerError.data as any)?.error ||
        'Something went wrong. Please try again.'
      : null;

  return (
    <div className="space-y-8">
      {step > 1 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="flex items-center text-gray-600 mb-4 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>
      )}

      {step === 1 && (
        <>
          <div>
            <h1 className="text-3xl font-bold mb-2">Sign up</h1>
            <p className="text-gray-600 mb-8">Welcome! Create an account to get started.</p>
          </div>

          <Form {...personalInfoForm}>
            <form
              onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)}
              className="space-y-6"
            >
              <FormField
                control={personalInfoForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your first name" {...field} className="h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalInfoForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your last name" {...field} className="h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalInfoForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="Your email address"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 bg-black hover:bg-gray-800 text-white">
                Next
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
              type="button"
              className="w-full mt-6 h-12 border-gray-300"
              onClick={() => console.log('Google sign up')} // ← replace with real Google OAuth later
            >
              {/* Google SVG unchanged */}
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
            Have an account?{' '}
            <Link href="/login" className="text-[#9747ff] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <h1 className="text-3xl font-bold mb-2">Choose Account Type</h1>
            <p className="text-gray-600 mb-8">Select the type of account you want to create.</p>
          </div>

          <Form {...accountTypeForm}>
            <form
              onSubmit={accountTypeForm.handleSubmit(onAccountTypeSubmit)}
              className="space-y-6"
            >
              <FormField
                control={accountTypeForm.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col gap-4"
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            field.value === 'artist'
                              ? 'border-[#9747ff] ring-2 ring-[#9747ff] ring-offset-2'
                              : 'border-gray-200'
                          }`}
                          onClick={() => field.onChange('artist')}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <RadioGroupItem value="artist" id="artist" />
                              <div className="bg-purple-100 p-3 rounded-full">
                                <Palette className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <label
                                  htmlFor="artist"
                                  className="text-lg font-medium cursor-pointer"
                                >
                                  Artist
                                </label>
                                <p className="text-sm text-gray-500 mt-1">
                                  Create and submit fan art for licensing opportunities
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            field.value === 'brand'
                              ? 'border-[#9747ff] ring-2 ring-[#9747ff] ring-offset-2'
                              : 'border-gray-200'
                          }`}
                          onClick={() => field.onChange('brand')}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <RadioGroupItem value="brand" id="brand" />
                              <div className="bg-blue-100 p-3 rounded-full">
                                <Building2 className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <label
                                  htmlFor="brand"
                                  className="text-lg font-medium cursor-pointer"
                                >
                                  Brand & IP Holder
                                </label>
                                <p className="text-sm text-gray-500 mt-1">
                                  Review and license fan art for your intellectual property
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 bg-black hover:bg-gray-800 text-white">
                Next
              </Button>
            </form>
          </Form>
        </>
      )}

      {step === 3 && (
        <>
          <div>
            <h1 className="text-3xl font-bold mb-2">Sign up</h1>
            <p className="text-gray-600 mb-8">
              {accountType?.accountType === 'artist'
                ? 'Create your artist account to start submitting your work.'
                : 'Create your brand account to manage your IP licensing.'}
            </p>
          </div>

          {/* Minimal error display – doesn't break layout */}
          {serverErrorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm mb-6">
              {serverErrorMessage}
            </div>
          )}

          <Form {...accountInfoForm}>
            <form
              onSubmit={accountInfoForm.handleSubmit(onAccountInfoSubmit)}
              className="space-y-6"
            >
              <FormField
                control={accountInfoForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your username"
                        autoComplete="username"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accountInfoForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Your password"
                          autoComplete="new-password"
                          {...field}
                          className="h-12 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

              <FormField
                control={accountInfoForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Re-enter Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          {...field}
                          className="h-12 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isRegistering}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white"
              >
                {isRegistering ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
