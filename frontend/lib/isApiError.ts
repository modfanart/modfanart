import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

function isApiError(error: unknown): error is FetchBaseQueryError & { data: { message?: string } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as any).data === 'object'
  );
}

export default isApiError;
