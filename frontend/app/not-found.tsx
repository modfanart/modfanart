'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import pageNotFound from '../assets/images/page_not_found.png';
import { LayoutWrapper } from '@/components/layout-wrapper';

export default function NotFound() {
  const router = useRouter();

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-xl w-full">
          {/* 🔥 404 Image */}
          <div className="flex justify-center mb-8">
            <Image
              src={pageNotFound}
              alt="404 Not Found"
              width={420}
              height={420}
              priority
              className="select-none pointer-events-none"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-purple-600 mb-3">404 Not Found</h1>

          {/* Subtitle */}
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Go Back */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                         bg-gray-100 hover:bg-gray-200
                         text-gray-800 border border-gray-300
                         transition"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>

            {/* Explore */}
            <button
              onClick={() => router.push('/explore')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                         bg-gradient-to-r from-purple-600 to-violet-500
                         hover:opacity-90 text-white transition shadow-md"
            >
              <Search size={18} />
              Explore
            </button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
