'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Bot, AlertTriangle, Info, Sliders, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DashboardShell } from '@/components/dashboard-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';

export default function AutomatedReviewPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<{
    enabled: boolean;
    strictness: number;
    autoApproveCompliant: boolean;
    autoRejectNonCompliant: boolean;
    requireHumanReview: boolean;
    notifyOnRejection: boolean;
    checkCharacterAccuracy: boolean;
    checkStyleConsistency: boolean;
    checkProhibitedContent: boolean;
    customPrompt: string;
  }>({
    enabled: true,
    strictness: 70,
    autoApproveCompliant: true,
    autoRejectNonCompliant: false,
    requireHumanReview: true,
    notifyOnRejection: true,
    checkCharacterAccuracy: true,
    checkStyleConsistency: true,
    checkProhibitedContent: true,
    customPrompt:
      'Review this fan art submission and determine if it complies with the brand guidelines. Check for prohibited content, character accuracy, and style consistency.',
  });
  const handleSave = () => {
    // In a real app, this would save to a database
    console.log('Saving automated review settings:', settings);
    // Show success message and redirect
    router.push('/dashboard/compliance');
  };

  return (
    <DashboardShell>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/compliance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automated Review Settings</h1>
          <p className="text-muted-foreground">
            Configure how submissions are automatically reviewed for brand guideline compliance
          </p>
        </div>
      </div>

      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>About Automated Review</AlertTitle>
        <AlertDescription>
          Our platform uses OpenAI to automatically review submissions for compliance with your
          brand guidelines. This helps streamline the approval process and ensures consistent
          enforcement of your rules.
        </AlertDescription>
      </Alert>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              Automated Review Settings
            </CardTitle>
            <CardDescription>Configure how submissions are automatically reviewed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-review">Enable Automated Review</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically review submissions for compliance with brand guidelines
                </p>
              </div>
              <Switch
                id="auto-review"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="strictness">Review Strictness: {settings.strictness}%</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.strictness < 50
                    ? 'Lenient'
                    : settings.strictness < 75
                    ? 'Moderate'
                    : settings.strictness < 90
                    ? 'Strict'
                    : 'Very Strict'}
                </span>
              </div>
              <Slider
                id="strictness"
                min={30}
                max={95}
                step={5}
                value={[settings.strictness]}
                onValueChange={(value) => setSettings({ ...settings, strictness: value[0] })}
              />
              <p className="text-sm text-muted-foreground">
                Set how strictly the guidelines are enforced. Higher values mean stricter
                enforcement.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="custom-prompt">Custom Review Prompt</Label>
              <Textarea
                id="custom-prompt"
                value={settings.customPrompt}
                onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Customize the prompt sent to the AI for reviewing submissions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Compliance Checks
            </CardTitle>
            <CardDescription>
              Configure which aspects of your guidelines are checked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="check-character">Character Accuracy</Label>
                <p className="text-sm text-muted-foreground">
                  Check if characters are portrayed accurately according to guidelines
                </p>
              </div>
              <Switch
                id="check-character"
                checked={settings.checkCharacterAccuracy}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, checkCharacterAccuracy: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="check-style">Style Consistency</Label>
                <p className="text-sm text-muted-foreground">
                  Check if the artistic style is consistent with brand guidelines
                </p>
              </div>
              <Switch
                id="check-style"
                checked={settings.checkStyleConsistency}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, checkStyleConsistency: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="check-prohibited">Prohibited Content</Label>
                <p className="text-sm text-muted-foreground">
                  Check for prohibited content defined in your guidelines
                </p>
              </div>
              <Switch
                id="check-prohibited"
                checked={settings.checkProhibitedContent}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, checkProhibitedContent: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sliders className="mr-2 h-5 w-5" />
              Response Actions
            </CardTitle>
            <CardDescription>Configure how the system responds to review results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-approve">Auto-Approve Compliant Submissions</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve submissions that pass all compliance checks
                </p>
              </div>
              <Switch
                id="auto-approve"
                checked={settings.autoApproveCompliant}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoApproveCompliant: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-reject">Auto-Reject Non-Compliant Submissions</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically reject submissions that fail compliance checks
                </p>
              </div>
              <Switch
                id="auto-reject"
                checked={settings.autoRejectNonCompliant}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoRejectNonCompliant: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="human-review">Require Human Review for Edge Cases</Label>
                <p className="text-sm text-muted-foreground">
                  Flag submissions with borderline compliance for human review
                </p>
              </div>
              <Switch
                id="human-review"
                checked={settings.requireHumanReview}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requireHumanReview: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-rejection">Notify Artists on Rejection</Label>
                <p className="text-sm text-muted-foreground">
                  Send detailed feedback to artists when submissions are rejected
                </p>
              </div>
              <Switch
                id="notify-rejection"
                checked={settings.notifyOnRejection}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifyOnRejection: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                The automated review system works best when your brand guidelines are clear and
                specific. Make sure to update your guidelines with detailed information about:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-sm">
                <li>Character appearances and personalities</li>
                <li>Prohibited content and themes</li>
                <li>Style requirements and artistic direction</li>
                <li>Logo usage and brand elements</li>
              </ul>
              <p className="text-sm">
                While our AI is highly accurate, we recommend human review for critical decisions,
                especially when first setting up the system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </DashboardShell>
  );
}
