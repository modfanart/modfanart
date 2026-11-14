import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldWarning, SignOut, ArrowLeft } from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';

// Explains *why* access was refused. The old page read user.is_active and
// user.email_verified, which the auth context never provided, so it always
// claimed the account was inactive and unverified.
export const NoAccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isStaff } = useAuth();
  const reason = location.state?.reason;

  const message = !user
    ? 'Your session has expired. Please sign in again.'
    : !isStaff || reason === 'not_staff'
      ? `${user.email} is not a staff account. The workspace is only for MOD team members; ask an admin to give your role "Sign in to the workspace" access.`
      : `Your role (${user.role?.name || 'unknown'}) doesn't include access to this section. Ask an admin to update your role's permissions.`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4" data-testid="no-access-page">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
          <ShieldWarning weight="duotone" className="w-10 h-10 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Access restricted</h1>
        <p className="text-zinc-400 mb-6">{message}</p>
        {location.state?.from && (
          <p className="text-xs text-zinc-500 mb-6">
            Requested: <code className="text-zinc-400">{location.state.from}</code>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user && isStaff && (
            <Button asChild variant="outline" className="border-zinc-700 text-zinc-200">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to apps
              </Link>
            </Button>
          )}
          <Button onClick={handleLogout} className="bg-white text-black hover:bg-zinc-200">
            <SignOut className="w-4 h-4 mr-2" /> {user ? 'Sign out' : 'Go to sign in'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoAccessPage;
