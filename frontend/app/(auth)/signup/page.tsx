'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Eye, EyeOff, Palette, Building2, Heart } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { API_BASE_URL } from '@/services';
import { TERMS_VERSION, PASSWORD_RULES, passwordProblems } from '@/lib/policy';
import { Checkbox } from '@/components/ui/checkbox';

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
import { useSubmitBrandVerificationRequestMutation } from '@/services/api/brands';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/services/api/features/authSlice';

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

const accountTypeSchema = z.object({
  accountType: z.enum(['fan', 'artist', 'brand']),
  // AUTH-04 / GA-22: explicit consent, recorded on the account.
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service and Privacy Policy.' }),
  }),
  ageConfirmed: z.literal(true, {
    errorMap: () => ({ message: 'You must be 18 or older to use MOD.' }),
  }),
});

const accountInfoSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters.')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed.'),
    password: z.string().superRefine((p, ctx) => {
      const problems = passwordProblems(p);
      if (problems.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Password needs: ${problems.join(', ').toLowerCase()}.` });
      }
    }),
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
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const redirectTo = searchParams.get('redirect') || '/';

  const [step, setStep] = useState<number>(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoValues | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<'fan' | 'artist' | 'brand' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);

  const [submitBrandRequest, { isLoading: isBrandSubmitting }] =
    useSubmitBrandVerificationRequestMutation();

  useEffect(() => {
    const pendingToken = sessionStorage.getItem('pendingGoogleIdToken');
    if (pendingToken) {
      sessionStorage.removeItem('pendingGoogleIdToken');
      setGoogleIdToken(pendingToken);
      setStep(2);
    }
  }, []);

  const personalForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  const typeForm = useForm<AccountTypeValues>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: { accountType: 'fan', acceptTerms: false as unknown as true, ageConfirmed: false as unknown as true },
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

  const onPersonalSubmit = (values: PersonalInfoValues) => {
    setPersonalInfo(values);
    setStep(2);
  };

  const onGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(firebaseAuth, provider);
      // AUTH-03 / GA-05: send the verification email. Contest entry, voting,
      // selling and checkout stay locked until the address is verified.
      try {
        await sendEmailVerification(credential.user, {
          url: `${window.location.origin}/verify-account`,
        });
      } catch {
        /* the in-app banner offers "Resend" if this fails */
      }

      const idToken = await credential.user.getIdToken();

      const syncRes = await fetch(`${API_BASE_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!syncRes.ok) throw new Error('Auth sync failed');

      const { user, isNewUser } = await syncRes.json();

      if (!isNewUser) {
        dispatch(setCredentials({ accessToken: idToken, user }));
        router.push(redirectTo);
        return;
      }

      setGoogleIdToken(idToken);
      setStep(2);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        toast({ title: 'Google sign-in failed', description: 'Please try again.', variant: 'destructive' });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onTypeSubmit = async (values: AccountTypeValues) => {
    setSelectedAccountType(values.accountType);

    if (!googleIdToken) {
      setStep(3);
      return;
    }

    setIsRegistering(true);
    try {
      const syncRes = await fetch(`${API_BASE_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleIdToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountType: values.accountType,
          acceptedTermsVersion: TERMS_VERSION,
          ageConfirmed: true,
        }),
      });

      if (!syncRes.ok) throw new Error('Auth sync failed');

      const { user } = await syncRes.json();
      dispatch(setCredentials({ accessToken: googleIdToken, user }));

      if (values.accountType === 'brand') {
        brandForm.setValue('companyName', user.username || '');
        brandForm.setValue('contactEmail', user.email || '');
        setStep(4);
      } else {
        toast({ title: 'Account Created!', description: 'Welcome to Modfanart.' });
        router.push(redirectTo);
      }
    } catch (err: any) {
      toast({ title: 'Registration Failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsRegistering(false);
    }
  };

  const onAccountSubmit = async (values: AccountInfoValues) => {
    if (!personalInfo || !selectedAccountType) return;
    setIsRegistering(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        personalInfo.email.trim(),
        values.password
      );

      const idToken = await credential.user.getIdToken();

      const syncRes = await fetch(`${API_BASE_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username.trim().toLowerCase(),
          accountType: selectedAccountType,
          // Consent was given on the previous step (the form blocks otherwise).
          acceptedTermsVersion: TERMS_VERSION,
          ageConfirmed: true,
        }),
      });

      if (!syncRes.ok) throw new Error('Auth sync failed');

      const { user } = await syncRes.json();
      dispatch(setCredentials({ accessToken: idToken, user }));

      if (selectedAccountType === 'brand') {
        brandForm.setValue('companyName', `${personalInfo.firstName} ${personalInfo.lastName}`);
        brandForm.setValue('contactEmail', personalInfo.email);
        setStep(4);
      } else {
        toast({
          title: 'Account created',
          description: `We sent a verification link to ${personalInfo.email}. Verify it to enter contests or buy.`,
        });
        router.push(redirectTo);
      }
    } catch (err: any) {
      const message =
        err?.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : err?.code === 'auth/weak-password'
          ? 'Password is too weak.'
          : err?.message || 'Registration failed. Please try again.';

      toast({ title: 'Registration Failed', description: message, variant: 'destructive' });
    } finally {
      setIsRegistering(false);
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
        description: 'Our team will review your request shortly.',
      });

      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err?.data?.message || err?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStep3Title = () => {
    switch (selectedAccountType) {
      case 'fan': return 'Join as a Fan';
      case 'artist': return 'Set up your Artist Profile';
      case 'brand': return 'Set up your Brand Account';
      default: return 'Finish Setup';
    }
  };

  const getStep3Description = () => {
    switch (selectedAccountType) {
      case 'fan': return 'Create your fan account to discover and support amazing fan art.';
      case 'artist': return 'Set up your username and password to start submitting fan art.';
      case 'brand': return 'Your user account will be created first. Then tell us about your brand for verification.';
      default: return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12 px-4">
      {step > 1 && step < 4 && (
        <button
          type="button"
          onClick={() => {
            if (step === 2 && googleIdToken) setGoogleIdToken(null);
            setStep(step - 1);
          }}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
      )}

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-muted-foreground mt-2">Create your account to get started.</p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-border"
            onClick={onGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">or sign up with email</span>
            </div>
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
                      <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-black hover:bg-foreground h-11">
                Continue
              </Button>
            </form>
          </Form>
        </>
      )}

      {/* Step 2: Account Type */}
      {step === 2 && (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Choose Your Role</h1>
            <p className="text-muted-foreground mt-2">Select the type of account that best fits you.</p>
          </div>

          <Form {...typeForm}>
            <form onSubmit={typeForm.handleSubmit(onTypeSubmit)} className="space-y-5">
              <FormField
                control={typeForm.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-4">
                        <Card
                          className={`cursor-pointer border-2 transition-all ${field.value === 'fan' ? 'border-primary' : 'border-border'}`}
                          onClick={() => field.onChange('fan')}
                        >
                          <CardContent className="p-5 flex items-center gap-4">
                            <RadioGroupItem value="fan" id="fan" />
                            <div className="bg-destructive-subtle p-3 rounded-full">
                              <Heart className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                              <label htmlFor="fan" className="font-medium text-lg cursor-pointer">Fan</label>
                              <p className="text-sm text-muted-foreground">Discover and support fan art</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          className={`cursor-pointer border-2 transition-all ${field.value === 'artist' ? 'border-primary' : 'border-border'}`}
                          onClick={() => field.onChange('artist')}
                        >
                          <CardContent className="p-5 flex items-center gap-4">
                            <RadioGroupItem value="artist" id="artist" />
                            <div className="bg-primary-subtle p-3 rounded-full">
                              <Palette className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <label htmlFor="artist" className="font-medium text-lg cursor-pointer">Artist</label>
                              <p className="text-sm text-muted-foreground">Create and submit fan art</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          className={`cursor-pointer border-2 transition-all ${field.value === 'brand' ? 'border-primary' : 'border-border'}`}
                          onClick={() => field.onChange('brand')}
                        >
                          <CardContent className="p-5 flex items-center gap-4">
                            <RadioGroupItem value="brand" id="brand" />
                            <div className="bg-info-subtle p-3 rounded-full">
                              <Building2 className="h-6 w-6 text-info" />
                            </div>
                            <div>
                              <label htmlFor="brand" className="font-medium text-lg cursor-pointer">Brand / IP Holder</label>
                              <p className="text-sm text-muted-foreground">License fan creations & protect your IP</p>
                            </div>
                          </CardContent>
                        </Card>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 rounded-lg border p-4">
                <FormField
                  control={typeForm.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="acceptTerms"
                          checked={field.value === true}
                          onCheckedChange={(v) => field.onChange(v === true)}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <label htmlFor="acceptTerms" className="text-sm leading-snug">
                          I agree to the{' '}
                          <Link href="/legal/terms-and-service" target="_blank" className="text-primary underline">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/legal/privacy-policy" target="_blank" className="text-primary underline">
                            Privacy Policy
                          </Link>
                          .
                        </label>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={typeForm.control}
                  name="ageConfirmed"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="ageConfirmed"
                          checked={field.value === true}
                          onCheckedChange={(v) => field.onChange(v === true)}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <label htmlFor="ageConfirmed" className="text-sm leading-snug">
                          I confirm I am 18 years of age or older.
                        </label>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isRegistering} className="w-full h-11">
                {isRegistering ? 'Creating Account...' : 'Continue'}
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
            <p className="text-muted-foreground mt-2">{getStep3Description()}</p>
          </div>

          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-5">
              <FormField
                control={accountForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
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
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ul className="grid gap-1 text-xs text-muted-foreground" aria-label="Password requirements">
                {PASSWORD_RULES.map((r) => {
                  const ok = r.test(accountForm.watch('password') || '');
                  return (
                    <li key={r.label} className={ok ? 'text-success' : undefined}>
                      {ok ? '✓' : '•'} {r.label}
                    </li>
                  );
                })}
              </ul>

              <Button type="submit" disabled={isRegistering} className="w-full h-12">
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
            <p className="text-muted-foreground mt-3 text-lg">
              Your user account has been created. Now please provide details about your brand for verification.
            </p>
          </div>

          <Form {...brandForm}>
            <form onSubmit={brandForm.handleSubmit(onBrandRequestSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={brandForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand / Company Name *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><Input placeholder="https://yourbrand.com" {...field} /></FormControl>
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
                      <FormControl><Input type="email" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
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
                      className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                      {['search', 'social', 'referral', 'event', 'article', 'other'].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={option} />
                          <label htmlFor={option} className="capitalize cursor-pointer text-sm">{option}</label>
                        </div>
                      ))}
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isBrandSubmitting}
                className="w-full bg-primary hover:bg-primary-hover h-12 text-lg font-medium"
              >
                {isBrandSubmitting ? 'Submitting Request...' : 'Submit Brand Verification Request'}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {step !== 4 && (
        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      )}
    </div>
  );
}
