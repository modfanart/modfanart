import { logger } from '../logger';

type RetryOptions = {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
  jitter: boolean;
};

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 300,
  maxDelay: 3000,
  factor: 2,
  jitter: true,
};

/**
 * Calculate backoff delay with optional jitter
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  const { initialDelay, maxDelay, factor, jitter } = options;

  // Calculate exponential backoff
  let delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay);

  // Add jitter if enabled (±25%)
  if (jitter) {
    const jitterFactor = 0.5 + Math.random();
    delay = Math.floor(delay * jitterFactor);
  }

  return delay;
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const retryOptions = { ...defaultOptions, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retryOptions.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (attempt < retryOptions.maxRetries - 1) {
        const delay = calculateDelay(attempt, retryOptions);

        logger.warn(`Retry attempt ${attempt + 1}/${retryOptions.maxRetries} after ${delay}ms`, {
          context: 'retry',
          error: lastError.message,
        });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors are usually retryable
  if (error instanceof TypeError && error.message.includes('network')) {
    return true;
  }

  // Timeout errors are retryable
  if (error.name === 'AbortError' && error.message.includes('timeout')) {
    return true;
  }

  // Server errors (5xx) are retryable
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }

  // Rate limiting (429) is retryable
  if (error.status === 429) {
    return true;
  }

  return false;
}
