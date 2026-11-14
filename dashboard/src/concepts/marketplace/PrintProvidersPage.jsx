// Marketplace → Print providers: who prints and ships POD products.
// Providers are deactivated, never deleted (products reference them). API
// credentials are write-only: the API reports only whether one is set.
import React, { useState } from 'react';
import { Printer, Plus } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { useGetProvidersQuery, useCreateProviderMutation, useUpdateProviderMutation } from '../../services/api/opsApi';
import {
  PageShell,
  Panel,
  QueryState,
  Empty,
  DataTable,
  Pill,
  Field,
  inputClass,
  dateOnly,
  errorMessage,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const TYPES = ['manual', 'printful', 'printify'];

const ProviderDialog = ({ provider, open, onOpenChange }) => {
  const editing = !!provider;
  const [name, setName] = useState(provider?.name || '');
  const [type, setType] = useState(provider?.integration_type || 'manual');
  const [config, setConfig] = useState('');
  const [create, { isLoading: creating }] = useCreateProviderMutation();
  const [update, { isLoading: updating }] = useUpdateProviderMutation();

  const submit = async (e) => {
    e.preventDefault();
    let api_config;
    if (config.trim()) {
      try {
        api_config = JSON.parse(config);
      } catch {
        toast.error('Credentials must be a JSON object');
        return;
      }
    }
    try {
      if (editing) await update({ id: provider.id, name, integration_type: type, ...(api_config ? { api_config } : {}) }).unwrap();
      else await create({ name, integration_type: type, ...(api_config ? { api_config } : {}) }).unwrap();
      toast.success(editing ? 'Provider updated' : 'Provider added');
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save the provider'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${provider.name}` : 'Add print provider'}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editing && provider.has_api_config ? 'Credentials are set. Leave blank to keep them.' : 'Credentials are stored server-side and never shown again.'}
            </DialogDescription>
          </DialogHeader>
          <Field label="Name" htmlFor="pp-name">
            <input id="pp-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Integration" htmlFor="pp-type">
            <select id="pp-type" className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          {type !== 'manual' && (
            <Field label="API credentials (JSON)" htmlFor="pp-config" hint='e.g. {"api_key": "…", "store_id": "…"}'>
              <textarea
                id="pp-config"
                rows={4}
                className={`${inputClass} h-auto py-2 font-mono text-xs`}
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </Field>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" className="text-zinc-300" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating || !name.trim()} className="bg-white text-black hover:bg-zinc-200">
              {creating || updating ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const PrintProvidersPage = () => {
  const providers = useGetProvidersQuery();
  const [update] = useUpdateProviderMutation();
  const [dialog, setDialog] = useState(null); // 'new' | provider
  const rows = providers.data ?? [];

  const toggle = async (p) => {
    try {
      await update({ id: p.id, is_active: !p.is_active }).unwrap();
      toast.success(`${p.name} ${p.is_active ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the provider'));
    }
  };

  return (
    <PageShell
      title="Print providers"
      subtitle="Partners that print and ship print-on-demand products"
      testId="print-providers-page"
      actions={
        <Button className="bg-white text-black hover:bg-zinc-200" onClick={() => setDialog('new')}>
          <Plus className="mr-2 h-4 w-4" /> Add provider
        </Button>
      }
    >
      <Panel>
        <QueryState query={providers} isEmpty={rows.length === 0} empty={<Empty icon={Printer} title="No print providers yet" />}>
          <DataTable
            rows={rows}
            columns={[
              { key: 'name', header: 'Provider', cell: (p) => <span className="font-medium text-white">{p.name}</span> },
              { key: 'type', header: 'Integration', cell: (p) => <Pill tone="info">{p.integration_type}</Pill> },
              {
                key: 'creds',
                header: 'Credentials',
                cell: (p) =>
                  p.integration_type === 'manual' ? (
                    <span className="text-xs text-zinc-500">Not needed</span>
                  ) : p.has_api_config ? (
                    <Pill tone="success">set</Pill>
                  ) : (
                    <Pill tone="warning">missing</Pill>
                  ),
              },
              { key: 'added', header: 'Added', className: 'text-xs text-zinc-500', cell: (p) => dateOnly(p.created_at) },
              {
                key: 'active',
                header: 'Active',
                cell: (p) => <Switch checked={!!p.is_active} onCheckedChange={() => toggle(p)} aria-label={`${p.name} active`} />,
              },
              {
                key: 'edit',
                header: <span className="sr-only">Edit</span>,
                cell: (p) => (
                  <Button size="sm" variant="ghost" className="h-7 text-zinc-300" onClick={() => setDialog(p)}>
                    Edit
                  </Button>
                ),
              },
            ]}
          />
        </QueryState>
      </Panel>

      {dialog && (
        <ProviderDialog
          key={dialog === 'new' ? 'new' : dialog.id}
          provider={dialog === 'new' ? null : dialog}
          open
          onOpenChange={(o) => !o && setDialog(null)}
        />
      )}
    </PageShell>
  );
};

export default PrintProvidersPage;
