import type { ReactNode } from 'react';
import { Mona_Sans as FontSans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';

import { ThemeProvider } from '@/components/layouts/theme-provider';
import { DevToolsWrapper } from '@/components/dev/dev-tools-wrapper';
import { Providers } from '@/store/Providers';
import { AuthProvider } from '@/store/AuthContext';
import { LayoutWrapper } from '@/components/layouts/layout-wrapper'; // 👈 ADD THIS

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'MOD Platform | Fan Art Submission & Licensing',
  description:
    'AI-powered fan art submission and licensing platform for brands, creators, and artists',
  generator: 'v0.dev',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen flex flex-col bg-white font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
              <DevToolsWrapper showDebugTools={process.env.NODE_ENV === 'development'}>
                <LayoutWrapper>
                  {' '}
                  {/* ✅ MOVE HERE */}
                  {children}
                </LayoutWrapper>

                <Toaster />
              </DevToolsWrapper>
            </ThemeProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
