import React, { useState } from 'react';
import { ArrowClockwise, WarningCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { Slider } from '../../components/ui/slider';
import { Switch } from '../../components/ui/switch';

import {
  useGetRulesetsQuery,
  usePublishRulesetMutation,
} from '../../services/api/screeningApi';

import { formatDateTime, formatPercent, getApiErrorMessage } from './format';

// ────────────────────────────────────────────────
// Field definitions
//
// Keys are the backend ruleset config names (which mirror the frontend compliance UI). The
// sensitivity shifts match `moderationThresholds` in backend ruleset.service.js.
// ────────────────────────────────────────────────

const SENSITIVITY_SHIFT = {
  lenient: 0.1,
  balanced: 0,
  strict: -0.1,
  'very-strict': -0.2,
};

const FLAG_OR_REJECT = [
  ['flag', 'Flag for human review'],
  ['reject', 'Reject automatically'],
];

/** How a content-safety threshold is actually applied once sensitivity shifts it. */
const shiftedHint = (value, values) => {
  const shift = SENSITIVITY_SHIFT[values.sensitivityLevel] ?? 0;

  if (!shift) return null;

  const applied = Math.min(1, Math.max(0.01, value + shift));

  return `Applied as ${applied.toFixed(2)} at ${values.sensitivityLevel.replace('-', ' ')} sensitivity`;
};

const SECTIONS = [
  {
    title: 'General',
    fields: [
      {
        key: 'enabled',
        type: 'switch',
        label: 'Screening enabled',
        help: 'When off, no AI checks run and every submission waits for a human.',
      },
      {
        key: 'requireHumanReview',
        type: 'switch',
        label: 'Always require human review',
        help: 'Never auto-approve. Clean submissions still land in the review queue.',
      },
      {
        key: 'notifyArtist',
        type: 'switch',
        label: 'Notify the artist',
        help: 'Tell the artist when their submission is approved or rejected.',
      },
    ],
  },
  {
    title: 'Authenticity',
    fields: [
      {
        key: 'confidenceThreshold',
        type: 'percent',
        min: 30,
        max: 95,
        step: 5,
        label: 'Minimum human-authenticity confidence',
        hint: (value, values, config) => {
          const margin = config.authenticityBorderlineMargin ?? 0.05;
          const low = Math.max(0, value / 100 - margin);
          const high = Math.min(1, value / 100 + margin);

          return `Scores between ${formatPercent(low)} and ${formatPercent(high)} are borderline and always go to a human.`;
        },
      },
      {
        key: 'authenticityFailAction',
        type: 'select',
        label: 'When authenticity fails',
        options: FLAG_OR_REJECT,
      },
      {
        key: 'autoRejectAI',
        type: 'switch',
        label: 'Reject any AI verdict outright',
        help: 'Skips the confidence bands: anything the detector calls AI is rejected.',
      },
    ],
  },
  {
    title: 'Content safety',
    fields: [
      {
        key: 'sensitivityLevel',
        type: 'select',
        label: 'Sensitivity',
        help: 'Shifts the three thresholds below together: lenient +0.10, balanced 0, strict −0.10, very strict −0.20.',
        options: [
          ['lenient', 'Lenient'],
          ['balanced', 'Balanced'],
          ['strict', 'Strict'],
          ['very-strict', 'Very strict'],
        ],
      },
      {
        key: 'contentSafetyThreshold',
        type: 'fraction',
        label: 'Flag for review when any category score is at or above',
        hint: shiftedHint,
      },
      {
        key: 'autoRejectThreshold',
        type: 'fraction',
        label: 'Reject when any category score is at or above',
        hint: shiftedHint,
      },
      {
        key: 'autoApproveThreshold',
        type: 'fraction',
        label: 'Auto-approve only when every score is at or below',
        hint: shiftedHint,
      },
    ],
  },
  {
    title: 'Style & IP',
    fields: [
      {
        key: 'styleEnabled',
        type: 'switch',
        label: 'Check against the brand style guide',
        help: 'Only applies to artwork with brand context and an uploaded style guide.',
      },
      {
        key: 'styleComplianceThreshold',
        type: 'fraction',
        label: 'Minimum style-guide adherence',
      },
      {
        key: 'brandFitThreshold',
        type: 'fraction',
        label: 'Minimum brand fit',
      },
      {
        key: 'ipComplianceThreshold',
        type: 'fraction',
        label: 'IP compliance',
        hint: value => `Maximum tolerated IP risk: ${formatPercent(1 - value)}`,
      },
      {
        key: 'styleViolationAction',
        type: 'select',
        label: 'When style or IP checks fail',
        options: FLAG_OR_REJECT,
      },
    ],
  },
];

const FIELD_KEYS = SECTIONS.flatMap(section => section.fields.map(f => f.key));

/** `details: [{ path, message }]` from a 400 → `{ [path]: message }`. */
const getFieldErrors = error => {
  const details = Array.isArray(error?.data?.details) ? error.data.details : [];

  return details.reduce((errors, { path, message }) => {
    const key = path || 'config';
    errors[key] = errors[key] ? `${errors[key]}; ${message}` : message;
    return errors;
  }, {});
};

// ────────────────────────────────────────────────
// Field controls
// ────────────────────────────────────────────────

const FieldControl = ({ field, value, onChange }) => {
  const id = `ruleset-${field.key}`;

  if (field.type === 'switch') {
    return <Switch id={id} checked={!!value} onCheckedChange={onChange} />;
  }

  if (field.type === 'select') {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full border-zinc-800 sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {field.options.map(([optionValue, label]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const isPercent = field.type === 'percent';

  return (
    <div className="flex w-full items-center gap-3 sm:w-72">
      <Slider
        id={id}
        aria-label={field.label}
        min={isPercent ? field.min : 0}
        max={isPercent ? field.max : 1}
        step={isPercent ? field.step : 0.01}
        value={[typeof value === 'number' ? value : 0]}
        onValueChange={([next]) => onChange(next)}
      />
      <span className="w-12 shrink-0 text-right font-mono text-sm text-white">
        {isPercent ? `${value}%` : Number(value).toFixed(2)}
      </span>
    </div>
  );
};

const FieldRow = ({ field, value, values, config, error, onChange }) => {
  const hint = field.hint?.(value, values, config) || field.help;

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={`ruleset-${field.key}`} className="text-zinc-200">
          {field.label}
        </Label>
        {hint && <p className="text-xs text-zinc-500">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <FieldControl field={field} value={value} onChange={onChange} />
    </div>
  );
};

// ────────────────────────────────────────────────
// Form — keyed by ruleset id, so a newly published version resets it
// ────────────────────────────────────────────────

const RulesetForm = ({ config }) => {
  const initialValues = Object.fromEntries(
    FIELD_KEYS.map(key => [key, config[key]])
  );

  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [publishRuleset, { isLoading }] = usePublishRulesetMutation();

  const changedKeys = FIELD_KEYS.filter(key => values[key] !== config[key]);

  // Errors whose path is not one of the fields above still need to be seen.
  const otherErrors = Object.entries(fieldErrors).filter(
    ([path]) => !FIELD_KEYS.includes(path)
  );

  const setField = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleReset = () => {
    setValues(initialValues);
    setFieldErrors({});
  };

  const handlePublish = async () => {
    // Only the knobs that moved: unspecified fields carry over from the current version.
    const changes = Object.fromEntries(
      changedKeys.map(key => [key, values[key]])
    );

    try {
      const result = await publishRuleset({ config: changes }).unwrap();
      toast.success(result?.message || 'New ruleset version published');
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      toast.error(getApiErrorMessage(error, 'Failed to publish ruleset'));
    }
  };

  return (
    <div className="space-y-6">
      {SECTIONS.map(section => (
        <div key={section.title}>
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {section.title}
          </h3>

          <div className="divide-y divide-zinc-800/70">
            {section.fields.map(field => (
              <FieldRow
                key={field.key}
                field={field}
                value={values[field.key]}
                values={values}
                config={config}
                error={fieldErrors[field.key]}
                onChange={value => setField(field.key, value)}
              />
            ))}
          </div>
        </div>
      ))}

      {otherErrors.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <WarningCircle size={18} className="mt-0.5 shrink-0" />
          <ul className="space-y-1">
            {otherErrors.map(([path, message]) => (
              <li key={path}>
                <span className="font-mono">{path}</span>: {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-500">
          {changedKeys.length
            ? `${changedKeys.length} unpublished change${changedKeys.length === 1 ? '' : 's'}`
            : 'No changes'}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!changedKeys.length || isLoading}
            className="border-zinc-700"
          >
            Reset
          </Button>
          <Button
            onClick={handlePublish}
            disabled={!changedKeys.length || isLoading}
          >
            {isLoading ? 'Publishing…' : 'Publish new version'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// Panel
// ────────────────────────────────────────────────

export const ScreeningRulesPanel = () => {
  const { data, isLoading, isError, error, refetch } = useGetRulesetsQuery();

  if (isLoading) {
    return (
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-5 w-56 bg-zinc-800" />
          <Skeleton className="h-12 w-full bg-zinc-900" />
          <Skeleton className="h-12 w-full bg-zinc-900" />
          <Skeleton className="h-12 w-full bg-zinc-900" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.effective_ruleset) {
    return (
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <WarningCircle size={28} weight="duotone" className="text-red-400" />
          <p className="text-sm text-zinc-300">
            {getApiErrorMessage(error, 'Failed to load the screening rules')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-zinc-700"
          >
            <ArrowClockwise />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const ruleset = data.effective_ruleset;
  const versions = data.versions || [];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card className="bg-zinc-950 border-zinc-800 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
            Platform default ruleset
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              v{ruleset.version}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Applies to every submission without a brand-specific ruleset.
            Publishing creates a new version; past screening runs keep the
            version they were judged under.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-zinc-800" />

        <CardContent className="p-6">
          <RulesetForm key={ruleset.id} config={data.effective_config} />
        </CardContent>
      </Card>

      <Card className="h-fit bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">
            Versions
          </CardTitle>
        </CardHeader>

        <Separator className="bg-zinc-800" />

        <CardContent className="p-4">
          {versions.length ? (
            <ul className="space-y-1">
              {versions.map(version => (
                <li
                  key={version.id}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-zinc-900"
                >
                  <span className="flex items-center gap-2 text-white">
                    v{version.version}
                    {version.id === ruleset.id && (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      >
                        Current
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {formatDateTime(version.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">No versions published yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreeningRulesPanel;
