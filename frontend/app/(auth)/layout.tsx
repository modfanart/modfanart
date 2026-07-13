import type { ReactNode } from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branded hero image */}
      <div className="relative hidden md:block md:w-1/2">
        <Image
          src="/auth-hero.jpg"
          alt="MOD Fan Official — official fan licensing, built for the next era of fandom"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>

      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo - only visible on small screens */}
          <div className="flex md:hidden justify-center mb-8">
            <Image
              src="/mod-logo-dark.png"
              alt="MOD Logo"
              width={150}
              height={60}
              className="h-auto w-36"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
