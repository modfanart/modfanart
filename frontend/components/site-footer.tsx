import Link from 'next/link';
import Image from 'next/image';

export function SiteFooter() {
  return (
    <footer className="border-t bg-background py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mod-M-logo-Bt6DjCYYGxGzeV1atMmA9XD71zSPUr.png"
            alt="MOD Logo"
            width={40}
            height={40}
            className="h-8 w-auto"
          />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} MOD Platform. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/legal/terms-and-service"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Terms
          </Link>
          <Link
            href="/legal/privacy-policy"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Privacy
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
