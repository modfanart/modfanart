# MOD Platform Integrations

This document provides an overview of the integrations implemented in the MOD Platform.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Blob Store Integration](#blob-store-integration)
3. [MotherDuck/DuckDB Integration](#motherduckduckdb-integration)
4. [Edge Config Integration](#edge-config-integration)
5. [GrokAi Integration](#grokai-integration)
6. [Security & Best Practices](#security--best-practices)
7. [Usage Examples](#usage-examples)

## Environment Variables

The following environment variables are required for the integrations:

| Variable                   | Description                      | Default         |
| -------------------------- | -------------------------------- | --------------- |
| `BLOB_STORAGE_KEY`         | API key for Vercel Blob Store    | None (Required) |
| `GROK_API_KEY`             | API key for GrokAi               | None (Required) |
| `DUCKDB_CONNECTION_STRING` | Connection string for MotherDuck | None (Required) |
| `EDGE_CONFIG_KEY`          | API key for Vercel Edge Config   | None (Required) |
| `DEBUG`                    | Debug logging configuration      | `mod:*`         |
| `NEXT_PUBLIC_DEBUG`        | Enable client-side debugging     | `false`         |

## Blob Store Integration

The Blob Store integration (`blob-mod-fanart`) provides secure file storage for user-submitted artwork.

### Features

- Secure file uploads with validation
- Type and size checks
- Folder organization
- Secure URL generation
- Error handling and logging

### Usage

```typescript
import { uploadFile, deleteFile, listFiles } from '@/lib/db/storage';

// Upload a file
const result = await uploadFile(buffer, {
  filename: 'artwork.jpg',
  contentType: 'image/jpeg',
  folder: 'submissions',
});

// Delete a file
await deleteFile(result.pathname);

// List files in a folder
const files = await listFiles('submissions');
```
