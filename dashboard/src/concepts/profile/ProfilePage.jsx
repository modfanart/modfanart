import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Envelope,
  Shield,
  Calendar,
  SignOut,
  PencilSimple,
  Check,
  X,
  Key
} from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

import { useAuth } from '../../contexts/AuthContext';
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUserByUsernameQuery,
  useGetUserByIdQuery
} from '@/services/api/userApi';
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { user: currentUser, logout } = useAuth();

  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const [editData, setEditData] = useState({ name: '' });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // Check if viewing own profile
  const isOwnProfile = !id ||
    id === currentUser?.id ||
    id === currentUser?.username;

  // Fetch other user if needed
  const { data: userByUsername, isLoading: loadingByUsername } = useGetUserByUsernameQuery(
    id, { skip: !id || isOwnProfile }
  );

  const { data: userById, isLoading: loadingById } = useGetUserByIdQuery(
    id, { skip: !id || isNaN(Number(id)) || isOwnProfile }
  );

  // Correct data mapping
  const rawProfile = isOwnProfile ? currentUser : (userByUsername || userById);

  const profile = rawProfile ? {
    ...rawProfile,
    // Map fields correctly
    name: rawProfile.name || rawProfile.username || 'Unknown User',
    role: rawProfile.role || { name: 'User' },
    status: rawProfile.status || (rawProfile.is_active ? 'active' : 'inactive'),
    created_at: rawProfile.created_at,
    email_verified: rawProfile.email_verified ?? false,
  } : null;

  const isLoading = (id && !isOwnProfile) && (loadingByUsername || loadingById);

  // Sync edit data for own profile
  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setEditData({
        name: currentUser.name || currentUser.username || ''
      });
    }
  }, [isOwnProfile, currentUser]);

  const getRoleName = (role) => {
    if (!role) return 'User';
    if (typeof role === 'string') return role;
    if (typeof role === 'object' && role.name) return role.name;
    return 'User';
  };

  const getRoleColor = (role) => {
    const roleName = getRoleName(role).toLowerCase();
    const colors = {
      super_admin: 'text-purple-500',
      admin: 'text-red-500',
      developer: 'text-blue-500',
      sales: 'text-green-500',
      ops: 'text-yellow-500',
      hr: 'text-pink-500',
    };
    return colors[roleName] || 'text-zinc-400';
  };

  const handleUpdateProfile = async () => {
    if (!editData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await updateProfile({ name: editData.name }).unwrap();
      toast.success('Profile updated successfully');
      setEditModal(false);
    } catch (error) {
      toast.error(error?.data?.detail || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('All fields are required');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      }).unwrap();

      toast.success('Password changed successfully');
      setPasswordModal(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error?.data?.detail || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-400">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">User not found</div>;
  }

  const roleName = getRoleName(profile.role);

  return (
    <div className="min-h-screen" data-testid="profile-page">
      <Header
        title={isOwnProfile ? "My Profile" : `${profile.name}'s Profile`}
        subtitle={isOwnProfile ? "Manage your account settings" : ""}
      />

      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-zinc-800 to-zinc-900" />

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 sm:-mt-12">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <p className={`text-sm font-medium capitalize ${getRoleColor(profile.role)}`}>
                  {roleName.replace('_', ' ')}
                </p>
                {profile.username && profile.username !== profile.name && (
                  <p className="text-zinc-500 text-sm">@{profile.username}</p>
                )}
              </div>

              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:text-white"
                  onClick={() => setEditModal(true)}
                >
                  <PencilSimple className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Envelope weight="duotone" className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Email</p>
                <p className="text-white font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Shield weight="duotone" className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Role</p>
                <p className={`font-medium capitalize ${getRoleColor(profile.role)}`}>
                  {roleName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Calendar weight="duotone" className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Member Since</p>
                <p className="text-white font-medium">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500">Account Status</span>
              {(profile.status === 'active') ? (
                <span className="flex items-center gap-1 text-green-500 text-sm">
                  <Check className="w-4 h-4" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500 text-sm">
                  <X className="w-4 h-4" /> Inactive
                </span>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500">Email Verified</span>
              {profile.email_verified ? (
                <span className="flex items-center gap-1 text-green-500 text-sm">
                  <Check className="w-4 h-4" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-500 text-sm">
                  <X className="w-4 h-4" /> Not Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Security Section - Only for own profile */}
        {isOwnProfile && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
                onClick={() => setPasswordModal(true)}
              >
                <Key className="w-4 h-4 mr-3" />
                Change Password
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-red-500/30 text-red-500 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <SignOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isOwnProfile && (
        <>
          <Dialog open={editModal} onOpenChange={setEditModal}>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Full Name</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ name: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Username</Label>
                  <Input value={currentUser?.username} disabled className="bg-zinc-950 border-zinc-800 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Email</Label>
                  <Input value={currentUser?.email} disabled className="bg-zinc-950 border-zinc-800 text-zinc-500" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditModal(false)}>Cancel</Button>
                <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Password Modal remains the same */}
          <Dialog open={passwordModal} onOpenChange={setPasswordModal}>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Change Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPasswordModal(false)}>Cancel</Button>
                <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default ProfilePage;