'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload'; // assuming this is your custom component
import { toast } from '@/components/ui/use-toast';
import { Loader2, Trash2 } from 'lucide-react';

// ─── RTK Query imports ──────────────────────────────────────────────
import { userApi, useUploadAvatarMutation, useRemoveAvatarMutation } from '@/app/api/userApi'; // adjust path

interface ProfileImageUploadProps {
  currentImage: string | null;
  onImageChange: (url: string | null) => void;
  userInitials: string;
}

export function ProfileImageUpload({
  currentImage,
  onImageChange,
  userInitials,
}: ProfileImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadAvatar, { isLoading: isUploadLoading }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemoveLoading }] = useRemoveAvatarMutation();

  const isBusy = isUploadLoading || isRemoveLoading || isUploading;

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPEG, PNG, GIF, WebP allowed.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum size is 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Show immediate preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadAvatar(file).unwrap();

      if (result.avatar_url) {
        onImageChange(result.avatar_url);
        toast({
          title: 'Success',
          description: 'Profile picture updated.',
        });
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast({
        title: 'Upload failed',
        description: err?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
      // Revert preview on failure
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Clean up object URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  const handleRemove = async () => {
    if (!currentImage) return;

    try {
      await removeAvatar().unwrap();
      onImageChange(null);
      setPreviewUrl(null);
      toast({
        title: 'Removed',
        description: 'Profile picture has been removed.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to remove',
        description: err?.data?.message || 'Try again later.',
        variant: 'destructive',
      });
    }
  };

  // Display logic: preview > uploaded image > fallback
  const displaySrc = previewUrl || currentImage || '';

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
          {isBusy ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          ) : null}

          {displaySrc ? (
            <AvatarImage src={displaySrc} alt="Profile picture" className="object-cover" />
          ) : (
            <AvatarFallback className="text-2xl font-medium bg-gradient-to-br from-muted to-muted/70">
              {userInitials}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium leading-none">Profile Picture</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Recommended: square JPG/PNG/WebP, max 5MB
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <FileUpload
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            disabled={isBusy}
            className="w-auto"
          >
            {isUploadLoading ? 'Uploading...' : 'Upload new picture'}
          </FileUpload>

          {(currentImage || previewUrl) && (
            <Button variant="outline" size="sm" onClick={handleRemove} disabled={isBusy}>
              {isRemoveLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
