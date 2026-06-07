import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
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
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [editData, setEditData] = useState({
    name: user?.name || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleUpdateProfile = async () => {
    if (!editData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      await axios.patch(
        `${API_URL}/api/users/${user._id || user.id}`,
        { name: editData.name },
        { withCredentials: true }
      );
      toast.success('Profile updated successfully');
      setEditModal(false);
      // Refresh the page to get updated user data
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
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

    toast.info('Password change feature coming soon');
    setPasswordModal(false);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    const colors = {
      super_admin: 'text-purple-500',
      admin: 'text-red-500',
      developer: 'text-blue-500',
      sales: 'text-green-500',
      ops: 'text-yellow-500',
      hr: 'text-pink-500',
    };
    return colors[role] || 'text-zinc-400';
  };

  return (
    <div className="min-h-screen" data-testid="profile-page">
      <Header title="My Profile" subtitle="Manage your account settings" />
      
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-zinc-800 to-zinc-900" />
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 sm:-mt-12">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              
              {/* Name & Role */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <p className={`text-sm font-medium capitalize ${getRoleColor(user?.role)}`}>
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:text-white"
                  onClick={() => {
                    setEditData({ name: user?.name || '' });
                    setEditModal(true);
                  }}
                  data-testid="edit-profile-btn"
                >
                  <PencilSimple className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
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
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Shield weight="duotone" className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Role</p>
                <p className={`font-medium capitalize ${getRoleColor(user?.role)}`}>
                  {user?.role?.replace('_', ' ')}
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
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
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
              {user?.is_active ? (
                <span className="flex items-center gap-1 text-green-500 text-sm">
                  <Check className="w-4 h-4" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500 text-sm">
                  <X className="w-4 h-4" /> Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600">
              {user?.is_active ? 'Your account is active and fully functional' : 'Contact admin to activate your account'}
            </p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500">Email Verified</span>
              {user?.email_verified ? (
                <span className="flex items-center gap-1 text-green-500 text-sm">
                  <Check className="w-4 h-4" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-500 text-sm">
                  <X className="w-4 h-4" /> Pending
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600">
              {user?.email_verified ? 'Your email has been verified' : 'Please verify your email address'}
            </p>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
              onClick={() => setPasswordModal(true)}
              data-testid="change-password-btn"
            >
              <Key className="w-4 h-4 mr-3" />
              Change Password
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start border-red-500/30 text-red-500 hover:bg-red-500/10"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <SignOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={editModal} onOpenChange={(o) => !o && setEditModal(false)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Full Name</Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="edit-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input
                value={user?.email}
                disabled
                className="bg-zinc-950 border-zinc-800 text-zinc-500"
              />
              <p className="text-xs text-zinc-600">Email cannot be changed</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(false)} className="border-zinc-700 text-zinc-300">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProfile} 
              className="bg-white text-black hover:bg-zinc-200"
              disabled={loading}
              data-testid="save-profile-btn"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={passwordModal} onOpenChange={(o) => !o && setPasswordModal(false)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Current Password</Label>
              <Input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="current-password-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">New Password</Label>
              <Input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="new-password-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="confirm-password-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordModal(false)} className="border-zinc-700 text-zinc-300">
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword} 
              className="bg-white text-black hover:bg-zinc-200"
              data-testid="change-password-submit"
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
