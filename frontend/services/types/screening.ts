/**
 * AI artwork screening types.
 *
 * These types describe the screening result returned by the backend.
 * They are intentionally separate from SubmissionStatus and AIAnalysis
 * because screening is an assessment of an artwork, not the submission's
 * overall workflow status.
 */

export type ScreeningVerdict =
  | 'approved'
  | 'rejected'
  | 'needs_review'
  | 'pending';

export type ScreeningReason =
  | 'ai_generated'
  | 'copyright'
  | 'brand_guidelines'
  | 'content_safety'
  | 'prohibited_content'
  | 'quality'
  | 'rule_match'
  | 'unknown';

export interface ScreeningReasonDetail {
  code: ScreeningReason;
  message: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface ScreeningResult {
  id: string;
  artworkId: string;

  verdict: ScreeningVerdict;

  reasons: ScreeningReasonDetail[];

  /**
   * Whether the screening result requires human review.
   * This is informational for the frontend; the frontend should not
   * determine this value.
   */
  needsHumanReview: boolean;

  /**
   * Timestamp for when this screening run was completed.
   */
  completedAt?: string | null;

  /**
   * Timestamp for when this screening run was created.
   */
  createdAt: string;

  /**
   * Optional screening metadata returned by the backend.
   * Keep this flexible until the final API response shape is confirmed.
   */
  metadata?: Record<string, unknown>;
}

export interface ScreeningRun {
  id: string;
  artworkId: string;

  verdict: ScreeningVerdict;

  reasons: ScreeningReasonDetail[];

  needsHumanReview: boolean;

  createdAt: string;
  completedAt?: string | null;

  metadata?: Record<string, unknown>;
}

export interface ScreeningHistoryResponse {
  runs: ScreeningRun[];
}