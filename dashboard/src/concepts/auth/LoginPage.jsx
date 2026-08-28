import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import {
  Eye,
  EyeSlash,
  GoogleLogo,
} from '@phosphor-icons/react';

import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

import { toast } from 'sonner';

export const LoginPage = () => {
  const {
    user,
    loading: authLoading,
    login,
    loginWithGoogle,
    isLoggingIn,
    isGoogleLoggingIn,
  } = useAuth();

=======
import { Database, Eye, EyeSlash } from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

export const LoginPage = () => {
  const { user, loading: authLoading, login, isLoggingIn } = useAuth();
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD

  const [error, setError] = useState('');

  // --------------------------------------------------
  // Email / Password login
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    try {
      const result = await login({
        email,
        password,
      });

      // Existing user
      if (result?.isNewUser || result?.requiresSignup) {
        sessionStorage.setItem(
          'pendingSignupEmail',
          email
        );

        navigate('/register', {
          replace: true,
        });

        return;
      }

      toast.success('Login successful!');

      navigate('/', {
        replace: true,
      });
    } catch (err) {
      const msg =
        err?.message ||
        'Invalid email or password';

=======
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
      toast.success('Login successful!');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
      setError(msg);
      toast.error(msg);
    }
  };

<<<<<<< HEAD
  // --------------------------------------------------
  // Google login
  // --------------------------------------------------

  const handleGoogleLogin = async () => {
    setError('');

    try {
      const result = await loginWithGoogle();

      // Google account doesn't exist in our DB yet.
      // Firebase authentication succeeded, but the
      // application account still needs to be created.
      if (
        result?.isNewUser ||
        result?.requiresSignup
      ) {
        sessionStorage.setItem(
          'pendingGoogleIdToken',
          result.idToken
        );

        navigate('/register', {
          replace: true,
        });

        return;
      }

      toast.success('Login successful!');

      navigate('/', {
        replace: true,
      });
    } catch (err) {
      if (
        err?.code ===
        'auth/popup-closed-by-user'
      ) {
        return;
      }

      const msg =
        err?.message ||
        'Google sign-in failed. Please try again.';

      setError(msg);
      toast.error(msg);
    }
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

=======
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

<<<<<<< HEAD
  // --------------------------------------------------
  // Already authenticated
  // --------------------------------------------------

=======
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
<<<<<<< HEAD

          <h2 className="text-xl font-semibold text-white">
            Welcome back
          </h2>

          <p className="text-zinc-400 text-sm mb-6">
            Sign in to your account
          </p>

          <Link
            to="/"
            className="text-sm text-zinc-500 mb-6 inline-block hover:text-white transition-colors"
=======
          <h2 className="text-xl font-semibold text-white">Welcome back</h2>
          <p className="text-zinc-400 text-sm mb-6">Sign in to your account</p>
          <Link
            href="/"
            className="text-sm text-gray-500 mb-1 hover:text-gray-700 transition-colors"
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
          >
            Home
          </Link>

<<<<<<< HEAD
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ---------------------------------------- */}
          {/* Email / Password */}
          {/* ---------------------------------------- */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Email</Label>

              <Input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
=======
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
<<<<<<< HEAD

              <div className="relative">
                <Input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeSlash size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
=======
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
                </button>
              </div>
            </div>

<<<<<<< HEAD
            <Button
              type="submit"
              disabled={
                isLoggingIn ||
                isGoogleLoggingIn
              }
              className="w-full"
            >
              {isLoggingIn
                ? 'Signing in...'
                : 'Sign in'}
            </Button>
          </form>

          {/* ---------------------------------------- */}
          {/* Divider */}
          {/* ---------------------------------------- */}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-zinc-900 px-3 text-xs text-zinc-500">
                OR
              </span>
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* Google */}
          {/* ---------------------------------------- */}

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={
              isLoggingIn ||
              isGoogleLoggingIn
            }
            className="w-full border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
          >
            <GoogleLogo
              size={20}
              weight="bold"
              className="mr-2"
            />

            {isGoogleLoggingIn
              ? 'Signing in with Google...'
              : 'Continue with Google'}
          </Button>

          {/* ---------------------------------------- */}
          {/* Register */}
          {/* ---------------------------------------- */}

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{' '}

            <Link
              to="/register"
              className="text-white underline hover:text-zinc-300"
            >
              Register
            </Link>
          </div>

=======
            <Button type="submit" disabled={isLoggingIn} className="w-full">
              {isLoggingIn ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-white underline hover:text-zinc-300">
              Register
            </Link>
          </div>
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
        </div>
      </div>
    </div>
  );
};

export default LoginPage;