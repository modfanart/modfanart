"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react"

// Sample categories and IPs for the form
const SAMPLE_CATEGORIES = ["Fan Art", "Digital Art", "Illustration", "Comic", "Animation", "Other"]
const SAMPLE_IPS = ["Marvel", "Star Wars", "Disney", "DC Comics", "Nintendo", "Other"]

export default function ModerationInspector() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [submissionId, setSubmissionId] = useState("")
  const [activeTab, setActiveTab] = useState("test")

  // Form state for the test tab
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    category: "Fan Art",
    originalIp: "Marvel",
    tags: "",
    imageUrl: "",
    licenseType: "commercial",
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/moderation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          testMode: true, // Flag to indicate this is just a test, don't create a real submission
        }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submissionId.trim()) {
      setError("Please enter a submission ID")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/submissions/${submissionId}/analysis`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Helper to render JSON data with proper formatting and styling
  const renderJsonView = (data: any) => {
    if (!data) return <div className="text-muted-foreground">No data available</div>

    return (
      <div className="bg-secondary/50 p-4 rounded-md overflow-auto max-h-[70vh]">
        <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  }

  // Helper to render a summary card with key findings
  const renderAnalysisSummary = () => {
    if (!result || !result.analysis) return null

    const { aiDetection, contentAnalysis, finalRecommendation, needsHumanReview } = result.analysis

    // Determine status color and icon
    let statusColor = "bg-gray-100"
    let StatusIcon = Info
    let statusText = "Unknown"

    if (finalRecommendation === "approve") {
      statusColor = "bg-green-100 text-green-800"
      StatusIcon = CheckCircle2
      statusText = "Approved"
    } else if (finalRecommendation === "reject") {
      statusColor = "bg-red-100 text-red-800"
      StatusIcon = AlertTriangle
      statusText = "Rejected"
    } else if (finalRecommendation === "review") {
      statusColor = "bg-yellow-100 text-yellow-800"
      StatusIcon = AlertTriangle
      statusText = "Needs Review"
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">AI Detection Score</span>
                <span className="font-medium">{aiDetection.score.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">AI Generated</span>
                <span className={aiDetection.isAiGenerated ? "text-red-600" : "text-green-600"}>
                  {aiDetection.isAiGenerated ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">IP Compliance Score</span>
                <span className="font-medium">{contentAnalysis.ipCompliance?.score || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Content Safety Score</span>
                <span className="font-medium">{contentAnalysis.contentSafety?.score || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Overall Risk</span>
                <span className="font-medium">{contentAnalysis.overallRiskScore || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${statusColor}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Final Recommendation</div>
                    <div className="text-xl font-bold">{statusText}</div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {needsHumanReview ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Human Review Required</AlertTitle>
                      <AlertDescription>This submission needs manual review before final approval</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="py-2">Automated decision based on combined analysis</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Tabs defaultValue="test" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="test">Test Moderation</TabsTrigger>
          <TabsTrigger value="lookup">Lookup Submission</TabsTrigger>
          {result && <TabsTrigger value="results">Results</TabsTrigger>}
        </TabsList>

        <TabsContent value="test">
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formState.title}
                  onChange={handleFormChange}
                  placeholder="Submission title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formState.imageUrl}
                  onChange={handleFormChange}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleFormChange}
                placeholder="Describe your submission"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formState.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalIp">Original IP</Label>
                <Select value={formState.originalIp} onValueChange={(value) => handleSelectChange("originalIp", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select original IP" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_IPS.map((ip) => (
                      <SelectItem key={ip} value={ip}>
                        {ip}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formState.tags}
                onChange={handleFormChange}
                placeholder="fanart, digital, character"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseType">License Type</Label>
              <Select value={formState.licenseType} onValueChange={(value) => handleSelectChange("licenseType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select license type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Test Moderation"
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="lookup">
          <form onSubmit={handleLookupSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="submissionId">Submission ID</Label>
              <Input
                id="submissionId"
                value={submissionId}
                onChange={(e) => setSubmissionId(e.target.value)}
                placeholder="Enter submission ID"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Lookup Submission"
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="results">
          {result && (
            <div className="space-y-6">
              {renderAnalysisSummary()}

              <div className="space-y-4">
                <Tabs defaultValue="combined">
                  <TabsList>
                    <TabsTrigger value="combined">Combined Analysis</TabsTrigger>
                    <TabsTrigger value="aiornot">AIORNOT Results</TabsTrigger>
                    <TabsTrigger value="openai">OpenAI Analysis</TabsTrigger>
                    <TabsTrigger value="raw">Raw Response</TabsTrigger>
                  </TabsList>

                  <TabsContent value="combined" className="mt-4">
                    {renderJsonView(result.analysis)}
                  </TabsContent>

                  <TabsContent value="aiornot" className="mt-4">
                    {renderJsonView(result.analysis?.aiDetection || result.aiornot)}
                  </TabsContent>

                  <TabsContent value="openai" className="mt-4">
                    {renderJsonView(result.analysis?.contentAnalysis || result.openai)}
                  </TabsContent>

                  <TabsContent value="raw" className="mt-4">
                    {renderJsonView(result)}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

