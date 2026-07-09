import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface RecentSubmissionItem {
  id: string;
  title: string;
  artist: {
    name: string;
    image: string;
    initials: string;
  };
  date: string;
  status: string;
}

export function RecentSubmissions({ submissions = [] }: { submissions?: RecentSubmissionItem[] }) {
  if (submissions.length === 0) {
    return (
      <div className="px-4 pb-4">
        <p className="text-sm text-muted-foreground">No pending submissions.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={submission.artist.image} alt="Avatar" />
              <AvatarFallback>{submission.artist.initials}</AvatarFallback>
            </Avatar>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium leading-none truncate max-w-[150px]">
                {submission.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {submission.artist.name} • {submission.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
