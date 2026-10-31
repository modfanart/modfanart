'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Palette, Building2, Heart } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  updatePassword,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { API_BASE_URL } from '@/services';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { PasswordChecklist } from '@/components/auth/password-checklist';
import { TermsConsent } from '@/components/auth/terms-consent';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/services/api/features/authSlice';
import { resolvePostLoginRedirect } from '@/lib/auth/redirect';
import { AuthApiError, authErrorMessage, syncSession } from '@/lib/auth/session';
import { acceptTermsSchema, newPasswordSchema, usernameSchema } from '@/lib/auth/schemas';
import { USERNAME_HINT } from '@/lib/auth/username';
import { fetchWithTimeout, withTimeout } from '@/lib/auth/timeout';

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
    username: usernameSchema,
    password: newPasswordSchema,
    confirmPassword: z.string(),
    acceptTerms: acceptTermsSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type AccountType = 'fan' | 'artist' | 'brand';
type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
type AccountTypeValues = z.infer<typeof accountTypeSchema>;
type AccountInfoValues = z.infer<typeof accountInfoSchema>;

/** An error shown inline on the current step; toasts were easy to miss (AUTH-06). */
type StepError = { message: string; emailInUse?: boolean } | null;

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

/** Brand accounts finish onboarding (verification request) on /brand-manager. */
function landingFor(accountType: AccountType, redirectTo: string) {
  return accountType === 'brand' ? '/brand-manager' : redirectTo;
}

/** null when the username is free, a message when taken. Unknown → let the server decide. */
async function usernameTakenMessage(username: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/users/by-username/${encodeURIComponent(username)}`,
      {},
      8000
    );
    return res.ok ? 'That username is already taken.' : null;
  } catch {
    return null;
  }
}

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const redirectTo = resolvePostLoginRedirect(searchParams.get('redirect'));

  const [step, setStep] = useState<number>(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoValues | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [googleAcceptedTerms, setGoogleAcceptedTerms] = useState(false);
  const [stepError, setStepError] = useState<StepError>(null);

  useEffect(() => {
    const pendingToken = sessionStorage.getItem('pendingGoogleIdToken');
    if (pendingToken) {
      sessionStorage.removeItem('pendingGoogleIdToken');
      setGoogleIdToken(pendingToken);
      setStep(2);
    }
  }, []);

  const goToStep = (next: number) => {
    setStepError(null);
    setStep(next);
  };

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
    // Validate as they type once a field has been touched, so the username rules and
    // password checklist show up before submit rather than after (AUTH-10).
    mode: 'onTouched',
    defaultValues: { username: '', password: '', confirmPassword: '', acceptTerms: false },
  });
  const passwordValue = accountForm.watch('password');

  const onPersonalSubmit = (values: PersonalInfoValues) => {
    setPersonalInfo(values);
    goToStep(2);
  };

  const onGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setStepError(null);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(firebaseAuth, provider);
      const idToken = await withTimeout(credential.user.getIdToken());
      const { user, isNewUser } = await syncSession(idToken);

      if (!isNewUser && user) {
        dispatch(setCredentials({ accessToken: idToken, user }));
        router.push(redirectTo);
        return;
      }

      setGoogleIdToken(idToken);
      goToStep(2);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setStepError({ message: `Google sign-in failed. ${authErrorMessage(err)}` });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onTypeSubmit = async (values: AccountTypeValues) => {
    setSelectedAccountType(values.accountType);
    setStepError(null);

    if (!googleIdToken) {
      setStep(3);
      return;
    }

    // Google signups skip step 3, so they accept the terms here.
    if (!googleAcceptedTerms) {
      setStepError({ message: 'Please accept the Terms of Service and Privacy Policy to continue.' });
      return;
    }

    setIsRegistering(true);
    try {
      // The token may be up to an hour old if they came from the login page.
      const freshToken = firebaseAuth.currentUser
        ? await withTimeout(firebaseAuth.currentUser.getIdToken())
        : googleIdToken;
      const { user } = await syncSession(freshToken, {
        accountType: values.accountType,
        acceptedTerms: true,
      });

      dispatch(setCredentials({ accessToken: freshToken, user }));
      toast({ title: 'Account created', description: 'Welcome to MOD Fan Official.' });
      router.push(landingFor(values.accountType, redirectTo));
    } catch (err) {
      setStepError({ message: authErrorMessage(err) });
    } finally {
      setIsRegistering(false);
    }
  };

  const onAccountSubmit = async (values: AccountInfoValues) => {
    if (!personalInfo || !selectedAccountType) return;
    setIsRegistering(true);
    setStepError(null);

    const email = personalInfo.email.trim();
    const username = values.username.trim().toLowerCase();

    try {
      const takenMessage = await usernameTakenMessage(username);
      if (takenMessage) {
        accountForm.setError('username', { type: 'manual', message: takenMessage });
        return;
      }

      // A previous attempt may have created the Firebase user and then failed at the
      // server step (taken username, timeout). Reuse it rather than hitting
      // "email already in use" for an account this same form just made.
      let firebaseUser: FirebaseUser;
      const existing = firebaseAuth.currentUser;
      if (existing && existing.email?.toLowerCase() === email.toLowerCase()) {
        firebaseUser = existing;
        await withTimeout(updatePassword(firebaseUser, values.password));
      } else {
        const credential = await withTimeout(
          createUserWithEmailAndPassword(firebaseAuth, email, values.password),
          undefined,
          'Creating your account'
        );
        firebaseUser = credential.user;
      }

      const idToken = await withTimeout(firebaseUser.getIdToken());
      const { user } = await syncSession(idToken, {
        username,
        accountType: selectedAccountType,
        acceptedTerms: true,
      });

      const next = landingFor(selectedAccountType, redirectTo);

      // Email/password accounts start unverified (AUTH-03). Send the link now; the verify
      // page can resend it if this fails.
      let sent = true;
      try {
        await withTimeout(
          sendEmailVerification(firebaseUser, {
            url: `${window.location.origin}/verify-account?next=${encodeURIComponent(next)}`,
          })
        );
      } catch {
        sent = false;
      }

      dispatch(setCredentials({ accessToken: idToken, user }));
      // The verify page is the confirmation that the account exists (AUTH-13).
      router.push(
        `/verify-account?next=${encodeURIComponent(next)}${sent ? '&sent=1' : ''}`
      );
    } catch (err: any) {
      if (err instanceof AuthApiError && err.code === 'USERNAME_TAKEN') {
        accountForm.setError('username', { type: 'manual', message: err.message });
      } else if (err?.code === 'auth/email-already-in-use') {
        setStepError({ message: authErrorMessage(err), emailInUse: true });
      } else {
        setStepError({ message: authErrorMessage(err) });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const switchToDifferentEmail = () => {
    goToStep(1);
    personalForm.setError('email', {
      type: 'manual',
      message: 'An account with this email already exists. Use a different email or sign in.',
    });
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
      case 'brand':
        return 'Your user account is created first. After you confirm your email, you can tell us about your brand for verification.';
      default: return '';
    }
  };

  const errorAlert = stepError && (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <p>{stepError.message}</p>
        {stepError.emailInUse && (
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/login" className="font-medium underline">
              Sign in instead
            </Link>
            <button type="button" onClick={switchToDifferentEmail} className="font-medium underline">
              Use a different email
            </button>
            <Link href="/forgot-password" className="font-medium underline">
              Forgot password?
            </Link>
          </p>
        )}
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12 px-4">
      {step > 1 && (
        <button
          type="button"
          onClick={() => {
            if (step === 2 && googleIdToken) setGoogleIdToken(null);
            goToStep(step - 1);
          }}
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

          {errorAlert}

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-gray-300"
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
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or sign up with email</span>
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
                      <FormControl><Input autoComplete="given-name" {...field} /></FormControl>
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
                      <FormControl><Input autoComplete="family-name" {...field} /></FormControl>
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
                    <FormControl><Input type="email" autoComplete="email" {...field} /></FormControl>
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

      {/* Step 2: Account Type */}
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
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-4">
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
                              <label htmlFor="fan" className="font-medium text-lg cursor-pointer">Fan</label>
                              <p className="text-sm text-gray-500">Discover and support fan art</p>
                            </div>
                          </CardContent>
                        </Card>

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
                              <label htmlFor="artist" className="font-medium text-lg cursor-pointer">Artist</label>
                              <p className="text-sm text-gray-500">Create and submit fan art</p>
                            </div>
                          </CardContent>
                        </Card>

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
                              <label htmlFor="brand" className="font-medium text-lg cursor-pointer">Brand / IP Holder</label>
                              <p className="text-sm text-gray-500">License fan creations & protect your IP</p>
                            </div>
                          </CardContent>
                        </Card>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {googleIdToken && (
                <TermsConsent
                  id="google-terms"
                  checked={googleAcceptedTerms}
                  onCheckedChange={(checked) => {
                    setGoogleAcceptedTerms(checked);
                    if (checked) setStepError(null);
                  }}
                />
              )}

              {errorAlert}

              <Button type="submit" disabled={isRegistering} className="w-full bg-black hover:bg-gray-900 h-11">
                {isRegistering ? 'Creating Account...' : googleIdToken ? 'Create Account' : 'Continue'}
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
                      <Input autoComplete="username" autoCapitalize="none" spellCheck={false} {...field} />
                    </FormControl>
                    <FormDescription>{USERNAME_HINT}</FormDescription>
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
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          aria-describedby="password-rules"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <PasswordChecklist id="password-rules" password={passwordValue} />
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
                        <Input type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" {...field} />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
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

              <FormField
                control={accountForm.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem>
                    <TermsConsent
                      id="email-terms"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorAlert}

              <Button type="submit" disabled={isRegistering} className="w-full bg-black hover:bg-gray-900 h-12">
                {isRegistering ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        </>
      )}

      <p className="text-center text-sm text-gray-600 mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-violet-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
