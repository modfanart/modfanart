'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Eye, EyeOff, Palette, Building2, Heart, CheckCircle } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

// RTK Query hooks (adjust paths if needed)
import { useRegisterMutation } from '@/services/api/authApi';
import { useSubmitBrandVerificationRequestMutation } from '@/services/api/brands';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/services/api/features/authSlice';

// ────────────────────────────────────────────────
// Schemas
// ────────────────────────────────────────────────

const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

const accountTypeSchema = z.object({
  accountType: z.enum(['fan', 'artist', 'brand']),
});

const accountInfoSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters.' })
      .regex(/^[a-zA-Z0-9_]+$/, { message: 'Only letters, numbers, underscores allowed.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const brandRequestSchema = z.object({
  companyName: z.string().min(2, { message: 'Brand name is required.' }),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().min(30, { message: 'Please describe your brand (min 30 characters).' }),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
type AccountTypeValues = z.infer<typeof accountTypeSchema>;
type AccountInfoValues = z.infer<typeof accountInfoSchema>;
type BrandRequestValues = z.infer<typeof brandRequestSchema>;

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoValues | null>(null);
  const [accountType, setAccountType] = useState<AccountTypeValues | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [brandRequestSubmitted, setBrandRequestSubmitted] = useState(false);

  const [register, { isLoading: isRegistering, error: registerError }] = useRegisterMutation();
  const [submitBrandRequest, { isLoading: isBrandSubmitting }] =
    useSubmitBrandVerificationRequestMutation();

  // ────────────────────────────────────────────────
  // Forms
  // ────────────────────────────────────────────────
  const personalForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  const typeForm = useForm<AccountTypeValues>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: { accountType: 'fan' },
  });

  const accountForm = useForm<AccountInfoValues>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: { username: '', password: '', confirmPassword: '' },
  });

  const brandForm = useForm<BrandRequestValues>({
    resolver: zodResolver(brandRequestSchema),
    defaultValues: { companyName: '', website: '', description: '' },
  });

  // ────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────

  const onPersonalSubmit = (values: PersonalInfoValues) => {
    setPersonalInfo(values);
    setStep(2);
  };

  const onTypeSubmit = (values: AccountTypeValues) => {
    setAccountType(values);
    setStep(3);
  };

  const onAccountSubmit = async (values: AccountInfoValues) => {
    if (!personalInfo || !accountType) return;

    try {
      const payload = {
        username: values.username.trim(),
        email: personalInfo.email.trim(),
        password: values.password,
        // You can send role hint or profile if your backend supports it
        // profile: { firstName: personalInfo.firstName, lastName: personalInfo.lastName },
        // roleHint: accountType.accountType,
      };

      const response = await register(payload).unwrap();

      dispatch(
        setCredentials({
          accessToken: response.accessToken,
          user: response.user,
        })
      );

      setAccountCreated(true);

      // If user chose "brand" → show brand request form
      if (accountType.accountType === 'brand') {
        // Pre-fill brand form with hints
        brandForm.setValue('companyName', personalInfo.firstName + ' ' + personalInfo.lastName);
        brandForm.setValue('description', 'New brand onboarding...');
      }
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  const onBrandRequestSubmit = async (values: BrandRequestValues) => {
    try {
      await submitBrandRequest({
        company_name: values.companyName,
        website: values.website || null, // null instead of undefined
        contact_email: personalInfo?.email || '',
        description: values.description,
        // contact_phone: values.contactPhone || null,
        // documents: [],
      }).unwrap();
      toast({
        title: 'Brand request submitted',
        description: 'Our team will review it shortly and get back to you.',
      });

      setBrandRequestSubmitted(true);
    } catch (err: any) {
      toast({
        title: 'Failed to submit',
        description: err?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────

  const serverError =
    registerError && 'data' in registerError
      ? (registerError.data as any)?.message || 'Registration failed'
      : null;

  if (accountCreated) {
    if (accountType?.accountType === 'brand' && !brandRequestSubmitted) {
      // Show brand request form after brand account creation
      return (
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Almost there! Tell us about your brand</h1>
          <p className="text-gray-600">
            Your account has been created. Now submit your brand details so our team can review and
            set up your brand manager dashboard.
          </p>

          <Form {...brandForm}>
            <form onSubmit={brandForm.handleSubmit(onBrandRequestSubmit)} className="space-y-6">
              <FormField
                control={brandForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand / Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={brandForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={brandForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About your brand</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-32" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isBrandSubmitting}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                {isBrandSubmitting ? 'Submitting...' : 'Submit Brand Request'}
              </Button>
            </form>
          </Form>
        </div>
      );
    }

    // Normal success for Fan / Artist
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold">Account Created!</h1>
        <p className="text-gray-600">
          A confirmation email has been sent to <strong>{personalInfo?.email}</strong>.
        </p>
        <p className="text-gray-600">Please verify your email to activate your account.</p>

        <Button asChild className="w-full bg-black hover:bg-gray-800">
          <Link href="/login">Go to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      {step > 1 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="flex items-center text-gray-600 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
      )}

      {step === 1 && (
        <>
          <div>
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-gray-600 mt-2">Create your account to get started.</p>
          </div>

          {serverError && <div className="text-red-600 text-sm">{serverError}</div>}

          <Form {...personalForm}>
            <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={personalForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={personalForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-black hover:bg-gray-900">
                Continue
              </Button>
            </form>
          </Form>
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <h1 className="text-3xl font-bold">Choose Your Role</h1>
            <p className="text-gray-600 mt-2">Select the type of account that best fits you.</p>
          </div>

          <Form {...typeForm}>
            <form onSubmit={typeForm.handleSubmit(onTypeSubmit)} className="space-y-5">
              <FormField
                control={typeForm.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-4"
                      >
                        {/* Fan */}
                        <Card
                          className={`cursor-pointer border-2 transition-all ${
                            field.value === 'fan' ? 'border-violet-600' : 'border-gray-200'
                          }`}
                          onClick={() => field.onChange('fan')}
                        >
                          <CardContent className="p-5 flex items-center gap-4">
                            <RadioGroupItem value="fan" id="fan" />
                            <div className="bg-pink-100 p-3 rounded-full">
                              <Heart className="h-6 w-6 text-pink-600" />
                            </div>
                            <div>
                              <label htmlFor="fan" className="font-medium text-lg cursor-pointer">
                                Fan
                              </label>
                              <p className="text-sm text-gray-500">
                                Discover, support, and collect fan art
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Artist */}
                        <Card
                          className={`cursor-pointer border-2 transition-all ${
                            field.value === 'artist' ? 'border-violet-600' : 'border-gray-200'
                          }`}
                          onClick={() => field.onChange('artist')}
                        >
                          <CardContent className="p-5 flex items-center gap-4">
                            <RadioGroupItem value="artist" id="artist" />
                            <div className="bg-purple-100 p-3 rounded-full">
                              <Palette className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <label
                                htmlFor="artist"
                                className="font-medium text-lg cursor-pointer"
                              >
                                Artist
                              </label>
                              <p className="text-sm text-gray-500">
                                Create and submit fan art for licensing
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Brand */}
                        <Card
                          className={`cursor-pointer border-2 transition-all ${
                            field.value === 'brand' ? 'border-violet-600' : 'border-gray-200'
                          }`}
                          onClick={() => field.onChange('brand')}
                        >
                          <CardContent className="p-5 flex items-center gap-4">
                            <RadioGroupItem value="brand" id="brand" />
                            <div className="bg-blue-100 p-3 rounded-full">
                              <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <label htmlFor="brand" className="font-medium text-lg cursor-pointer">
                                Brand / IP Holder
                              </label>
                              <p className="text-sm text-gray-500">
                                License fan creations & protect your IP
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-black hover:bg-gray-900">
                Continue
              </Button>
            </form>
          </Form>
        </>
      )}

      {step === 3 && (
        <>
          <div>
            <h1 className="text-3xl font-bold">Finish Setup</h1>
            <p className="text-gray-600 mt-2">
              {accountType?.accountType === 'fan'
                ? 'Join as a fan and start exploring fan art.'
                : accountType?.accountType === 'artist'
                  ? 'Set up your artist profile and start creating.'
                  : 'Create your brand account — onboarding team will follow up.'}
            </p>
          </div>

          {serverError && (
            <div className="text-red-600 bg-red-50 p-3 rounded-md">{serverError}</div>
          )}

          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-5">
              <FormField
                control={accountForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accountForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} {...field} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
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
                control={accountForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirmPassword ? 'text' : 'password'} {...field} />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
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
                className="w-full bg-black hover:bg-gray-900 h-12"
              >
                {isRegistering ? 'Creating...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        </>
      )}

      <p className="text-center text-sm text-gray-600 mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-violet-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
