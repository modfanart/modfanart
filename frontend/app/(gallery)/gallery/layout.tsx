import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Gallery — Licensed Fan Art',
  description: 'Browse officially licensed fan art from MOD artists.',
};

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
