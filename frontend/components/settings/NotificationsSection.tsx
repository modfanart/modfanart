// components/settings/NotificationsSection.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function NotificationsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose what notifications you receive and how you receive them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="all-notifs" className="font-medium">
              All Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Includes in-app, email, and push notifications
            </p>
          </div>
          <Switch id="all-notifs" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifs" className="font-medium">
              Email Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Daily/weekly digests and important updates
            </p>
          </div>
          <Switch id="email-notifs" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifs" className="font-medium">
              Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">Real-time alerts on browser/mobile</p>
          </div>
          <Switch id="push-notifs" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing" className="font-medium">
              Marketing & Promotional Emails
            </Label>
            <p className="text-sm text-muted-foreground">New features, tips, and special offers</p>
          </div>
          <Switch id="marketing" defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}
