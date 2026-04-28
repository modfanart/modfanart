'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Eye, EyeOff, Palette, Building2, Heart } from 'lucide-react';

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

import { useRegisterMutation } from '@/services/api/authApi'; // Your auth registration
import { useSubmitBrandVerificationRequestMutation } from '@/services/api/brands';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/services/api/features/authSlice';

// ====================== SCHEMAS ======================
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

const accountTypeSchema = z.object({
  accountType: z.enum(['fan', 'artist', 'brand']),
});

const accountInfoSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters.')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const brandRequestSchema = z.object({
  companyName: z.string().min(2, 'Brand / company name is required.'),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  contactEmail: z.string().email('Valid email is required.'),
  contactPhone: z.string().optional(),
  description: z.string().min(30, 'Please describe your brand (min 30 characters).'),
  teamSize: z.string(),
  howHeard: z.string(),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
type AccountTypeValues = z.infer<typeof accountTypeSchema>;
type AccountInfoValues = z.infer<typeof accountInfoSchema>;
type BrandRequestValues = z.infer<typeof brandRequestSchema>;

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState<number>(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoValues | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<'fan' | 'artist' | 'brand' | null>(
    null
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [submitBrandRequest, { isLoading: isBrandSubmitting }] =
    useSubmitBrandVerificationRequestMutation();

  // Forms
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
    defaultValues: {
      companyName: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      description: '',
      teamSize: '1-10',
      howHeard: 'search',
    },
  });

  // ====================== HANDLERS ======================
  const onPersonalSubmit = (values: PersonalInfoValues) => {
    setPersonalInfo(values);
    setStep(2);
  };

  const onTypeSubmit = (values: AccountTypeValues) => {
    setSelectedAccountType(values.accountType);
    setStep(3);
  };

  const onAccountSubmit = async (values: AccountInfoValues) => {
    if (!personalInfo || !selectedAccountType) return;

    try {
      const payload = {
        username: values.username.trim(),
        email: personalInfo.email.trim(),
        password: values.password,
        // Optional: You can pass role hint if your backend supports it
        // role: selectedAccountType,
      };

      const response = await register(payload).unwrap();

      dispatch(
        setCredentials({
          accessToken: response.accessToken,
          user: response.user,
        })
      );

      if (selectedAccountType === 'brand') {
        // Pre-fill brand form
        brandForm.setValue('companyName', `${personalInfo.firstName} ${personalInfo.lastName}`);
        brandForm.setValue('contactEmail', personalInfo.email);
        setStep(4);
      } else {
        // Fan or Artist
        toast({
          title: 'Account Created Successfully!',
          description: 'A confirmation email has been sent to your inbox.',
        });
        router.push('/login');
      }
    } catch (err: any) {
      console.error('Signup failed:', err);
      toast({
        title: 'Registration Failed',
        description: err?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onBrandRequestSubmit = async (values: BrandRequestValues) => {
    try {
      await submitBrandRequest({
        company_name: values.companyName,
        website: values.website || null,
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone || null,
        description: values.description,
        team_size: values.teamSize,
        how_heard: values.howHeard,
      }).unwrap();

      toast({
        title: 'Brand Verification Request Submitted',
        description: 'Our team will review your request shortly. You will be notified via email.',
      });

      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err?.data?.message || err?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Helper functions for Step 3
  const getStep3Title = () => {
    switch (selectedAccountType) {
      case 'fan':
        return 'Join as a Fan';
      case 'artist':
        return 'Set up your Artist Profile';
      case 'brand':
        return 'Set up your Brand Account';
      default:
        return 'Finish Setup';
    }
  };

  const getStep3Description = () => {
    switch (selectedAccountType) {
      case 'fan':
        return 'Create your fan account to discover and support amazing fan art.';
      case 'artist':
        return 'Set up your username and password to start submitting fan art.';
      case 'brand':
        return 'Your user account will be created first. Then tell us about your brand for verification.';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12 px-4">
      {/* Back Button */}
      {step > 1 && step < 4 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
      )}

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-gray-600 mt-2">Create your account to get started.</p>
          </div>

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

              <Button type="submit" className="w-full bg-black hover:bg-gray-900 h-11">
                Continue
              </Button>
            </form>
          </Form>
        </>
      )}

      {/* Step 2: Choose Account Type */}
      {step === 2 && (
        <>
          <div className="text-center">
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
                        {/* Fan Card */}
                        <Card
                          className={`cursor-pointer border-2 transition-all ${field.value === 'fan' ? 'border-violet-600' : 'border-gray-200'}`}
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
                              <p className="text-sm text-gray-500">Discover and support fan art</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Artist Card */}
                        <Card
                          className={`cursor-pointer border-2 transition-all ${field.value === 'artist' ? 'border-violet-600' : 'border-gray-200'}`}
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
                              <p className="text-sm text-gray-500">Create and submit fan art</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Brand Card */}
                        <Card
                          className={`cursor-pointer border-2 transition-all ${field.value === 'brand' ? 'border-violet-600' : 'border-gray-200'}`}
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

              <Button type="submit" className="w-full bg-black hover:bg-gray-900 h-11">
                Continue
              </Button>
            </form>
          </Form>
        </>
      )}

      {/* Step 3: Username & Password */}
      {step === 3 && selectedAccountType && (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold">{getStep3Title()}</h1>
            <p className="text-gray-600 mt-2">{getStep3Description()}</p>
          </div>

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
                {isRegistering ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        </>
      )}

      {/* Step 4: Brand Details */}
      {step === 4 && selectedAccountType === 'brand' && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold">Almost There!</h1>
            <p className="text-gray-600 mt-3 text-lg">
              Your user account has been created. Now please provide details about your brand for
              verification.
            </p>
          </div>

          <Form {...brandForm}>
            <form onSubmit={brandForm.handleSubmit(onBrandRequestSubmit)} className="space-y-6">
              {/* Brand Form Fields - Same as before */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={brandForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand / Company Name *</FormLabel>
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
                        <Input placeholder="https://yourbrand.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={brandForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={brandForm.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={brandForm.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approximate Team Size</FormLabel>
                    <select
                      {...field}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="1-10">1–10 people</option>
                      <option value="11-50">11–50 people</option>
                      <option value="51-200">51–200 people</option>
                      <option value="201-500">201–500 people</option>
                      <option value="501+">501+ people</option>
                      <option value="agency">Creative Agency / Studio</option>
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={brandForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Your Brand & Goals *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-32"
                        placeholder="Tell us about your brand, what you do, and what you hope to achieve with fan creations..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={brandForm.control}
                name="howHeard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us?</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      {['search', 'social', 'referral', 'event', 'article', 'other'].map(
                        (option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <label htmlFor={option} className="capitalize cursor-pointer text-sm">
                              {option}
                            </label>
                          </div>
                        )
                      )}
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isBrandSubmitting}
                className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-lg font-medium"
              >
                {isBrandSubmitting ? 'Submitting Request...' : 'Submit Brand Verification Request'}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {step !== 4 && (
        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-600 hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
