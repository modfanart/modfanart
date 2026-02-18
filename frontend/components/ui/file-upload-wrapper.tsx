'use client';

import { DynamicImport } from './dynamic-import';

export function FileUploadWrapper(props: any) {
  return (
    <DynamicImport
      component={() => import('./file-upload').then((mod) => ({ default: mod.FileUpload }))}
      props={props}
      fallback={
        <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-8 text-center">
          <div className="text-sm text-muted-foreground">Loading file uploader...</div>
        </div>
      }
    />
  );
}
