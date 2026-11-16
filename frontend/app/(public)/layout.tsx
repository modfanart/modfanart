import type React from 'react';

// The site header/footer are rendered once by LayoutWrapper in the root
// layout. Rendering MainNav here as well produced a second (overlapping)
// header on every public page and doubled its API polling (FAN-04).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1 bg-background">{children}</main>;
}
