import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, PlusCircle } from 'lucide-react';

export default function SubmissionNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning-subtle mb-4">
        <FileQuestion className="h-6 w-6 text-warning-strong" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Submission Not Found</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The submission you're looking for doesn't exist or has been removed.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/dashboard/submissions">
          <Button variant="outline">View All Submissions</Button>
        </Link>
        <Link href="/submissions/new">
          <Button className="bg-primary hover:bg-primary-hover">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Submission
          </Button>
        </Link>
      </div>
    </div>
  );
}
