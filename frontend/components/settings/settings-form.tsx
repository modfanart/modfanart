'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

// ── shadcn/ui components ─────────────────────────────────────────
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils'; // shadcn cn utility

// ── Profile form schema ──────────────────────────────────────────
const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .max(30, { message: 'Username must not be longer than 30 characters.' }),
  email: z
    .string()
    .min(1, { message: 'This field cannot be empty.' })
    .email('This is not a valid email.'),
  bio: z.string().max(160, 'Bio must not exceed 160 characters.').min(4),
  urls: z
    .object({
      twitter: z.string().url({ message: 'Please enter a valid URL.' }).optional(),
      github: z.string().url({ message: 'Please enter a valid URL.' }).optional(),
    })
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// ── Main Settings Component ──────────────────────────────────────
export function SettingsForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get('tab') || 'profile';

  // ── Change tab (updates URL) ───────────────────────────────────
  const setTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'profile') {
        params.delete('tab'); // optional: clean URL when default
      } else {
        params.set('tab', tab);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // ── Profile form setup ─────────────────────────────────────────
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: 'joe',
      email: 'joe@example.com',
      bio: "I'm an artist specializing in fan art and original creations.",
    },
    mode: 'onChange',
  });

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: 'Profile updated',
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 text-white">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  // ── Menu items ─────────────────────────────────────────────────
  const menuItems = [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'billing', label: 'Billing' },
    { id: 'api', label: 'API' },
  ] as const;

  type TabId = (typeof menuItems)[number]['id'];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* ── Vertical Sidebar ───────────────────────────────────── */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-6 border rounded-lg bg-card p-4 shadow-sm">
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'flex items-center justify-start whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    currentTab === item.id
                      ? 'bg-secondary text-secondary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    'min-w-[100px] md:min-w-0'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Content Area ───────────────────────────────────────── */}
        <main className="flex-1 space-y-8">
          <header>
            <h1 className="text-3xl font-bold capitalize tracking-tight">{currentTab}</h1>
            <p className="text-muted-foreground mt-1">
              Manage your {currentTab.toLowerCase()} settings
            </p>
          </header>

          {/* ── PROFILE ────────────────────────────────────────────── */}
          {currentTab === 'profile' && (
            <div className="space-y-10">
              {/* Avatar section */}
              <section className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" alt="Profile picture" />
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      Change picture
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Remove
                    </Button>
                  </div>
                </div>
              </section>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="yourusername" {...field} />
                        </FormControl>
                        <FormDescription>This is your public display name.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Used for notifications and account recovery.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a little about yourself..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Max 160 characters. Markdown supported.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">Save changes</Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* ── NOTIFICATIONS ──────────────────────────────────────── */}
          {currentTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive and how.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="all-notifications" className="font-medium">
                      All notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Includes emails, in-app and push
                    </p>
                  </div>
                  <Switch id="all-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">
                      Email notifications
                    </Label>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="font-medium">
                      Push notifications
                    </Label>
                  </div>
                  <Switch id="push-notifications" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── SECURITY ───────────────────────────────────────────── */}
          {currentTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage password, 2FA and connected devices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button variant="outline">Enable 2FA</Button>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with an authenticator app or security key.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Password</h4>
                  <Button variant="outline">Change password</Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Active sessions</h4>
                  <p className="text-sm text-muted-foreground">
                    You’ll see a list of devices and locations here once implemented.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── BILLING ────────────────────────────────────────────── */}
          {currentTab === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>
                  Manage subscription, payment methods and invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Current Plan</h4>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-semibold">Pro Plan</p>
                      <p className="text-sm text-muted-foreground">$29 / month</p>
                    </div>
                    <Button variant="outline">Change plan</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Payment Method</h4>
                  <Button variant="outline">Update payment method</Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Billing history</h4>
                  <p className="text-sm text-muted-foreground">No invoices yet.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── API ────────────────────────────────────────────────── */}
          {currentTab === 'api' && (
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Create and manage API keys to use the MOD Platform programmatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between py-6">
                  <div>
                    <h4 className="font-medium">Active API Keys</h4>
                    <p className="text-sm text-muted-foreground">
                      You currently have no active API keys.
                    </p>
                  </div>
                  <Button>Generate new key</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── ACCOUNT ────────────────────────────────────────────── */}
          {currentTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Language, timezone, and dangerous actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Language</h4>
                  <select className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Hindi</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Timezone</h4>
                  <select className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+5:30 (India Standard Time)</option>
                  </select>
                </div>

                <div className="pt-6 border-t">
                  <Button variant="destructive">Delete Account</Button>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fallback for invalid tab */}
          {!menuItems.some((item) => item.id === currentTab) && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-lg">Invalid section</p>
                <p>Please choose an option from the menu.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
