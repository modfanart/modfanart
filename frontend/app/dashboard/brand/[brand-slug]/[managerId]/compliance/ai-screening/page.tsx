'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Bot,
  AlertTriangle,
  Info,
  Sliders,
  BarChart3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { DashboardShell } from '@/components/dashboard-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AIScreeningPage() {
  const router = useRouter();

  const [settings, setSettings] = useState({
    enabled: true,
    confidenceThreshold: 75,
    autoRejectAI: true,
    notifyArtist: true,
    requireHumanReview: false,
    sensitivityLevel: 'balanced',
    allowedAITools: ['Stable Diffusion', 'Midjourney'],
    customPrompt:
      'Analyze this artwork and determine if it was created by AI or a human artist. Consider brush strokes, details, and overall composition.',
  });

  const handleSave = () => {
    // In a real app, this would save to a database
    console.log('Saving AI screening settings:', settings);
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
          <h1 className="text-2xl font-bold tracking-tight">AI Screening Configuration</h1>
          <p className="text-muted-foreground">
            Configure how AI-generated content is detected and handled
          </p>
        </div>
      </div>

      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>About AI Screening</AlertTitle>
        <AlertDescription>
          Our platform uses AIORNOT API to detect AI-generated artwork with high accuracy. Configure
          your preferences below to determine how AI content is handled.
        </AlertDescription>
      </Alert>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              AI Detection Settings
            </CardTitle>
            <CardDescription>Configure how AI-generated content is detected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-detection">Enable AI Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Screen all submissions for AI-generated content
                </p>
              </div>
              <Switch
                id="ai-detection"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="confidence-threshold">
                  AI Confidence Threshold: {settings.confidenceThreshold}%
                </Label>
                <span className="text-sm text-muted-foreground">
                  {settings.confidenceThreshold < 50
                    ? 'Lenient'
                    : settings.confidenceThreshold < 75
                      ? 'Moderate'
                      : settings.confidenceThreshold < 90
                        ? 'Strict'
                        : 'Very Strict'}
                </span>
              </div>
              <Slider
                id="confidence-threshold"
                min={30}
                max={95}
                step={5}
                value={[settings.confidenceThreshold]} // This is fine — it's a number
                onValueChange={(value) => {
                  // value is number[], and it will always have at least one element
                  // But to satisfy TypeScript, use non-null assertion or default
                  setSettings({ ...settings, confidenceThreshold: value[0] ?? 75 });
                }}
              />
              <p className="text-sm text-muted-foreground">
                Set the confidence level required to flag content as AI-generated. Higher values
                mean fewer false positives but might miss some AI art.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="sensitivity">Detection Sensitivity</Label>
              <Select
                value={settings.sensitivityLevel}
                onValueChange={(value) => setSettings({ ...settings, sensitivityLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sensitivity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lenient">Lenient - Allow more AI content</SelectItem>
                  <SelectItem value="balanced">Balanced - Default setting</SelectItem>
                  <SelectItem value="strict">Strict - Catch most AI content</SelectItem>
                  <SelectItem value="very-strict">Very Strict - Minimize AI content</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Adjust the overall sensitivity of the AI detection system
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="custom-prompt">Custom Detection Prompt</Label>
              <Input
                id="custom-prompt"
                value={settings.customPrompt}
                onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Customize the prompt sent to the AI detection system for analysis
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sliders className="mr-2 h-5 w-5" />
              Response Actions
            </CardTitle>
            <CardDescription>
              Configure how the system responds to detected AI content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-reject">Auto-Reject AI Content</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically reject submissions detected as AI-generated
                </p>
              </div>
              <Switch
                id="auto-reject"
                checked={settings.autoRejectAI}
                onCheckedChange={(checked) => setSettings({ ...settings, autoRejectAI: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-artist">Notify Artist</Label>
                <p className="text-sm text-muted-foreground">
                  Send notification to artist when their work is flagged as AI-generated
                </p>
              </div>
              <Switch
                id="notify-artist"
                checked={settings.notifyArtist}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyArtist: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="human-review">Require Human Review</Label>
                <p className="text-sm text-muted-foreground">
                  Flag AI-detected submissions for human review before final decision
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Allowed AI Tools
            </CardTitle>
            <CardDescription>
              Configure which AI tools are acceptable in your submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Optional Configuration</AlertTitle>
              <AlertDescription>
                If you want to allow some AI-assisted tools but not others, configure them here.
                Leave empty to reject all AI-generated content.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Allowed AI Tools</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Add allowed AI tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
                  <SelectItem value="midjourney">Midjourney</SelectItem>
                  <SelectItem value="dall-e">DALL-E</SelectItem>
                  <SelectItem value="photoshop-generative-fill">
                    Photoshop Generative Fill
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {settings.allowedAITools.map((tool, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span>{tool}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedTools = [...settings.allowedAITools];
                      updatedTools.splice(index, 1);
                      setSettings({ ...settings, allowedAITools: updatedTools });
                    }}
                    className="h-8 w-8 p-0 text-muted-foreground"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Test Detection
            </CardTitle>
            <CardDescription>Test the AI detection system with sample images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-lg border border-dashed p-4">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Bot className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Upload a test image</p>
                    <p className="text-xs text-muted-foreground">
                      Upload an image to test the AI detection system
                    </p>
                  </div>
                  <Button size="sm">Upload Image</Button>
                </div>
              </div>
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
