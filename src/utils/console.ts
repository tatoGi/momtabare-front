/**
 * Console utilities for cleaner logging
 */

// Track repeated errors to avoid spam
const errorCounts = new Map<string, number>();
const MAX_REPEATED_ERRORS = 3;

/**
 * Log error with deduplication to prevent console spam
 */
export function logError(message: string, error?: any, context?: string) {
  const errorKey = `${message}-${context || 'general'}`;
  const count = errorCounts.get(errorKey) || 0;
  
  if (count < MAX_REPEATED_ERRORS) {
    if (count > 0) {
      console.warn(`⚠️ [${count + 1}/${MAX_REPEATED_ERRORS}] ${message}`, error);
    } else {
      console.error(`❌ ${message}`, error);
    }
    errorCounts.set(errorKey, count + 1);
  } else if (count === MAX_REPEATED_ERRORS) {
    console.warn(`🔇 Suppressing repeated error: ${message} (use clearErrorLogs() to reset)`);
    errorCounts.set(errorKey, count + 1);
  }
}

/**
 * Clear error tracking (useful for debugging)
 */
export function clearErrorLogs() {
  errorCounts.clear();
  console.log('🧹 Error logs cleared');
}

/**
 * Log success with consistent formatting
 */
export function logSuccess(message: string, data?: any) {
  console.log(`✅ ${message}`, data);
}

/**
 * Log info with consistent formatting
 */
export function logInfo(message: string, data?: any) {
  console.log(`ℹ️ ${message}`, data);
}

/**
 * Log warning with consistent formatting
 */
export function logWarning(message: string, data?: any) {
  console.warn(`⚠️ ${message}`, data);
}
