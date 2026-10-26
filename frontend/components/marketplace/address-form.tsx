'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getApiErrorMessage,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  type Address,
} from '@/services/api/marketplaceApi';

// The backend validates country as an ISO 3166-1 alpha-2 code.
export const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'JP', name: 'Japan' },
];

const empty = {
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'IN',
  is_default: false,
};

export function AddressForm({
  address,
  onSaved,
  onCancel,
}: {
  address?: Address | undefined;
  onSaved?: ((address: Address) => void) | undefined;
  onCancel?: (() => void) | undefined;
}) {
  const [form, setForm] = useState({
    ...empty,
    ...(address && {
      full_name: address.full_name,
      phone: address.phone ?? '',
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      state: address.state ?? '',
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    }),
  });
  const [error, setError] = useState<string | null>(null);

  const [create, { isLoading: creating }] = useCreateAddressMutation();
  const [update, { isLoading: updating }] = useUpdateAddressMutation();
  const busy = creating || updating;

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        ...form,
        phone: form.phone || null,
        line2: form.line2 || null,
        state: form.state || null,
      };
      const saved = address
        ? await update({ id: address.id, ...payload }).unwrap()
        : await create(payload).unwrap();
      onSaved?.(saved);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the address'));
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="addr-name">Full name</Label>
        <Input id="addr-name" required className="mt-1" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="addr-phone">Phone (for the courier)</Label>
        <Input id="addr-phone" type="tel" className="mt-1" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="addr-line1">Address line 1</Label>
        <Input id="addr-line1" required className="mt-1" value={form.line1} onChange={(e) => set('line1', e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="addr-line2">Address line 2</Label>
        <Input id="addr-line2" className="mt-1" value={form.line2} onChange={(e) => set('line2', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="addr-city">City</Label>
        <Input id="addr-city" required className="mt-1" value={form.city} onChange={(e) => set('city', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="addr-state">State / province</Label>
        <Input id="addr-state" className="mt-1" value={form.state} onChange={(e) => set('state', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="addr-postal">Postal code</Label>
        <Input id="addr-postal" required className="mt-1" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} />
      </div>
      <div>
        <Label>Country</Label>
        <Select value={form.country} onValueChange={(v) => set('country', v)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <Checkbox
          checked={form.is_default}
          onCheckedChange={(v) => set('is_default', v === true)}
        />
        Use as my default address
      </label>

      {error && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 sm:col-span-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : address ? 'Save changes' : 'Save address'}
        </Button>
      </div>
    </form>
  );
}

export function AddressSummary({ address }: { address: Address }) {
  const country = COUNTRIES.find((c) => c.code === address.country)?.name ?? address.country;

  return (
    <address className="not-italic text-sm leading-relaxed">
      <span className="font-medium">{address.full_name}</span>
      <br />
      {address.line1}
      {address.line2 && (
        <>
          <br />
          {address.line2}
        </>
      )}
      <br />
      {address.city}
      {address.state ? `, ${address.state}` : ''} {address.postal_code}
      <br />
      {country}
      {address.phone && (
        <>
          <br />
          {address.phone}
        </>
      )}
    </address>
  );
}
