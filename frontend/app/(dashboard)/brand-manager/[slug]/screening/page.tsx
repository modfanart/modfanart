'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Loader2, Upload } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import {
  useGetScreeningRulesetsQuery,
  useGetStyleGuidesQuery,
  usePublishScreeningRulesetMutation,
  useUploadStyleGuideMutation,
} from '@/services/api/screeningApi';
import type {
  RulesetConfig,
  SensitivityLevel,
  StyleGuide,
  ViolationAction,
} from '@/services/types/screening';
import { useAuth } from '@/store/AuthContext';

/** The knobs this screen edits. The rest of the config (bands, hard-reject list) carries over. */
type EditableConfig = Pick<
  RulesetConfig,
  | 'enabled'
  | 'requireHumanReview'
  | 'notifyArtist'
  | 'confidenceThreshold'
  | 'authenticityFailAction'
  | 'autoRejectAI'
  | 'sensitivityLevel'
  | 'contentSafetyThreshold'
  | 'autoRejectThreshold'
  | 'autoApproveThreshold'
  | 'styleEnabled'
  | 'styleComplianceThreshold'
  | 'brandFitThreshold'
  | 'ipComplianceThreshold'
  | 'styleViolationAction'
>;

const EDITABLE_KEYS: Array<keyof EditableConfig> = [
  'enabled',
  'requireHumanReview',
  'notifyArtist',
  'confidenceThreshold',
  'authenticityFailAction',
  'autoRejectAI',
  'sensitivityLevel',
  'contentSafetyThreshold',
  'autoRejectThreshold',
  'autoApproveThreshold',
  'styleEnabled',
  'styleComplianceThreshold',
  'brandFitThreshold',
  'ipComplianceThreshold',
  'styleViolationAction',
];

/** Mirrors SENSITIVITY_SHIFT in the backend ruleset service. */
const SENSITIVITY_SHIFT: Record<SensitivityLevel, number> = {
  lenient: 0.1,
  balanced: 0,
  strict: -0.1,
  'very-strict': -0.2,
};

function pick(config: RulesetConfig): EditableConfig {
  return Object.fromEntries(EDITABLE_KEYS.map((key) => [key, config[key]])) as EditableConfig;
}

const percent = (fraction: number) => Math.round(fraction * 100);

export default function ScreeningSettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading } = useAuth();
  const brand = user?.brands?.find((candidate) => candidate.slug === slug) ?? user?.brands?.[0];

  if (loading) return <Skeleton className="m-6 h-96" />;

  if (!brand) {
    return (
      <Card className="m-6">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          AI screening settings are available to brand team members.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Screening</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How submissions to {brand.name}&apos;s contests are screened before they reach you. Every
          save publishes a new version; past verdicts keep the version they were judged under.
        </p>
      </div>

      <RulesetEditor brandId={brand.id} />
      <StyleGuides brandId={brand.id} />
    </div>
  );
}

function RulesetEditor({ brandId }: { brandId: string }) {
  const { data, isLoading, isError, refetch } = useGetScreeningRulesetsQuery(brandId);
  const [publish, { isLoading: isPublishing }] = usePublishScreeningRulesetMutation();
  const [form, setForm] = useState<EditableConfig | null>(null);
  const [errors, setErrors] = useState<Array<{ path: string; message: string }>>([]);

  const saved = useMemo(() => (data ? pick(data.effective_config) : null), [data]);

  useEffect(() => {
    if (saved) setForm(saved);
  }, [saved]);

  const changes = useMemo(() => {
    if (!form || !saved) return {};
    return Object.fromEntries(
      EDITABLE_KEYS.filter((key) => form[key] !== saved[key]).map((key) => [key, form[key]])
    ) as Partial<EditableConfig>;
  }, [form, saved]);

  if (isLoading || (!form && !isError)) return <Skeleton className="h-96 w-full" />;

  if (isError || !data || !form) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-4 pt-6">
          <p className="text-sm">Unable to load the screening rules.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const set = <K extends keyof EditableConfig>(key: K, value: EditableConfig[K]) =>
    setForm((current) => (current ? { ...current, [key]: value } : current));

  const ownVersion = data.versions[0];
  const shift = SENSITIVITY_SHIFT[form.sensitivityLevel];
  const effective = (value: number) => percent(Math.min(1, Math.max(0.01, value + shift)));

  const save = async () => {
    setErrors([]);
    try {
      const result = await publish({ brand_id: brandId, config: changes }).unwrap();
      toast({ title: result.message });
    } catch (err) {
      const body = (err as { data?: { error?: string; details?: Array<{ path: string; message: string }> } })
        ?.data;
      setErrors(body?.details ?? []);
      toast({
        title: 'Could not publish the rules',
        description: body?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Screening rules</CardTitle>
            <CardDescription>
              {ownVersion
                ? `Version ${ownVersion.version}, published ${new Date(ownVersion.created_at).toLocaleString()}`
                : `Using the platform default (version ${data.effective_ruleset.version}). Saving creates your own rules.`}
            </CardDescription>
          </div>
          <Badge variant={form.enabled ? 'default' : 'secondary'}>
            {form.enabled ? 'Screening on' : 'Screening off'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <Section title="Review">
          <Toggle
            label="Screen submissions"
            hint="When off, nothing is checked and every submission goes to your review queue."
            checked={form.enabled}
            onChange={(value) => set('enabled', value)}
          />
          <Toggle
            label="Always require human review"
            hint="Even submissions that pass every check go to your review queue instead of being approved automatically."
            checked={form.requireHumanReview}
            onChange={(value) => set('requireHumanReview', value)}
          />
          <Toggle
            label="Notify artists"
            hint="Email and in-app notice when a submission is approved, rejected or waiting on review."
            checked={form.notifyArtist}
            onChange={(value) => set('notifyArtist', value)}
          />
        </Section>

        <Section title="Authenticity (AI detection)">
          <PercentSlider
            label="Minimum human-made confidence"
            hint="Below this (outside a small grey zone, which always goes to review) a submission counts as AI-generated."
            value={form.confidenceThreshold}
            min={30}
            max={95}
            step={5}
            onChange={(value) => set('confidenceThreshold', value)}
          />
          <ActionSelect
            label="When a submission looks AI-generated"
            value={form.authenticityFailAction}
            onChange={(value) => set('authenticityFailAction', value)}
          />
          <Toggle
            label="Reject anything the detector calls AI, outright"
            hint="Skips the confidence threshold and grey zone entirely."
            checked={form.autoRejectAI}
            onChange={(value) => set('autoRejectAI', value)}
          />
        </Section>

        <Section title="Content safety">
          <div className="space-y-2">
            <Label>Sensitivity</Label>
            <Select
              value={form.sensitivityLevel}
              onValueChange={(value) => set('sensitivityLevel', value as SensitivityLevel)}
            >
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lenient">Lenient</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="very-strict">Very strict</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Moves all three thresholds below together. In effect now: review at{' '}
              {effective(form.contentSafetyThreshold)}%, reject at {effective(form.autoRejectThreshold)}%,
              auto-approve under {effective(form.autoApproveThreshold)}%.
            </p>
          </div>
          <FractionSlider
            label="Send to review at"
            hint="Any content-safety category scoring at or above this goes to your review queue."
            value={form.contentSafetyThreshold}
            onChange={(value) => set('contentSafetyThreshold', value)}
          />
          <FractionSlider
            label="Reject automatically at"
            hint="Any category scoring at or above this is rejected without review."
            value={form.autoRejectThreshold}
            onChange={(value) => set('autoRejectThreshold', value)}
          />
          <FractionSlider
            label="Auto-approve only under"
            hint="Every category must score at or below this for automatic approval."
            value={form.autoApproveThreshold}
            onChange={(value) => set('autoApproveThreshold', value)}
          />
        </Section>

        <Section title="Style guide & IP">
          <Toggle
            label="Check against your style guide"
            hint="Needs a style guide below. Also scores the risk of third-party IP."
            checked={form.styleEnabled}
            onChange={(value) => set('styleEnabled', value)}
          />
          <FractionSlider
            label="Minimum style-guide adherence"
            value={form.styleComplianceThreshold}
            onChange={(value) => set('styleComplianceThreshold', value)}
          />
          <FractionSlider
            label="Minimum brand fit"
            value={form.brandFitThreshold}
            onChange={(value) => set('brandFitThreshold', value)}
          />
          <FractionSlider
            label="IP compliance required"
            hint={`Tolerates an IP-risk score up to ${100 - percent(form.ipComplianceThreshold)}%.`}
            value={form.ipComplianceThreshold}
            onChange={(value) => set('ipComplianceThreshold', value)}
          />
          <ActionSelect
            label="When a submission breaks the style guide"
            value={form.styleViolationAction}
            onChange={(value) => set('styleViolationAction', value)}
          />
        </Section>

        {errors.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
            {errors.map((error) => (
              <li key={`${error.path}-${error.message}`}>
                {error.path}: {error.message}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {Object.keys(changes).length
              ? `${Object.keys(changes).length} unpublished change(s)`
              : 'No changes'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!Object.keys(changes).length || isPublishing}
              onClick={() => setForm(saved)}
            >
              Discard
            </Button>
            <Button disabled={!Object.keys(changes).length || isPublishing} onClick={save}>
              {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish version {(ownVersion?.version ?? 0) + 1}
            </Button>
          </div>
        </div>

        {data.versions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Version history</h3>
            <ul className="divide-y rounded-md border text-sm">
              {data.versions.map((version) => (
                <li key={version.id} className="flex justify-between px-3 py-2">
                  <span>Version {version.version}</span>
                  <span className="text-muted-foreground">
                    {new Date(version.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StyleGuides({ brandId }: { brandId: string }) {
  const { data, isLoading } = useGetStyleGuidesQuery(brandId);
  const [upload, { isLoading: isUploading }] = useUploadStyleGuideMutation();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');

  const guides = data?.style_guides ?? [];
  const active = guides.find((guide) => guide.parse_status === 'parsed');

  const submit = async () => {
    try {
      const result = await upload(
        file ? { brand_id: brandId, file } : { brand_id: brandId, source_text: text.trim() }
      ).unwrap();
      toast({
        title: result.message,
        ...(result.style_guide.parse_error ? { description: result.style_guide.parse_error } : {}),
        ...(result.style_guide.parse_status === 'failed' ? { variant: 'destructive' as const } : {}),
      });
      setFile(null);
      setText('');
    } catch (err) {
      const apiError = (err as { data?: { error?: string } } | undefined)?.data?.error;
      toast({
        title: 'Upload failed',
        description: apiError || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Style guide</CardTitle>
        <CardDescription>
          Compiled once into checkable rules, then used for every submission. The newest guide that
          compiled is the one in force.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : active ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              In force since {new Date(active.updated_at).toLocaleString()}
            </p>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
              {active.prompt_block}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No style guide yet, so the style and IP check is skipped for your submissions.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="style-guide-file">Upload a PDF</Label>
            <Input
              id="style-guide-file"
              type="file"
              accept="application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="style-guide-text">…or paste the rules</Label>
            <Textarea
              id="style-guide-text"
              rows={4}
              value={text}
              disabled={Boolean(file)}
              onChange={(event) => setText(event.target.value)}
              placeholder={'No pink\nThe hero must wear the red jacket'}
            />
          </div>
        </div>

        <Button disabled={isUploading || (!file && !text.trim())} onClick={submit}>
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload and compile
        </Button>

        {guides.length > 0 && (
          <ul className="divide-y rounded-md border text-sm">
            {guides.map((guide) => (
              <StyleGuideRow key={guide.id} guide={guide} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function StyleGuideRow({ guide }: { guide: StyleGuide }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
      <span className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        {guide.source_file_url ? (
          <a href={guide.source_file_url} target="_blank" rel="noopener noreferrer" className="underline">
            PDF upload
          </a>
        ) : (
          'Pasted text'
        )}
        <span className="text-muted-foreground">{new Date(guide.created_at).toLocaleString()}</span>
      </span>
      <span className="flex items-center gap-2">
        {guide.parse_error && <span className="text-xs text-red-700">{guide.parse_error}</span>}
        <Badge
          variant={guide.parse_status === 'parsed' ? 'default' : guide.parse_status === 'failed' ? 'destructive' : 'secondary'}
        >
          {guide.parse_status}
        </Badge>
      </span>
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <Label>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PercentSlider({
  label,
  hint,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-4">
        <Label>{label}</Label>
        <span className="text-sm tabular-nums">{value}%</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => next !== undefined && onChange(next)}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** A 0-1 threshold shown and edited as a percentage. */
function FractionSlider({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <PercentSlider
      label={label}
      {...(hint ? { hint } : {})}
      value={percent(value)}
      onChange={(next) => onChange(next / 100)}
    />
  );
}

function ActionSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ViolationAction;
  onChange: (value: ViolationAction) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(next) => onChange(next as ViolationAction)}>
        <SelectTrigger className="w-60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="flag">Send to review</SelectItem>
          <SelectItem value="reject">Reject automatically</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
