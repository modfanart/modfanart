'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import pageNotFound from '../assets/images/page_not_found.png';
import { LayoutWrapper } from '@/components/layouts/layout-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  const router = useRouter();

  return (
    <LayoutWrapper>
      <div className="min-h-screen flex items-center justify-center bg-muted/40 px-6 py-10">
        <Card className="w-full max-w-2xl shadow-xl border rounded-2xl">
          <CardContent className="flex flex-col items-center text-center p-8 md:p-10 space-y-6">
            {/* Image */}
            <div className="flex justify-center">
              <Image
                src={pageNotFound}
                alt="404 Not Found"
                width={320}
                height={320}
                priority
                className="select-none pointer-events-none"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                404 — Page not found
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-md">
                The page you're looking for doesn’t exist or may have been moved.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go back
              </Button>

              <Button onClick={() => router.push('/explore')} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Explore
              </Button>
            </div>

            {/* Optional hint */}
            <p className="text-xs text-muted-foreground">
              Lost? Try exploring trending content instead.
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
