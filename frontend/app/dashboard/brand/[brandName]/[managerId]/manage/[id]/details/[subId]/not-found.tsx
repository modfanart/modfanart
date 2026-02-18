import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, PlusCircle } from 'lucide-react';

export default function SubmissionNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
        <FileQuestion className="h-6 w-6 text-amber-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Submission Not Found</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The submission you're looking for doesn't exist or has been removed.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/brand/manage">
          <Button variant="outline">Return</Button>
        </Link>
      </div>
    </div>
  );
}
