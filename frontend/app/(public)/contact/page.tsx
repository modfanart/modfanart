'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';

import { useSendMessageMutation } from '@/services/api/contactApi';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [sendMessage, { isLoading }] = useSendMessageMutation();

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 Basic validation (optional but recommended)
    if (!formState.name || !formState.email || !formState.subject || !formState.message) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all fields before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendMessage(formState).unwrap();

      toast({
        title: 'Message sent!',
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      toast({
        title: 'Something went wrong',
        description: error?.data?.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 py-10">
        <div className="mx-auto max-w-2xl">
          {/* HEADER */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
              <p className="text-muted-foreground">Get in touch with the MOD Platform team</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          {/* CARD */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* NAME + EMAIL */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formState.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email address"
                      value={formState.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* SUBJECT */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What is this regarding?"
                    value={formState.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* MESSAGE */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    rows={6}
                    value={formState.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* SUBMIT */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>

            {/* FOOTER */}
            <CardFooter className="flex flex-col items-start border-t px-6 py-4">
              <h3 className="text-lg font-medium">Other ways to reach us</h3>

              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong> support@modplatform.com
                </p>
                <p className="text-sm">
                  <strong>Business Inquiries:</strong> partnerships@modplatform.com
                </p>
                <p className="text-sm">
                  <strong>Address:</strong> 123 Creative Ave, Suite 456, San Francisco, CA 94103
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
