import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldWarning, SignOut, Clock } from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';

export const NoAccessPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusMessage = () => {
    if (!user) return 'Your session has expired.';
    
    const issues = [];
    if (!user.is_active) issues.push('Your account is not yet activated');
    if (!user.email_verified) issues.push('Your email is not verified');
    
    return issues.length > 0 
      ? issues.join(' and ') + '.'
      : 'You do not have access to this system.';
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4" data-testid="no-access-page">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
          <ShieldWarning weight="duotone" className="w-10 h-10 text-yellow-500" />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-white mb-3">Access Restricted</h1>
        <p className="text-zinc-400 mb-6">{getStatusMessage()}</p>

        {/* Status Details */}
        {user && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Account Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Account Active</span>
                <span className={`text-sm font-medium ${user.is_active ? 'text-green-500' : 'text-red-500'}`}>
                  {user.is_active ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Email Verified</span>
                <span className={`text-sm font-medium ${user.email_verified ? 'text-green-500' : 'text-red-500'}`}>
                  {user.email_verified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Role</span>
                <span className="text-sm font-medium text-zinc-300 capitalize">
                  {user.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock weight="duotone" className="w-5 h-5 text-zinc-500 mt-0.5" />
            <p className="text-sm text-zinc-400 text-left">
              Please contact your administrator to activate your account or verify your email address.
            </p>
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
          data-testid="no-access-logout"
        >
          <SignOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default NoAccessPage;
