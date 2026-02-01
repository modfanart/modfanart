// components/settings/SecuritySection.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SecuritySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Manage your password, two-factor authentication, and sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-2">
        <div className="space-y-4">
          <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
          <div className="flex items-center gap-4 flex-wrap">
            <Button variant="outline">Enable 2FA</Button>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security with an authenticator app or security key.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Change Password</h4>
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input id="new" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" type="password" />
            </div>
            <Button className="w-fit">Update Password</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Active Sessions</h4>
          <p className="text-sm text-muted-foreground">
            No other active sessions detected. (Device list coming soon)
          </p>
          {/* You can later show a table of sessions with "Log out" buttons */}
        </div>
      </CardContent>
    </Card>
  );
}
