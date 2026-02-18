'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type React from 'react';

export function AITestForm() {
  // Only render in development environment
  const shouldRender = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const originalIp = formData.get('originalIp') as string;
    const tags = formData.get('tags') as string;
    const imageUrl = formData.get('imageUrl') as string;

    try {
      const response = await fetch('/api/moderation/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          originalIp,
          tags: tags.split(',').map((tag) => tag.trim()),
          imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue="Fan Art Submission" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" defaultValue="fan art" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue="This is a fan art submission for testing purposes."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="originalIp">Original IP</Label>
            <Input id="originalIp" name="originalIp" defaultValue="Star Wars" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" defaultValue="test, fan art, debug" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            defaultValue="https://example.com/image.jpg"
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Testing...' : 'Test AI Analysis'}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <Card className="p-4 bg-slate-50 rounded-md overflow-auto">
          <p className="font-medium mb-2">Result</p>
          <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}
