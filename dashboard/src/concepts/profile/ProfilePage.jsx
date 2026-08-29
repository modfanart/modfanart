import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import {
  Envelope,
  ShieldCheck,
  Calendar,
  SignOut,
  PencilSimple,
  CheckCircle,
  XCircle,
  Key,
  UserCircle,
  LockKey,
} from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

import { useAuth } from '../../contexts/AuthContext';

import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUserByUsernameQuery,
  useGetUserByIdQuery,
} from '../../services/api/userApi';

import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { user: currentUser, logout } = useAuth();

  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const [editData, setEditData] = useState({
    name: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const isOwnProfile =
    !id ||
    id === currentUser?.id ||
    id === currentUser?.username;

  const { data: userByUsername, isLoading: loadingByUsername } =
    useGetUserByUsernameQuery(id, {
      skip: !id || isOwnProfile,
    });

  const { data: userById, isLoading: loadingById } =
    useGetUserByIdQuery(id, {
      skip: !id || isNaN(Number(id)) || isOwnProfile,
    });

  const rawProfile = isOwnProfile
    ? currentUser
    : userByUsername || userById;

  const profile = rawProfile
    ? {
      ...rawProfile,
      name:
        rawProfile.name ||
        rawProfile.username ||
        'Unknown User',
      role:
        rawProfile.role || {
          name: 'User',
        },
      status:
        rawProfile.status ||
        (rawProfile.is_active ? 'active' : 'inactive'),
      email_verified:
        rawProfile.email_verified ?? false,
    }
    : null;

  const isLoading =
    id &&
    !isOwnProfile &&
    (loadingByUsername || loadingById);

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setEditData({
        name:
          currentUser.name ||
          currentUser.username ||
          '',
      });
    }
  }, [isOwnProfile, currentUser]);

  const getRoleName = (role) => {
    if (!role) return 'User';

    if (typeof role === 'string') {
      return role;
    }

    if (typeof role === 'object' && role.name) {
      return role.name;
    }

    return 'User';
  };

  const getRoleLabel = (role) =>
    getRoleName(role)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const getInitials = (name) => {
    if (!name) return 'U';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getRoleBadgeClass = (role) => {
    const roleName = getRoleName(role).toLowerCase();

    const classes = {
      super_admin:
        'bg-purple-500/10 text-purple-400 border-purple-500/20',
      admin:
        'bg-red-500/10 text-red-400 border-red-500/20',
      developer:
        'bg-blue-500/10 text-blue-400 border-blue-500/20',
      sales:
        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      ops:
        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      hr:
        'bg-pink-500/10 text-pink-400 border-pink-500/20',
    };

    return (
      classes[roleName] ||
      'bg-zinc-800 text-zinc-300 border-zinc-700'
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

      case 'suspended':
        return 'bg-red-500/10 text-red-400 border-red-500/20';

      case 'pending_verification':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const handleUpdateProfile = async () => {
    if (!editData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await updateProfile({
        name: editData.name.trim(),
      }).unwrap();

      toast.success('Profile updated successfully');
      setEditModal(false);
    } catch (error) {
      toast.error(
        error?.data?.detail ||
        error?.data?.message ||
        'Failed to update profile'
      );
    }
  };

  const handleChangePassword = async () => {
    const {
      current_password,
      new_password,
      confirm_password,
    } = passwordData;

    if (
      !current_password ||
      !new_password ||
      !confirm_password
    ) {
      toast.error('All fields are required');
      return;
    }

    if (new_password !== confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (new_password.length < 6) {
      toast.error(
        'Password must be at least 6 characters'
      );
      return;
    }

    try {
      await changePassword({
        current_password,
        new_password,
      }).unwrap();

      toast.success('Password changed successfully');

      setPasswordModal(false);

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast.error(
        error?.data?.detail ||
        error?.data?.message ||
        'Failed to change password'
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Profile" />

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Profile" />

        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <UserCircle
                size={48}
                weight="duotone"
                className="mb-4 text-muted-foreground"
              />

              <h2 className="text-lg font-semibold">
                User not found
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                The profile you're looking for doesn't exist.
              </p>

              <Button
                className="mt-6"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const roleName = getRoleName(profile.role);
  const roleLabel = getRoleLabel(profile.role);

  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    )
    : 'Not available';

  return (
    <div
      className="min-h-screen bg-background"
      data-testid="profile-page"
    >
      <Header
        title={
          isOwnProfile
            ? 'My Profile'
            : `${profile.name}'s Profile`
        }
        subtitle={
          isOwnProfile
            ? 'Manage your account and security settings'
            : 'User account details'
        }
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* PROFILE HERO */}
            <Card className="overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-zinc-800 via-zinc-900 to-background" />

              <CardContent className="relative px-6 pb-6">
                <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
                  <Avatar className="h-24 w-24 rounded-2xl border-4 border-background shadow-xl">
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={profile.name}
                    />

                    <AvatarFallback className="rounded-2xl bg-zinc-800 text-2xl font-semibold">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight">
                        {profile.name}
                      </h1>

                      {profile.email_verified && (
                        <CheckCircle
                          weight="fill"
                          className="h-5 w-5 text-emerald-500"
                        />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      @{profile.username}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={getRoleBadgeClass(
                          profile.role
                        )}
                      >
                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                        {roleLabel}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={getStatusBadgeClass(
                          profile.status
                        )}
                      >
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                        {profile.status
                          ?.replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) =>
                            c.toUpperCase()
                          )}
                      </Badge>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEditModal(true)
                      }
                    >
                      <PencilSimple className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ACCOUNT INFORMATION */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Basic information associated with this account.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-1">
                <InfoRow
                  icon={Envelope}
                  label="Email address"
                  value={profile.email || 'Not available'}
                />

                <Separator />

                <InfoRow
                  icon={UserCircle}
                  label="Username"
                  value={
                    profile.username
                      ? `@${profile.username}`
                      : 'Not available'
                  }
                />

                <Separator />

                <InfoRow
                  icon={ShieldCheck}
                  label="Role"
                  value={roleLabel}
                  valueClassName="text-foreground"
                />

                <Separator />

                <InfoRow
                  icon={Calendar}
                  label="Member since"
                  value={joinedDate}
                />
              </CardContent>
            </Card>

            {/* ACCOUNT STATUS */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Current state of your account and verification.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatusCard
                    icon={
                      profile.status === 'active'
                        ? CheckCircle
                        : XCircle
                    }
                    title="Account"
                    value={
                      profile.status === 'active'
                        ? 'Active'
                        : 'Inactive'
                    }
                    positive={
                      profile.status === 'active'
                    }
                  />

                  <StatusCard
                    icon={
                      profile.email_verified
                        ? CheckCircle
                        : XCircle
                    }
                    title="Email verification"
                    value={
                      profile.email_verified
                        ? 'Verified'
                        : 'Not verified'
                    }
                    positive={profile.email_verified}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* QUICK PROFILE */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Display name
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Username
                  </p>

                  <p className="mt-1 font-medium">
                    @{profile.username}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Access level
                  </p>

                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={getRoleBadgeClass(
                        profile.role
                      )}
                    >
                      {roleLabel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECURITY */}
            {isOwnProfile && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <LockKey
                        className="h-5 w-5"
                        weight="duotone"
                      />
                    </div>

                    <div>
                      <CardTitle>Security</CardTitle>

                      <CardDescription>
                        Manage your account access.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start py-3"
                    onClick={() =>
                      setPasswordModal(true)
                    }
                  >
                    <Key className="mr-3 h-4 w-4" />

                    <span className="flex flex-col items-start">
                      <span className="font-medium">
                        Change password
                      </span>

                      <span className="text-xs font-normal text-muted-foreground">
                        Update your account password
                      </span>
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start border-destructive/20 py-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <SignOut className="mr-3 h-4 w-4" />

                    <span className="flex flex-col items-start">
                      <span className="font-medium">
                        Sign out
                      </span>

                      <span className="text-xs font-normal text-destructive/70">
                        End your current session
                      </span>
                    </span>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* EDIT PROFILE */}
      {isOwnProfile && (
        <>
          <Dialog
            open={editModal}
            onOpenChange={setEditModal}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Edit Profile
                </DialogTitle>

                <DialogDescription>
                  Update the information displayed on your profile.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">
                    Full name
                  </Label>

                  <Input
                    id="profile-name"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>

                  <Input
                    value={
                      currentUser?.username || ''
                    }
                    disabled
                  />

                  <p className="text-xs text-muted-foreground">
                    Username cannot be changed here.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Email address</Label>

                  <Input
                    value={
                      currentUser?.email || ''
                    }
                    disabled
                  />

                  <p className="text-xs text-muted-foreground">
                    Contact an administrator to change your email.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    setEditModal(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile
                    ? 'Saving...'
                    : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* CHANGE PASSWORD */}
          <Dialog
            open={passwordModal}
            onOpenChange={setPasswordModal}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Change Password
                </DialogTitle>

                <DialogDescription>
                  Choose a strong password you don't use elsewhere.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                <PasswordField
                  id="current-password"
                  label="Current password"
                  value={
                    passwordData.current_password
                  }
                  onChange={(value) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      current_password: value,
                    }))
                  }
                />

                <PasswordField
                  id="new-password"
                  label="New password"
                  value={
                    passwordData.new_password
                  }
                  onChange={(value) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      new_password: value,
                    }))
                  }
                />

                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  value={
                    passwordData.confirm_password
                  }
                  onChange={(value) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirm_password: value,
                    }))
                  }
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPasswordModal(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword
                    ? 'Changing...'
                    : 'Change Password'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  valueClassName = '',
}) => {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon
          weight="duotone"
          className="h-5 w-5 text-muted-foreground"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        <p
          className={`mt-1 truncate font-medium ${valueClassName}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

const StatusCard = ({
  icon: Icon,
  title,
  value,
  positive,
}) => {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 font-semibold">
            {value}
          </p>
        </div>

        <Icon
          weight="duotone"
          className={`h-6 w-6 ${positive
              ? 'text-emerald-500'
              : 'text-muted-foreground'
            }`}
        />
      </div>
    </div>
  );
};

const PasswordField = ({
  id,
  label,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        type="password"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        autoComplete="new-password"
      />
    </div>
  );
};

export default ProfilePage;

