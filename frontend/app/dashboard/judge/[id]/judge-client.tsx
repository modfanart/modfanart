'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function JudgeClient({
  judgeData: params,
}: {
  judgeData: { email: string; name: string; id: string; contestId: string };
}) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const judgeData = params;
  const { id } = judgeData;

  useEffect(() => {
    if (judgeData.email === '') {
      setOpen(true);
    }
  }, [judgeData.email]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors['fullName'] = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors['email'] = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors['email'] = 'Enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Everything valid
      setOpen(false);

      //Save judge info to backend
      console.log('Saving judge info:', { fullName, email });
      // await fetch("/api/judge/update", {
      // method: "POST",
      // body: JSON.stringify({ fullName, email }),
      // })

      router.replace(`/judge/${id}/dashboard`);
    }
  };

  const isFormValid = fullName.trim().length > 0 && isValidEmail(email);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        // Only allow closing if judgeData.email exists
        setOpen(value);
      }}
    >
      <DialogContent
        className="[&>button]:hidden sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Enter Judge Information</DialogTitle>
          <DialogDescription>
            Please enter your name and email to access the judge dashboard.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="fullname" className="text-sm font-medium">
              Name
            </label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-black text-white py-2 text-sm
            disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid}
          >
            Submit
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
