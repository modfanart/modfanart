import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Mona_Sans as FontSans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/layouts/theme-provider';
import { DevToolsWrapper } from '@/components/dev/dev-tools-wrapper';
import { Providers } from '@/store/Providers';
import { AuthProvider } from '@/store/AuthContext';
import { LayoutWrapper } from '@/components/layouts/layout-wrapper';
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfanofficial.com'),
  title: {
    default: 'MOD Platform | Fan Art Submission & Licensing',
    template: '%s | MOD',
  },
  description:
    'AI-powered fan art submission and licensing platform for brands, creators, and artists',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen flex flex-col bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
              <DevToolsWrapper showDebugTools={process.env.NODE_ENV === 'development'}>
                {/* ✅ WRAP HERE */}
                <LayoutWrapper>{children}</LayoutWrapper>

                <Toaster />
              </DevToolsWrapper>
            </ThemeProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
