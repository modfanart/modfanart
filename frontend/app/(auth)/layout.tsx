import type { ReactNode } from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Gradient background with logo */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-purple-800 to-pink-400 items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mod-logo-dark-gTZuJePnecraDwGyMlBCHe6E6xJgsx.png"
            alt="MOD Logo"
            width={200}
            height={80}
            className="h-auto w-48 mb-4"
          />
          <p className="text-white text-center opacity-80 mt-2">merch on demand</p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo - only visible on small screens */}
          <div className="flex md:hidden justify-center mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mod-logo-dark-gTZuJePnecraDwGyMlBCHe6E6xJgsx.png"
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
