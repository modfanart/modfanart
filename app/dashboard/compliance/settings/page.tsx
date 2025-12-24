'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Bot, XCircle, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DashboardShell } from '@/components/dashboard-shell';

export default function ComplianceSettingsPage() {
  const router = useRouter();

  const [settings, setSettings] = useState({
    notifyOnRejection: true,
    notifyOnApproval: true,
    notifyOnAIDetection: true,
    emailTemplates: {
      rejection:
        'Dear {{artist}},\n\nUnfortunately, your submission "{{title}}" has been rejected due to compliance issues with our brand guidelines.\n\nReason: {{reason}}\n\nPlease review our guidelines and consider submitting a revised version.\n\nBest regards,\n{{brand}}',
      approval:
        'Dear {{artist}},\n\nCongratulations! Your submission "{{title}}" has been approved and is now available for licensing.\n\nThank you for your contribution.\n\nBest regards,\n{{brand}}',
      aiDetection:
        'Dear {{artist}},\n\nYour submission "{{title}}" has been flagged as potentially AI-generated content. Our platform only accepts human-created artwork.\n\nIf you believe this is an error, please contact our support team.\n\nBest regards,\n{{brand}}',
    },
    reviewerEmails: ['compliance@example.com', 'legal@example.com'],
    apiKeys: {
      aiornot:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRmYWIzMGNjLWI0NjktNGRjYS05OWVmLTllZjViYmVmNTZmYyIsInVzZXJfaWQiOiJkZmFiMzBjYy1iNDY5LTRkY2EtOTllZi05ZWY1YmJlZjU2ZmMiLCJhdWQiOiJhY2Nlc3MiLCJleHAiOjAuMH0.KoGvysGDtSuxfnxwL_QQ5NHE01hInWYyYx0yl0wRM-w',
      openai:
        'sk-proj-GghCXhHvPqZPs59horHY_qNw0quljb5q4vgK1Z5WV9z1U6ldcPPPiDt2puaX_Vp4AMYWZw7EfYT3BlbkFJ8rCGk-UZrIrUiA6_Fak3VeGepV2gn36Voh38WjkLJHMd_3fycfckOiY5325ySldLJfIOyJEkA',
    },
  });

  const handleSave = () => {
    // In a real app, this would save to a database
    console.log('Saving compliance settings:', settings);
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
          <h1 className="text-2xl font-bold tracking-tight">Compliance Settings</h1>
          <p className="text-muted-foreground">
            Configure general settings for the compliance system
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure email notifications for compliance events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-rejection">Notify on Rejection</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notification to artists when submissions are rejected
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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-approval">Notify on Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notification to artists when submissions are approved
                </p>
              </div>
              <Switch
                id="notify-approval"
                checked={settings.notifyOnApproval}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifyOnApproval: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-ai">Notify on AI Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notification to artists when submissions are flagged as AI-generated
                </p>
              </div>
              <Switch
                id="notify-ai"
                checked={settings.notifyOnAIDetection}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifyOnAIDetection: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewer-emails">Compliance Reviewer Emails</Label>
              <div className="space-y-2">
                {settings.reviewerEmails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={email}
                      onChange={(e) => {
                        const updatedEmails = [...settings.reviewerEmails];
                        updatedEmails[index] = e.target.value;
                        setSettings({ ...settings, reviewerEmails: updatedEmails });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedEmails = [...settings.reviewerEmails];
                        updatedEmails.splice(index, 1);
                        setSettings({ ...settings, reviewerEmails: updatedEmails });
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      reviewerEmails: [...settings.reviewerEmails, ''],
                    });
                  }}
                >
                  Add Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Email Templates
            </CardTitle>
            <CardDescription>Customize email notification templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rejection-template">Rejection Email Template</Label>
              <Textarea
                id="rejection-template"
                value={settings.emailTemplates.rejection}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailTemplates: {
                      ...settings.emailTemplates,
                      rejection: e.target.value,
                    },
                  })
                }
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {'{{artist}}'}, {'{{title}}'}, {'{{reason}}'}, {'{{brand}}'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approval-template">Approval Email Template</Label>
              <Textarea
                id="approval-template"
                value={settings.emailTemplates.approval}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailTemplates: {
                      ...settings.emailTemplates,
                      approval: e.target.value,
                    },
                  })
                }
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {'{{artist}}'}, {'{{title}}'}, {'{{brand}}'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-template">AI Detection Email Template</Label>
              <Textarea
                id="ai-template"
                value={settings.emailTemplates.aiDetection}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailTemplates: {
                      ...settings.emailTemplates,
                      aiDetection: e.target.value,
                    },
                  })
                }
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {'{{artist}}'}, {'{{title}}'}, {'{{brand}}'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>Configure API keys for AI services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="aiornot-key">AIORNOT API Key</Label>
              <Input
                id="aiornot-key"
                type="password"
                value={settings.apiKeys.aiornot}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiKeys: {
                      ...settings.apiKeys,
                      aiornot: e.target.value,
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Used for AI detection in artwork submissions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                value={settings.apiKeys.openai}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiKeys: {
                      ...settings.apiKeys,
                      openai: e.target.value,
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Used for automated review of submissions against brand guidelines
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
