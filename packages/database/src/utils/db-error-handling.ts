// Database error handling utilities

// Identify transient database errors that should be retried
export function isTransientError(error: any): boolean {
  // PostgreSQL error codes for transient errors
  const transientCodes = [
    '40001', // serialization_failure
    '40P01', // deadlock_detected  
    '55P03', // lock_not_available
    '57P01', // admin_shutdown
    '57P02', // crash_shutdown
    '57P03', // cannot_connect_now
    '58000', // system_error
    '58030', // io_error
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '53300', // too_many_connections
    '53400', // configuration_limit_exceeded
  ];
  
  // Check error code
  if (error?.code && transientCodes.includes(error.code)) {
    return true;
  }
  
  // Check error message for connection issues
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('enotfound') ||
    message.includes('connection') && message.includes('timeout') ||
    message.includes('connection') && message.includes('refused')
  );
}