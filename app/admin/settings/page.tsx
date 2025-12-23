"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Save, RefreshCw, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  // State for feature flags
  const [featureFlags, setFeatureFlags] = useState({
    enableGrokIntegration: false,
    enableAiModeration: true,
    enableAutoApproval: false,
    enableAnalytics: true,
    enableBetaFeatures: false,
  })

  // State for moderation settings
  const [moderationSettings, setModerationSettings] = useState({
    thresholds: {
      aiScore: 0.7,
      ipCompliance: 7,
      contentSafety: 7,
      autoApprove: 3,
      autoReject: 8,
    },
    reviewQueue: {
      maxItems: 100,
      assignmentTimeout: 30, // minutes
    },
  })

  // State for system limits
  const [limits, setLimits] = useState({
    maxSubmissionSize: 5 * 1024 * 1024, // 5MB
    maxSubmissionsPerUser: 10,
    maxSubmissionsPerDay: 1000,
    maxApiRequestsPerMinute: 60,
  })

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<any>(null)

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/settings")

        if (!response.ok) {
          throw new Error("Failed to load settings")
        }

        const data = await response.json()

        // Update state with fetched data
        setFeatureFlags(data.featureFlags)
        setModerationSettings(data.moderationSettings)
        setLimits(data.limits)

        // Store original settings for comparison
        setOriginalSettings({
          featureFlags: { ...data.featureFlags },
          moderationSettings: JSON.parse(JSON.stringify(data.moderationSettings)),
          limits: { ...data.limits },
        })

        setHasChanges(false)
      } catch (error) {
        setError("Failed to load settings. Please try again.")
        console.error("Error loading settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Check for changes
  useEffect(() => {
    if (!originalSettings) return

    const currentSettings = {
      featureFlags,
      moderationSettings,
      limits,
    }

    const settingsChanged = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings)
    setHasChanges(settingsChanged)
  }, [featureFlags, moderationSettings, limits, originalSettings])

  // Handle feature flag toggle
  const handleFeatureFlagToggle = (key: string) => {
    setFeatureFlags((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  // Handle moderation threshold change
  const handleThresholdChange = (key: string, value: number) => {
    setModerationSettings((prev) => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: value,
      },
    }))
  }

  // Handle review queue settings change
  const handleReviewQueueChange = (key: string, value: number) => {
    setModerationSettings((prev) => ({
      ...prev,
      reviewQueue: {
        ...prev.reviewQueue,
        [key]: value,
      },
    }))
  }

  // Handle limits change
  const handleLimitChange = (key: string, value: number) => {
    setLimits((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Reset settings to original values
  const resetSettings = () => {
    if (!originalSettings) return

    setFeatureFlags({ ...originalSettings.featureFlags })
    setModerationSettings(JSON.parse(JSON.stringify(originalSettings.moderationSettings)))
    setLimits({ ...originalSettings.limits })
    setHasChanges(false)
  }

  // Save settings
  const saveSettings = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featureFlags,
          moderationSettings,
          limits,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save settings")
      }

      // Update original settings
      setOriginalSettings({
        featureFlags: { ...featureFlags },
        moderationSettings: JSON.parse(JSON.stringify(moderationSettings)),
        limits: { ...limits },
      })

      setHasChanges(false)
      setSuccessMessage("Settings saved successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save settings. Please try again.")
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={resetSettings} disabled={isLoading || isSaving}>
              Discard Changes
            </Button>
          )}
          <Button onClick={saveSettings} disabled={isLoading || isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-60" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="feature-flags">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feature-flags">Feature Flags</TabsTrigger>
            <TabsTrigger value="moderation">Moderation Settings</TabsTrigger>
            <TabsTrigger value="limits">System Limits</TabsTrigger>
          </TabsList>

          {/* Feature Flags Tab */}
          <TabsContent value="feature-flags">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(featureFlags).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={key} className="text-base font-medium">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                            .replace(/Enable/g, "")}
                        </Label>
                        <p className="text-sm text-gray-500">{getFeatureFlagDescription(key)}</p>
                      </div>
                      <Switch id={key} checked={value} onCheckedChange={() => handleFeatureFlagToggle(key)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Settings Tab */}
          <TabsContent value="moderation">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Settings</CardTitle>
                <CardDescription>Configure thresholds and review queue settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Thresholds</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="aiScore">AI Score Threshold</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Submissions with AI scores above this threshold will be flagged as AI-generated.
                                  Higher values are more permissive.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm">{moderationSettings.thresholds.aiScore.toFixed(2)}</span>
                      </div>
                      <Slider
                        id="aiScore"
                        min={0}
                        max={1}
                        step={0.05}
                        value={[moderationSettings.thresholds.aiScore]}
                        onValueChange={([value]) => handleThresholdChange("aiScore", value)}
                      />
                      <p className="text-xs text-gray-500">
                        Submissions with AI scores above this threshold will be flagged as AI-generated
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="ipCompliance">IP Compliance Threshold</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Submissions with IP compliance scores above this threshold will be flagged for review.
                                  Higher values are more strict.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm">{moderationSettings.thresholds.ipCompliance}</span>
                      </div>
                      <Slider
                        id="ipCompliance"
                        min={1}
                        max={10}
                        step={1}
                        value={[moderationSettings.thresholds.ipCompliance]}
                        onValueChange={([value]) => handleThresholdChange("ipCompliance", value)}
                      />
                      <p className="text-xs text-gray-500">
                        Submissions with IP compliance scores above this threshold will be flagged for review
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="contentSafety">Content Safety Threshold</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Submissions with content safety scores above this threshold will be flagged for
                                  review. Higher values are more strict.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm">{moderationSettings.thresholds.contentSafety}</span>
                      </div>
                      <Slider
                        id="contentSafety"
                        min={1}
                        max={10}
                        step={1}
                        value={[moderationSettings.thresholds.contentSafety]}
                        onValueChange={([value]) => handleThresholdChange("contentSafety", value)}
                      />
                      <p className="text-xs text-gray-500">
                        Submissions with content safety scores above this threshold will be flagged for review
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="autoApprove">Auto-Approve Threshold</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Submissions with overall risk scores below this threshold will be auto-approved. Lower
                                  values are more strict.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm">{moderationSettings.thresholds.autoApprove}</span>
                      </div>
                      <Slider
                        id="autoApprove"
                        min={1}
                        max={10}
                        step={1}
                        value={[moderationSettings.thresholds.autoApprove]}
                        onValueChange={([value]) => handleThresholdChange("autoApprove", value)}
                      />
                      <p className="text-xs text-gray-500">
                        Submissions with overall risk scores below this threshold will be auto-approved
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="autoReject">Auto-Reject Threshold</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Submissions with overall risk scores above this threshold will be auto-rejected.
                                  Higher values are more permissive.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm">{moderationSettings.thresholds.autoReject}</span>
                      </div>
                      <Slider
                        id="autoReject"
                        min={1}
                        max={10}
                        step={1}
                        value={[moderationSettings.thresholds.autoReject]}
                        onValueChange={([value]) => handleThresholdChange("autoReject", value)}
                      />
                      <p className="text-xs text-gray-500">
                        Submissions with overall risk scores above this threshold will be auto-rejected
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Review Queue</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxItems">Max Queue Items</Label>
                        <Input
                          id="maxItems"
                          type="number"
                          min={10}
                          max={1000}
                          value={moderationSettings.reviewQueue.maxItems}
                          onChange={(e) => handleReviewQueueChange("maxItems", Number.parseInt(e.target.value))}
                        />
                        <p className="text-xs text-gray-500">Maximum number of items in the review queue</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assignmentTimeout">Assignment Timeout (minutes)</Label>
                        <Input
                          id="assignmentTimeout"
                          type="number"
                          min={5}
                          max={120}
                          value={moderationSettings.reviewQueue.assignmentTimeout}
                          onChange={(e) =>
                            handleReviewQueueChange("assignmentTimeout", Number.parseInt(e.target.value))
                          }
                        />
                        <p className="text-xs text-gray-500">
                          Time before an assigned review item is returned to the queue
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Limits Tab */}
          <TabsContent value="limits">
            <Card>
              <CardHeader>
                <CardTitle>System Limits</CardTitle>
                <CardDescription>Configure system-wide limits and quotas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxSubmissionSize">Max Submission Size (bytes)</Label>
                    <Input
                      id="maxSubmissionSize"
                      type="number"
                      min={1024 * 1024} // 1MB
                      max={20 * 1024 * 1024} // 20MB
                      value={limits.maxSubmissionSize}
                      onChange={(e) => handleLimitChange("maxSubmissionSize", Number.parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">
                      Maximum file size for submissions ({formatBytes(limits.maxSubmissionSize)})
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxSubmissionsPerUser">Max Submissions Per User</Label>
                    <Input
                      id="maxSubmissionsPerUser"
                      type="number"
                      min={1}
                      max={100}
                      value={limits.maxSubmissionsPerUser}
                      onChange={(e) => handleLimitChange("maxSubmissionsPerUser", Number.parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">Maximum number of submissions per user per day</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxSubmissionsPerDay">Max Submissions Per Day</Label>
                    <Input
                      id="maxSubmissionsPerDay"
                      type="number"
                      min={100}
                      max={10000}
                      value={limits.maxSubmissionsPerDay}
                      onChange={(e) => handleLimitChange("maxSubmissionsPerDay", Number.parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">Maximum number of submissions across all users per day</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxApiRequestsPerMinute">Max API Requests Per Minute</Label>
                    <Input
                      id="maxApiRequestsPerMinute"
                      type="number"
                      min={10}
                      max={1000}
                      value={limits.maxApiRequestsPerMinute}
                      onChange={(e) => handleLimitChange("maxApiRequestsPerMinute", Number.parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">Maximum number of API requests per minute per IP</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Note: Changes to system limits may require a service restart to take full effect.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// Helper function to get feature flag descriptions
function getFeatureFlagDescription(key: string): string {
  const descriptions: Record<string, string> = {
    enableGrokIntegration: "Use GrokAi for advanced content analysis and moderation",
    enableAiModeration: "Use AI services for automated content moderation",
    enableAutoApproval: "Automatically approve submissions that meet certain criteria",
    enableAnalytics: "Collect and analyze submission and user activity data",
    enableBetaFeatures: "Enable experimental features that are still in development",
  }

  return descriptions[key] || "No description available"
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

