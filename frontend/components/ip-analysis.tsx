import { AlertCircle, CheckCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface IpAnalysisProps {
  analysis: {
    score: number;
    recommendations: string[];
    detectedElements: {
      name: string;
      confidence: number;
      ipOwner: string;
    }[];
  };
}

export function IpAnalysis({ analysis }: IpAnalysisProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">IP Compliance Score</h3>
          <span className="text-sm font-medium">{analysis.score}%</span>
        </div>
        <Progress value={analysis.score} className="mt-2" />
        <Alert
          className={`mt-4 ${analysis.score >= 70 ? 'bg-success-subtle border-success/30' : 'bg-warning-subtle border-warning/30'}`}
        >
          {analysis.score >= 70 ? (
            <CheckCircle className="h-4 w-4 text-success" />
          ) : (
            <AlertCircle className="h-4 w-4 text-warning-strong" />
          )}
          <AlertTitle className={analysis.score >= 70 ? 'text-success' : 'text-warning-strong'}>
            {analysis.score >= 70 ? 'Likely Compliant' : 'Requires Review'}
          </AlertTitle>
          <AlertDescription className={analysis.score >= 70 ? 'text-success' : 'text-warning-strong'}>
            {analysis.score >= 70
              ? 'This submission appears to comply with IP guidelines.'
              : 'This submission requires manual review for IP compliance.'}
          </AlertDescription>
        </Alert>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium">Recommendations</h3>
        <ul className="mt-2 space-y-1">
          {analysis.recommendations.map((recommendation, index) => (
            <li key={index} className="text-sm">
              • {recommendation}
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium">Detected Elements</h3>
        <div className="mt-2 space-y-3">
          {analysis.detectedElements.map((element, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{element.name}</span>
                <span className="text-xs text-muted-foreground">
                  Confidence: {(element.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">IP Owner: {element.ipOwner}</span>
                <Progress value={element.confidence * 100} className="w-1/3 h-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
