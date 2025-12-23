"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Download } from "lucide-react"
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart as RechartsBarChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Types
type AnalyticsData = {
  submissionsByDate: {
    date: string
    count: number
    approved: number
    rejected: number
    pending: number
  }[]
  submissionsByCategory: {
    category: string
    count: number
    percentage: number
  }[]
  aiScoreDistribution: {
    range: string
    count: number
  }[]
  topIps: {
    originalIp: string
    count: number
    approvalRate: number
  }[]
}

// Props
type AnalyticsDashboardProps = {
  data: AnalyticsData
  onRefresh: () => void
  onDateRangeChange: (startDate: Date, endDate: Date) => void
  onCategoryChange: (category: string) => void
}

// Colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function AnalyticsDashboard({ data, onRefresh, onDateRangeChange, onCategoryChange }: AnalyticsDashboardProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [category, setCategory] = useState<string>("all")

  // Handle date range change
  const handleDateRangeChange = (start?: Date, end?: Date) => {
    if (start) setStartDate(start)
    if (end) setEndDate(end)

    if (start && end) {
      onDateRangeChange(start, end)
    }
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategory(value)
    onCategoryChange(value)
  }

  // Format date range for display
  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
    }
    return "Select date range"
  }

  // Export data as CSV
  const exportData = () => {
    // Convert data to CSV format
    const csvData = [
      // Headers
      ["Date", "Total", "Approved", "Rejected", "Pending"],
      // Rows
      ...data.submissionsByDate.map((row) => [
        row.date,
        row.count.toString(),
        row.approved.toString(),
        row.rejected.toString(),
        row.pending.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    // Create a blob and download link
    const blob = new Blob([csvData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `submissions-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: startDate,
                  to: endDate,
                }}
                onSelect={(range) => {
                  handleDateRangeChange(range?.from, range?.to)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Category Filter */}
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="anime">Anime & Manga</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="movies">Movies & TV</SelectItem>
              <SelectItem value="comics">Comics</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="ips">IP Breakdown</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.submissionsByDate.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">During selected period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const total = data.submissionsByDate.reduce((sum, item) => sum + item.count, 0)
                    const approved = data.submissionsByDate.reduce((sum, item) => sum + item.approved, 0)
                    return total > 0 ? `${Math.round((approved / total) * 100)}%` : "N/A"
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">Approved submissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Detection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const total = data.aiScoreDistribution.reduce((sum, item) => sum + item.count, 0)
                    const aiDetected = data.aiScoreDistribution
                      .filter(
                        (item) =>
                          item.range.startsWith("0.7") || item.range.startsWith("0.8") || item.range.startsWith("0.9"),
                      )
                      .reduce((sum, item) => sum + item.count, 0)
                    return total > 0 ? `${Math.round((aiDetected / total) * 100)}%` : "N/A"
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">AI-generated content</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {data.submissionsByCategory.length > 0 ? data.submissionsByCategory[0].category : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.submissionsByCategory.length > 0
                    ? `${Math.round(data.submissionsByCategory[0].percentage)}% of submissions`
                    : "No data available"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Submissions Over Time</CardTitle>
                <CardDescription>Daily submission counts</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer
                  config={{
                    total: {
                      label: "Total",
                      color: "hsl(var(--chart-1))",
                    },
                    approved: {
                      label: "Approved",
                      color: "hsl(var(--chart-2))",
                    },
                    rejected: {
                      label: "Rejected",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={data.submissionsByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="count" name="total" stroke="var(--color-total)" />
                      <Line type="monotone" dataKey="approved" name="approved" stroke="var(--color-approved)" />
                      <Line type="monotone" dataKey="rejected" name="rejected" stroke="var(--color-rejected)" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Submissions by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={data.submissionsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="category"
                      label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                    >
                      {data.submissionsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} submissions`, name]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Trends</CardTitle>
              <CardDescription>Daily submission counts by status</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer
                config={{
                  approved: {
                    label: "Approved",
                    color: "hsl(var(--chart-1))",
                  },
                  rejected: {
                    label: "Rejected",
                    color: "hsl(var(--chart-2))",
                  },
                  pending: {
                    label: "Pending",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={data.submissionsByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="approved" name="approved" stackId="a" fill="var(--color-approved)" />
                    <Bar dataKey="rejected" name="rejected" stackId="a" fill="var(--color-rejected)" />
                    <Bar dataKey="pending" name="pending" stackId="a" fill="var(--color-pending)" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Score Distribution</CardTitle>
              <CardDescription>Distribution of AI detection scores</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer
                config={{
                  count: {
                    label: "Submissions",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={data.aiScoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="count" name="count" fill="var(--color-count)" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IPs Tab */}
        <TabsContent value="ips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Original IPs</CardTitle>
              <CardDescription>Most popular original IPs in submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Original IP</th>
                      <th className="text-right py-3 px-4">Submissions</th>
                      <th className="text-right py-3 px-4">Approval Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topIps.map((ip, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{ip.originalIp}</td>
                        <td className="text-right py-3 px-4">{ip.count}</td>
                        <td className="text-right py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              ip.approvalRate >= 70
                                ? "bg-green-100 text-green-800"
                                : ip.approvalRate >= 40
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {ip.approvalRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

