import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Share2, BookmarkPlus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// This would normally come from a database
const getOpportunityById = (id: string) => {
  const contests = [
    {
      id: 'contest-1',
      title: 'Anime Expo 2023 Fan Art Contest',
      description: 'Create original fan art for popular anime series featured at Anime Expo 2023.',
      fullDescription: `
        <p>Anime Expo is excited to announce our 2023 Fan Art Contest! We're looking for original fan art inspired by the anime series that will be featured at this year's expo.</p>
        
        <h3>Contest Details</h3>
        <p>Create original artwork based on any anime series that will be featured at Anime Expo 2023. Your submission should showcase your unique artistic style while celebrating the characters and worlds of your favorite anime.</p>
        
        <h3>Rules & Guidelines</h3>
        <ul>
          <li>Artwork must be original and created by you</li>
          <li>Fan art must be based on officially licensed anime series</li>
          <li>Digital and traditional art accepted</li>
          <li>Maximum of 3 entries per artist</li>
          <li>Artwork must be appropriate for all ages (no explicit content)</li>
          <li>Submission must include your name, contact information, and social media handles</li>
        </ul>
        
        <h3>Prizes</h3>
        <p><strong>1st Place:</strong> $1,000, Featured display at Anime Expo, Artist Alley booth for next year</p>
        <p><strong>2nd Place:</strong> $500, Featured in Anime Expo digital gallery</p>
        <p><strong>3rd Place:</strong> $250, Featured in Anime Expo digital gallery</p>
        <p><strong>People's Choice:</strong> $250, Featured in Anime Expo social media</p>
      `,
      image:
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2070&auto=format&fit=crop',
      organizer: 'Anime Expo',
      organizerLogo:
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2070&auto=format&fit=crop',
      deadline: '2023-06-15',
      prize: '$1,000',
      entries: 156,
      status: 'active',
      categories: ['Anime', 'Digital Art'],
      featured: true,
      requirements: [
        'Original artwork created by you',
        'Based on officially licensed anime series',
        'Digital or traditional media',
        'Appropriate for all ages',
        'High-resolution digital file (min. 300 DPI)',
      ],
      judges: [
        {
          name: 'Miyazaki Hayao',
          role: 'Renowned Animator',
          image:
            'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop',
        },
        {
          name: 'Takahashi Rumiko',
          role: 'Manga Artist',
          image:
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
        },
      ],
      type: 'contest',
    },
    {
      id: 'contest-2',
      title: 'Marvel Cinematic Universe Art Challenge',
      description: 'Design fan art inspired by the latest Marvel movies and TV shows.',
      fullDescription: `
        <p>Marvel Entertainment is launching an exciting art challenge for fans to create original artwork inspired by the latest Marvel Cinematic Universe movies and TV shows!</p>
        
        <h3>Challenge Details</h3>
        <p>Create original fan art based on any character, scene, or concept from Phase 4 of the Marvel Cinematic Universe. We're looking for creative interpretations that showcase your unique artistic vision while celebrating the Marvel universe.</p>
        
        <h3>Rules & Guidelines</h3>
        <ul>
          <li>Artwork must be original and created by you</li>
          <li>Fan art must be based on Marvel Cinematic Universe (Phase 4)</li>
          <li>Digital and traditional art accepted</li>
          <li>Maximum of 2 entries per artist</li>
          <li>Artwork must be appropriate for general audiences</li>
          <li>Submission must include your name and contact information</li>
        </ul>
        
        <h3>Prizes</h3>
        <p><strong>Grand Prize:</strong> $2,500, Featured in Marvel social media, Digital artist meet & greet with Marvel Studios visual development team</p>
        <p><strong>Runner-up (5):</strong> $500 each, Featured in Marvel digital gallery</p>
        <p><strong>Honorable Mentions (10):</strong> Marvel merchandise package valued at $100</p>
      `,
      image:
        'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2070&auto=format&fit=crop',
      organizer: 'Marvel Entertainment',
      organizerLogo:
        'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2070&auto=format&fit=crop',
      deadline: '2023-07-30',
      prize: '$2,500',
      entries: 342,
      status: 'active',
      categories: ['Superhero', 'Movies'],
      featured: true,
      requirements: [
        'Original artwork created by you',
        'Based on Marvel Cinematic Universe Phase 4',
        'Digital or traditional media',
        'Appropriate for general audiences',
        'High-resolution digital file (min. 300 DPI)',
      ],
      judges: [
        {
          name: 'Ryan Meinerding',
          role: 'Head of Visual Development at Marvel Studios',
          image:
            'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1974&auto=format&fit=crop',
        },
        {
          name: 'Andy Park',
          role: 'Director of Visual Development at Marvel Studios',
          image:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop',
        },
      ],
      type: 'contest',
    },
  ];

  const rfds = [
    {
      id: 'rfd-1',
      title: 'Star Wars Celebration Merchandise',
      description: 'Looking for unique Star Wars fan art designs for official merchandise.',
      fullDescription: `
        <p>Lucasfilm Ltd. is seeking talented artists to create unique Star Wars fan art designs for official merchandise for the upcoming Star Wars Celebration event.</p>
        
        <h3>Opportunity Details</h3>
        <p>We're looking for fresh, creative interpretations of Star Wars characters, vehicles, and iconic scenes that will appeal to fans of all ages. Selected designs will be featured on official merchandise including t-shirts, posters, mugs, and other collectibles.</p>
        
        <h3>Requirements</h3>
        <ul>
          <li>Original artwork that captures the spirit of Star Wars</li>
          <li>Designs must feature recognizable Star Wars elements</li>
          <li>Artwork must be appropriate for all ages</li>
          <li>High-resolution vector files preferred</li>
          <li>Ability to revise designs based on feedback</li>
          <li>Previous experience with licensed properties preferred but not required</li>
        </ul>
        
        <h3>Compensation</h3>
        <p>Selected artists will receive:</p>
        <ul>
          <li>Royalty payments based on merchandise sales (typically 5-8%)</li>
          <li>Artist credit on products and packaging</li>
          <li>Complimentary merchandise featuring your design</li>
          <li>Potential for ongoing collaboration opportunities</li>
        </ul>
      `,
      image:
        'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?q=80&w=2069&auto=format&fit=crop',
      organizer: 'Lucasfilm Ltd.',
      organizerLogo:
        'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?q=80&w=2069&auto=format&fit=crop',
      deadline: '2023-09-01',
      compensation: 'Royalty-based',
      status: 'active',
      categories: ['Movies', 'Merchandise'],
      featured: true,
      requirements: [
        'Original artwork created by you',
        'Recognizable Star Wars elements',
        'Appropriate for all ages',
        'High-resolution vector files preferred',
        'Ability to revise designs based on feedback',
      ],
      contactPerson: {
        name: 'Sarah Johnson',
        role: 'Licensing Manager',
        email: 'licensing@example.com',
      },
      type: 'rfd',
    },
    {
      id: 'rfd-2',
      title: 'Fantasy Novel Cover Art',
      description: 'Seeking artists to create cover art for upcoming fantasy novel series.',
      fullDescription: `
        <p>Penguin Random House is seeking talented artists to create cover art for an upcoming fantasy novel series by bestselling author J.K. Rowling.</p>
        
        <h3>Opportunity Details</h3>
        <p>We're looking for artists who can create captivating, magical cover art that will appeal to both young adult and adult fantasy readers. The series follows a group of young wizards in a modern urban setting as they discover ancient magical secrets.</p>
        
        <h3>Requirements</h3>
        <ul>
          <li>Experience with fantasy illustration</li>
          <li>Ability to create artwork that balances magical elements with urban settings</li>
          <li>Strong character design skills</li>
          <li>Understanding of book cover design principles</li>
          <li>Ability to work with art directors and incorporate feedback</li>
          <li>Portfolio demonstrating relevant experience</li>
        </ul>
        
        <h3>Compensation</h3>
        <p>Selected artists will receive:</p>
        <ul>
          <li>$3,000 per cover (series will include 5 books)</li>
          <li>Artist credit on book cover and marketing materials</li>
          <li>Potential for additional work on related projects</li>
          <li>Exposure through Penguin Random House's global distribution network</li>
        </ul>
      `,
      image:
        'https://images.unsplash.com/photo-1518281361980-b26bfd556770?q=80&w=2070&auto=format&fit=crop',
      organizer: 'Penguin Random House',
      organizerLogo:
        'https://images.unsplash.com/photo-1518281361980-b26bfd556770?q=80&w=2070&auto=format&fit=crop',
      deadline: '2023-07-20',
      compensation: '$3,000 per cover',
      status: 'active',
      categories: ['Books', 'Fantasy'],
      requirements: [
        'Experience with fantasy illustration',
        'Strong character design skills',
        'Understanding of book cover design principles',
        'Ability to work with art directors',
        'Portfolio demonstrating relevant experience',
      ],
      contactPerson: {
        name: 'Michael Chen',
        role: 'Art Director',
        email: 'artdirector@example.com',
      },
      type: 'rfd',
    },
  ];

  // Combine all opportunities
  const allOpportunities = [...contests, ...rfds];

  // Find the opportunity by ID
  return allOpportunities.find((opp) => opp.id === id);
};

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ← Unwrap the promise here
  const opportunity = getOpportunityById(id);

  if (!opportunity) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Opportunity not found</h1>
        <p className="mt-4">
          The opportunity you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/opportunities" className="mt-6 inline-block">
          <Button>Back to Opportunities</Button>
        </Link>
      </div>
    );
  }

  const isContest = opportunity.type === 'contest';

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/opportunities" className="text-sm text-muted-foreground hover:text-foreground">
          Opportunities
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm font-medium">{opportunity.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={opportunity.image || '/placeholder.svg'}
              alt={opportunity.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">{opportunity.title}</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src={opportunity.organizerLogo || '/placeholder.svg'}
                  alt={opportunity.organizer}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-medium">{opportunity.organizer}</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
              {opportunity.status === 'active' ? 'Active' : 'Closed'}
            </Badge>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>1,245 views</span>
            </div>
          </div>

          <Tabs defaultValue="details" className="mb-8">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              {isContest && <TabsTrigger value="judges">Judges</TabsTrigger>}
              {!isContest && <TabsTrigger value="contact">Contact</TabsTrigger>}
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: opportunity.fullDescription }}
              />
            </TabsContent>
            <TabsContent value="requirements" className="mt-4">
              <h3 className="mb-4 text-xl font-semibold">Submission Requirements</h3>
              <ul className="space-y-2">
                {opportunity.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            {isContest && (
              <TabsContent value="judges" className="mt-4">
                <h3 className="mb-4 text-xl font-semibold">Contest Judges</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(opportunity as any).judges.map((judge: any) => (
                    <Card key={judge.name}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-full">
                          <Image
                            src={judge.image || '/placeholder.svg'}
                            alt={judge.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{judge.name}</h4>
                          <p className="text-sm text-muted-foreground">{judge.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
            {!isContest && (
              <TabsContent value="contact" className="mt-4">
                <h3 className="mb-4 text-xl font-semibold">Contact Information</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p>
                        <strong>Contact Person:</strong> {(opportunity as any).contactPerson.name}
                      </p>
                      <p>
                        <strong>Role:</strong> {(opportunity as any).contactPerson.role}
                      </p>
                      <p>
                        <strong>Email:</strong> {(opportunity as any).contactPerson.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <div className="mb-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Deadline</span>
                  <span className="font-medium">
                    {new Date(opportunity.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {isContest ? 'Prize' : 'Compensation'}
                  </span>
                  <span className="font-medium">
                    {isContest ? (opportunity as any).prize : (opportunity as any).compensation}
                  </span>
                </div>
                {isContest && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Entries</span>
                    <span className="font-medium">{(opportunity as any).entries}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Categories</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {opportunity.categories.map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Link href={`/submissions/new?opportunity=${opportunity.id}`} className="w-full">
                  <Button className="w-full">
                    Submit Your Artwork
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-center text-sm text-muted-foreground">
                  Submission will open in your dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
