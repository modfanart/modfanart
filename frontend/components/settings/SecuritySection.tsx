'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

// Import your API hooks (add these endpoints to userApi.ts)
import {
  useChangePasswordMutation,
  // useEnable2FAMutation, useDisable2FAMutation, useGetSessionsQuery, etc.
} from '@/services/api/userApi';

// ── Password change schema ───────────────────────────────────────────────
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SecuritySection() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });

      form.reset();
    } catch (err: any) {
      toast({
        title: 'Failed to update password',
        description: err?.data?.message || 'Please check your current password and try again.',
        variant: 'destructive',
      });
    }
  };

  // Placeholder states — replace with real API data later
  const twoFactorEnabled = false; // ← fetch from user query
  const activeSessions = 1; // ← you can fetch real sessions later

  return (
    <div className="space-y-10">
      {/* 2FA Section */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to protect your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-medium">
                Status:{' '}
                <span className={twoFactorEnabled ? 'text-green-600' : 'text-amber-600'}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {twoFactorEnabled
                  ? '2FA is protecting your account with an authenticator app.'
                  : 'Protect your account with 2FA using an authenticator app or security key.'}
              </p>
            </div>

            <Button
              variant={twoFactorEnabled ? 'destructive' : 'default'}
              onClick={() => {
                // TODO: Open setup/disable modal or wizard
                toast({
                  title: twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA',
                  description: 'This feature is coming soon.',
                });
              }}
              disabled
            >
              {twoFactorEnabled ? 'Disable 2FA' : 'Set up 2FA'}
            </Button>
          </div>

          {twoFactorEnabled && (
            <div className="text-sm text-muted-foreground border-t pt-4">
              <p>Recovery codes saved? Store them securely.</p>
              <Button variant="link" className="px-0 h-auto text-sm">
                View / regenerate recovery codes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isChangingPassword || !form.formState.isDirty}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Active Sessions (placeholder — expand later) */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices and sessions currently logged into your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">
                  This device • Last active now • India
                </p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                Active now
              </span>
            </div>

            <p className="text-sm text-muted-foreground italic">
              No other active sessions detected.
            </p>

            {/* Example of future session list:
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Chrome on Windows</p>
                <p className="text-sm text-muted-foreground">
                  New York, USA • Last active 2 days ago
                </p>
              </div>
              <Button variant="destructive" size="sm">Log out</Button>
            </div> */}

            <div className="pt-4">
              <Button variant="outline" size="sm" disabled>
                Log out all other sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
