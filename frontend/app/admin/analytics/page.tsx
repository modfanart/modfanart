'use client';

import { useEffect, useState } from 'react';

// Force fully dynamic rendering (no SSR or static prerendering)
export const dynamic = 'force-dynamic';

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Dynamically import only in the browser
        const { getClientFeatureFlags } = await import('@/lib/edge-config');
        const { getSubmissionAnalytics } = await import('@/lib/db/motherduck');

        const flags = await getClientFeatureFlags();
        setFeatureFlags(flags);

        const data = await getSubmissionAnalytics({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        });
        setAnalyticsData(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Submission Analytics</h1>

      {/* Feature flags status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Feature Flags</h2>
        <ul className="space-y-1">
          {Object.entries(featureFlags).map(([key, value]) => (
            <li key={key} className="flex items-center">
              <span
                className={`w-3 h-3 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}
              ></span>
              <span className="font-medium">{key}:</span>
              <span className="ml-2">{value ? 'Enabled' : 'Disabled'}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Analytics data table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Category</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Count</th>
              <th className="py-2 px-4 border">Avg. AI Score</th>
              <th className="py-2 px-4 border">Avg. Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{new Date(row.date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border">{row.category}</td>
                <td className="py-2 px-4 border">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      row.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : row.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-2 px-4 border text-right">{row.count}</td>
                <td className="py-2 px-4 border text-right">
                  {(row.avg_ai_score * 100).toFixed(1)}%
                </td>
                <td className="py-2 px-4 border text-right">{row.avg_risk_score.toFixed(1)}/10</td>
              </tr>
            ))}
            {analyticsData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
