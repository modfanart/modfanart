'use client';

import { Upload } from 'lucide-react';
import { useRef, type ChangeEvent, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface FileUploadProps {
  accept?: string;
  onChange: (file: File | null) => void; // ← make it accept null too (safer)
  disabled?: boolean;
  className?: string;
  children?: ReactNode; // ← add this
}

export function FileUpload({
  accept,
  onChange,
  disabled = false,
  className,
  children = (
    <>
      <Upload className="mr-2 h-4 w-4" />
      Upload File
    </>
  ),
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
    // Optional: reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled}
        className="w-full justify-center"
      >
        {children}
      </Button>
    </div>
  );
}
