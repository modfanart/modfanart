// components/settings/AccountSection.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AccountSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage language, timezone, and account actions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-2">
        <div className="space-y-4">
          <h4 className="font-medium">Preferred Language</h4>
          <Select defaultValue="en">
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Changes will apply to the interface and emails.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Timezone</h4>
          <Select defaultValue="Asia/Kolkata">
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">IST (Indian Standard Time) — Delhi</SelectItem>
              <SelectItem value="America/Los_Angeles">PST (Pacific Time)</SelectItem>
              <SelectItem value="Europe/London">GMT (London)</SelectItem>
              <SelectItem value="Asia/Tokyo">JST (Tokyo)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Used for timestamps, notifications, and scheduling.
          </p>
        </div>

        <div className="pt-6 border-t space-y-4">
          <h4 className="font-medium text-destructive">Danger Zone</h4>
          <div className="space-y-2">
            <Button variant="destructive">Delete Account</Button>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
