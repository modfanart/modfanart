// Ledger → Fee rules: the platform's cut, by fulfilment type and product type.
// The most specific active rule wins; the default rule (no scope) covers
// digital licences and can be edited but not switched off.
import React, { useState } from 'react';
import { Percent, Plus } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { useGetFeeRulesQuery, useCreateFeeRuleMutation, useUpdateFeeRuleMutation } from '../../services/api/opsApi';
import { PageShell, Panel, QueryState, Empty, DataTable, Field, inputClass, errorMessage } from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const FULFILMENT = ['print_on_demand', 'in_house_stock', 'dropship'];
const pct = (bps) => `${(Number(bps) / 100).toFixed(2).replace(/\.00$/, '')}%`;
const label = (v) => (v ? String(v).replace(/_/g, ' ') : null);

const FeeInput = ({ rule, onDone }) => {
  const [value, setValue] = useState(String(Number(rule.fee_bps) / 100));
  const [update, { isLoading }] = useUpdateFeeRuleMutation();
  const save = async (e) => {
    e.preventDefault();
    const bps = Math.round(Number(value) * 100);
    if (!Number.isFinite(bps) || bps < 0 || bps > 10000) {
      toast.error('Enter a percentage between 0 and 100');
      return;
    }
    try {
      await update({ id: rule.id, fee_bps: bps }).unwrap();
      toast.success('Fee updated');
      onDone();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the fee'));
    }
  };
  return (
    <form onSubmit={save} className="flex items-center gap-1.5">
      <input
        aria-label="Fee percent"
        autoFocus
        type="number"
        step="0.01"
        min="0"
        max="100"
        className="h-8 w-20 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-right text-sm text-white"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span className="text-zinc-500">%</span>
      <Button type="submit" size="sm" className="h-7 bg-white text-black hover:bg-zinc-200" disabled={isLoading}>
        Save
      </Button>
      <Button type="button" size="sm" variant="ghost" className="h-7 text-zinc-400" onClick={onDone}>
        Cancel
      </Button>
    </form>
  );
};

const NewRuleDialog = ({ open, onOpenChange }) => {
  const [fulfilment, setFulfilment] = useState('print_on_demand');
  const [productType, setProductType] = useState('');
  const [percent, setPercent] = useState('');
  const [create, { isLoading }] = useCreateFeeRuleMutation();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await create({
        fulfillment_type: fulfilment,
        base_product_type: productType.trim() || null,
        fee_bps: Math.round(Number(percent) * 100),
      }).unwrap();
      toast.success('Rule added');
      setProductType('');
      setPercent('');
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add the rule'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New fee rule</DialogTitle>
            <DialogDescription className="text-zinc-400">Applies to new orders only. Existing payouts keep their fee.</DialogDescription>
          </DialogHeader>
          <Field label="Fulfilment type" htmlFor="fr-f">
            <select id="fr-f" className={inputClass} value={fulfilment} onChange={(e) => setFulfilment(e.target.value)}>
              {FULFILMENT.map((f) => (
                <option key={f} value={f}>
                  {label(f)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Product type (optional)" htmlFor="fr-p" hint="e.g. t_shirt. Leave blank for every product of this fulfilment type.">
            <input id="fr-p" className={inputClass} value={productType} onChange={(e) => setProductType(e.target.value)} />
          </Field>
          <Field label="Platform fee (%)" htmlFor="fr-pct">
            <input
              id="fr-pct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              className={inputClass}
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" className="text-zinc-300" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || percent === ''} className="bg-white text-black hover:bg-zinc-200">
              {isLoading ? 'Adding…' : 'Add rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const FeeRulesPage = () => {
  const rules = useGetFeeRulesQuery();
  const [update] = useUpdateFeeRuleMutation();
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const rows = rules.data ?? [];

  const toggle = async (r) => {
    try {
      await update({ id: r.id, is_active: !r.is_active }).unwrap();
      toast.success(r.is_active ? 'Rule switched off' : 'Rule switched on');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the rule'));
    }
  };

  return (
    <PageShell
      title="Fee rules"
      subtitle="The platform's cut of each sale. The most specific active rule applies."
      testId="fee-rules-page"
      actions={
        <Button className="bg-white text-black hover:bg-zinc-200" onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> New rule
        </Button>
      }
    >
      <Panel>
        <QueryState query={rules} isEmpty={rows.length === 0} empty={<Empty icon={Percent} title="No fee rules" />}>
          <DataTable
            rows={rows}
            columns={[
              {
                key: 'scope',
                header: 'Applies to',
                cell: (r) =>
                  !r.fulfillment_type ? (
                    <span className="text-white">Default <span className="text-zinc-500">(digital licences and anything unmatched)</span></span>
                  ) : (
                    <span className="capitalize text-white">
                      {label(r.fulfillment_type)}
                      {r.base_product_type && <span className="text-zinc-400"> · {label(r.base_product_type)}</span>}
                    </span>
                  ),
              },
              {
                key: 'fee',
                header: 'Fee',
                cell: (r) =>
                  editing === r.id ? (
                    <FeeInput rule={r} onDone={() => setEditing(null)} />
                  ) : (
                    <button
                      type="button"
                      className="rounded px-1 font-semibold tabular-nums text-white hover:bg-zinc-800"
                      onClick={() => setEditing(r.id)}
                      title="Edit fee"
                    >
                      {pct(r.fee_bps)}
                    </button>
                  ),
              },
              {
                key: 'active',
                header: 'Active',
                cell: (r) => (
                  <Switch
                    checked={!!r.is_active}
                    disabled={!r.fulfillment_type && !r.base_product_type}
                    onCheckedChange={() => toggle(r)}
                    aria-label="Rule active"
                  />
                ),
              },
            ]}
          />
        </QueryState>
      </Panel>
      <NewRuleDialog open={showNew} onOpenChange={setShowNew} />
    </PageShell>
  );
};

export default FeeRulesPage;
