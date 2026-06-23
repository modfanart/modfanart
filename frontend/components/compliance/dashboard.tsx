"use client"

import Link from "next/link"
import { Shield, FileText, Bot, Settings, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DashboardShell } from "@/components/dashboard-shell"

export function ComplianceDashboard() {
  // Sample data for compliance stats
  const stats = {
    totalSubmissions: 124,
    approved: 98,
    rejected: 18,
    pending: 8,
    aiDetected: 12,
    complianceScore: 92,
  }

  // Sample data for recent compliance checks
  const recentChecks = [
    {
      id: "check-1",
      title: "Anime Character Redesign",
      artist: "Sarah Johnson",
      status: "approved",
      date: "2023-06-12",
      aiScore: 0.02,
      complianceIssues: 0,
    },
    {
      id: "check-2",
      title: "Superhero Fan Art",
      artist: "Michael Chen",
      status: "rejected",
      date: "2023-06-10",
      aiScore: 0.97,
      complianceIssues: 1,
    },
    {
      id: "check-3",
      title: "Fantasy Character Concept",
      artist: "Emma Wilson",
      status: "pending",
      date: "2023-06-14",
      aiScore: 0.15,
      complianceIssues: 0,
    },
    {
      id: "check-4",
      title: "Game Character Illustration",
      artist: "David Rodriguez",
      status: "rejected",
      date: "2023-06-09",
      aiScore: 0.12,
      complianceIssues: 3,
    },
  ]

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IP Compliance</h1>
          <p className="text-muted-foreground">
            Manage brand guidelines and AI screening settings for fan art submissions.
          </p>
        </div>
        <Link href="/dashboard/compliance/settings">
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Compliance Settings
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">+5 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceScore}%</div>
            <Progress value={stats.complianceScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Detected</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiDetected}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.aiDetected / stats.totalSubmissions) * 100).toFixed(1)}% of submissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium">All Systems Active</div>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                AI Screening
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Guidelines
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Compliance Checks</CardTitle>
            <CardDescription>Latest submissions that have gone through compliance screening</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChecks.map((check) => (
                <div key={check.id} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="font-medium">{check.title}</div>
                    <div className="text-sm text-muted-foreground">By {check.artist}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={
                        check.status === "approved"
                          ? "outline"
                          : check.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className={
                        check.status === "approved"
                          ? "bg-green-50 text-green-700"
                          : check.status === "rejected"
                            ? ""
                            : "bg-yellow-50 text-yellow-700"
                      }
                    >
                      {check.status === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {check.status === "rejected" && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {check.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                      {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                    </Badge>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>AI: {(check.aiScore * 100).toFixed(0)}%</span>
                      <span>•</span>
                      <span>Issues: {check.complianceIssues}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/compliance/history" className="w-full">
              <Button variant="outline" className="w-full">
                View All Compliance Checks
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your compliance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/compliance/guidelines" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Edit Brand Guidelines
              </Button>
            </Link>
            <Link href="/dashboard/compliance/ai-screening" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Bot className="mr-2 h-4 w-4" />
                Configure AI Screening
              </Button>
            </Link>
            <Link href="/dashboard/compliance/automated-review" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Automated Review Settings
              </Button>
            </Link>
            <Link href="/dashboard/compliance/history" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                View Compliance History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

