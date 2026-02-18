'use client';

import { AlertCircle, CheckCircle, XCircle, Clock, BarChart, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ModerationMetrics {
  submissionCounts: {
    pending: number;
    review: number;
    approved: number;
    rejected: number;
    licensed: number;
    total: number;
  };
  aiDetection: {
    threshold: number;
    autoRejectThreshold: number;
    autoApproveThreshold: number;
  };
  complianceSettings: {
    requireHumanReview: boolean;
    contentSafetyThreshold: number;
    ipComplianceThreshold: number;
  };
  timestamp: string;
}

export function ModerationDashboard() {
  const [metrics, setMetrics] = useState<ModerationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/moderation/metrics', {
        headers: {
          Authorization: `Bearer ${process.env.BYPASS_AUTH ? 'bypass' : 'admin-token'}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setMetrics(data.metrics);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      console.error('Error fetching moderation metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading moderation metrics...</p>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load moderation metrics: {error}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={fetchMetrics}>
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return null;
  }

  const { submissionCounts, aiDetection, complianceSettings } = metrics;
  const totalSubmissions = submissionCounts.total || 1; // Avoid division by zero

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Moderation Dashboard</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMetrics}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {lastUpdated && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionCounts.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionCounts.review}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((submissionCounts.review / totalSubmissions) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionCounts.approved}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((submissionCounts.approved / totalSubmissions) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionCounts.rejected}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((submissionCounts.rejected / totalSubmissions) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
              <CardDescription>Current distribution of submissions by status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-amber-400 mr-2" />
                    <span>Pending</span>
                  </div>
                  <span>{submissionCounts.pending}</span>
                </div>
                <Progress
                  value={(submissionCounts.pending / totalSubmissions) * 100}
                  className="bg-muted h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />
                    <span>In Review</span>
                  </div>
                  <span>{submissionCounts.review}</span>
                </div>
                <Progress
                  value={(submissionCounts.review / totalSubmissions) * 100}
                  className="bg-muted h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                    <span>Approved</span>
                  </div>
                  <span>{submissionCounts.approved}</span>
                </div>
                <Progress
                  value={(submissionCounts.approved / totalSubmissions) * 100}
                  className="bg-muted h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                    <span>Rejected</span>
                  </div>
                  <span>{submissionCounts.rejected}</span>
                </div>
                <Progress
                  value={(submissionCounts.rejected / totalSubmissions) * 100}
                  className="bg-muted h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500 mr-2" />
                    <span>Licensed</span>
                  </div>
                  <span>{submissionCounts.licensed}</span>
                </div>
                <Progress
                  value={(submissionCounts.licensed / totalSubmissions) * 100}
                  className="bg-muted h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Detection Settings</CardTitle>
              <CardDescription>Current thresholds for AI-powered moderation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AI Detection Threshold</span>
                  <span className="text-sm">{aiDetection.threshold * 100}%</span>
                </div>
                <Progress value={aiDetection.threshold * 100} className="bg-muted h-2" />
                <p className="text-xs text-muted-foreground">
                  Images with AI score above this threshold are flagged as AI-generated
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-Reject Threshold</span>
                  <span className="text-sm">{aiDetection.autoRejectThreshold * 100}%</span>
                </div>
                <Progress value={aiDetection.autoRejectThreshold * 100} className="bg-muted h-2" />
                <p className="text-xs text-muted-foreground">
                  Images with AI score above this threshold are automatically rejected
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Content Safety Threshold</span>
                  <span className="text-sm">
                    {complianceSettings.contentSafetyThreshold * 100}%
                  </span>
                </div>
                <Progress
                  value={complianceSettings.contentSafetyThreshold * 100}
                  className="bg-muted h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">IP Compliance Threshold</span>
                  <span className="text-sm">{complianceSettings.ipComplianceThreshold * 100}%</span>
                </div>
                <Progress
                  value={complianceSettings.ipComplianceThreshold * 100}
                  className="bg-muted h-2"
                />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Human review is {complianceSettings.requireHumanReview ? 'required' : 'optional'}{' '}
                for flagged submissions
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
