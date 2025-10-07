/**
 * Development tools for debugging and console management
 */

import { clearErrorLogs } from './console';

/**
 * Clear all console logs and reset error tracking
 */
export function clearConsole() {
  console.clear();
  clearErrorLogs();
  console.log('🧹 Console cleared - ready for fresh debugging');
}

/**
 * Enable/disable verbose logging
 */
let verboseLogging = false;

export function setVerboseLogging(enabled: boolean) {
  verboseLogging = enabled;
  console.log(`📊 Verbose logging ${enabled ? 'enabled' : 'disabled'}`);
}

export function isVerboseLogging(): boolean {
  return verboseLogging;
}

/**
 * Log development info
 */
export function devLog(message: string, data?: any) {
  if (verboseLogging) {
    console.log(`🔧 DEV: ${message}`, data);
  }
}

// Make functions available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).clearConsole = clearConsole;
  (window as any).setVerboseLogging = setVerboseLogging;
  (window as any).devLog = devLog;
}
