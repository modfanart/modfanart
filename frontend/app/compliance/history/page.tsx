import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Bot,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ComplianceHistoryPage() {
  // Sample data for compliance history
  const complianceHistory = [
    {
      id: 'sub-1',
      title: 'Superhero Team Illustration',
      artist: 'Sarah Johnson',
      date: '2023-06-15',
      status: 'approved',
      aiScore: 0.03,
      complianceScore: 98,
      reviewType: 'automated',
      image:
        'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2070&auto=format&fit=crop',
    },
    {
      id: 'sub-2',
      title: 'Fantasy Character Concept',
      artist: 'Michael Chen',
      date: '2023-06-14',
      status: 'rejected',
      aiScore: 0.92,
      complianceScore: 65,
      reviewType: 'automated',
      image:
        'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?q=80&w=2067&auto=format&fit=crop',
    },
    {
      id: 'sub-3',
      title: 'Anime Style Fan Art',
      artist: 'Emma Wilson',
      date: '2023-06-13',
      status: 'approved',
      aiScore: 0.12,
      complianceScore: 95,
      reviewType: 'manual',
      image:
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2070&auto=format&fit=crop',
    },
    {
      id: 'sub-4',
      title: 'Comic Book Cover Concept',
      artist: 'David Rodriguez',
      date: '2023-06-12',
      status: 'pending',
      aiScore: 0.45,
      complianceScore: 78,
      reviewType: 'automated',
      image:
        'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=2070&auto=format&fit=crop',
    },
    {
      id: 'sub-5',
      title: 'Movie Scene Reimagining',
      artist: 'Lisa Thompson',
      date: '2023-06-11',
      status: 'rejected',
      aiScore: 0.08,
      complianceScore: 45,
      reviewType: 'manual',
      image:
        'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?q=80&w=2069&auto=format&fit=crop',
    },
    {
      id: 'sub-6',
      title: 'Video Game Character Art',
      artist: 'James Wilson',
      date: '2023-06-10',
      status: 'approved',
      aiScore: 0.05,
      complianceScore: 92,
      reviewType: 'automated',
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    },
  ];

  return (
    <DashboardShell>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/compliance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance History</h1>
          <p className="text-muted-foreground">
            View the history of compliance checks for fan art submissions
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full gap-2 md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search submissions..." className="w-full pl-8" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Date Range</DropdownMenuItem>
              <DropdownMenuItem>AI Score</DropdownMenuItem>
              <DropdownMenuItem>Compliance Score</DropdownMenuItem>
              <DropdownMenuItem>Review Type</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submission</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Review Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complianceHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="font-medium">{item.title}</div>
                  </div>
                </TableCell>
                <TableCell>{item.artist}</TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {item.status === 'approved' ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Approved
                      </Badge>
                    ) : item.status === 'rejected' ? (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Rejected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${item.aiScore > 0.5 ? 'bg-red-500' : 'bg-green-500'}`}
                    />
                    <span>{(item.aiScore * 100).toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        item.complianceScore < 70
                          ? 'bg-red-500'
                          : item.complianceScore < 90
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                    />
                    <span>{item.complianceScore}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {item.reviewType === 'automated' ? (
                      <Bot className="mr-1 h-3 w-3" />
                    ) : (
                      <FileText className="mr-1 h-3 w-3" />
                    )}
                    {item.reviewType === 'automated' ? 'Automated' : 'Manual'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/compliance/history/${item.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  );
}
