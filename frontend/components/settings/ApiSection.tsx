// components/settings/ApiSection.tsx
'use client';

import { Copy, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ApiSection() {
  // Mock data — replace with real API key list from backend later
  const apiKeys = [
    // { id: 'key_123', name: 'Development Key', created: '2025-11-10', lastUsed: '2026-01-28', key: 'sk_live_...' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Create and manage API keys to integrate with our platform programmatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 space-y-8">
        {apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">You don't have any API keys yet.</p>
            <Button>Generate New API Key</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* List of keys would go here */}
            <Button>Generate New API Key</Button>
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-md text-sm">
          <p className="font-medium mb-2">API Documentation</p>
          <p className="text-muted-foreground">
            Visit our developer portal to learn how to authenticate and use the API.
          </p>
          <Button variant="link" className="px-0 mt-1">
            View API Docs →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
