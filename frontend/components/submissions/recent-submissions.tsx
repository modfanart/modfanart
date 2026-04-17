import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const submissions = [
  {
    id: '1',
    title: 'Squid Game Player 456',
    artist: {
      name: 'Min-Ji Park',
      image: '/placeholder.svg?text=MP',
      initials: 'MP',
    },
    date: '2 hours ago',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Batman Dark Knight',
    artist: {
      name: 'Michael Brown',
      image: '/placeholder.svg?text=MB',
      initials: 'MB',
    },
    date: '5 hours ago',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Jujutsu Kaisen Character',
    artist: {
      name: 'Kenji Yamamoto',
      image: '/placeholder.svg?text=KY',
      initials: 'KY',
    },
    date: '1 day ago',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Street Fighter Chun-Li',
    artist: {
      name: 'Carlos Mendez',
      image: '/placeholder.svg?text=CM',
      initials: 'CM',
    },
    date: '2 days ago',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Ahsoka Tano Portrait',
    artist: {
      name: 'Alex Rodriguez',
      image: '/placeholder.svg?text=AR',
      initials: 'AR',
    },
    date: '3 days ago',
    status: 'pending',
  },
];

export function RecentSubmissions() {
  return (
    <div className="px-4 pb-4">
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="flex flex-col space-y-3">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={submission.artist.image} alt="Avatar" />
                <AvatarFallback>{submission.artist.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate max-w-[150px]">
                  {submission.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  By {submission.artist.name} • {submission.date}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1 h-8">
                Decline
              </Button>
              <Button size="sm" className="flex-1 h-8">
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
