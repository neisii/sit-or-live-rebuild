import { invoke } from '@tauri-apps/api/core';

/**
 * Log Service
 * Manages application logs - reading, exporting, and opening log directory
 */

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

/**
 * Read backend logs from Tauri
 */
export async function readBackendLogs(): Promise<string> {
  try {
    const logs = await invoke<string>('read_backend_logs');
    return logs;
  } catch (error) {
    console.error('Failed to read backend logs:', error);
    return '# Error reading logs\n\nFailed to read backend logs. Please check the log directory manually.';
  }
}

/**
 * Open the log directory in file explorer
 */
export async function openLogDirectory(): Promise<void> {
  try {
    await invoke('open_log_directory');
  } catch (error) {
    console.error('Failed to open log directory:', error);
    throw new Error('Failed to open log directory');
  }
}

/**
 * Export logs to a file
 */
export async function exportLogs(): Promise<void> {
  try {
    const logs = await readBackendLogs();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sit-or-live-logs-${timestamp}.txt`;
    
    // Create a blob and download
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export logs:', error);
    throw new Error('Failed to export logs');
  }
}

/**
 * Parse log string into structured entries
 */
export function parseLogs(logString: string): LogEntry[] {
  const lines = logString.split('\n');
  const entries: LogEntry[] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Try to parse structured logs
    // Format: [TIMESTAMP] LEVEL: message
    const match = line.match(/\[([^\]]+)\]\s+(\w+):\s+(.+)/);
    if (match) {
      entries.push({
        timestamp: match[1],
        level: match[2],
        message: match[3],
      });
    } else {
      // Fallback for unstructured logs
      entries.push({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: line,
      });
    }
  }
  
  return entries;
}

/**
 * Filter logs by level
 */
export function filterLogsByLevel(entries: LogEntry[], level: string): LogEntry[] {
  return entries.filter(entry => entry.level === level);
}

/**
 * Get log statistics
 */
export function getLogStats(entries: LogEntry[]): {
  total: number;
  byLevel: Record<string, number>;
} {
  const byLevel: Record<string, number> = {};
  
  for (const entry of entries) {
    byLevel[entry.level] = (byLevel[entry.level] || 0) + 1;
  }
  
  return {
    total: entries.length,
    byLevel,
  };
}

/**
 * Clear frontend logs (localStorage)
 */
export function clearFrontendLogs(): void {
  localStorage.removeItem('app_logs');
}

/**
 * Log to frontend storage
 */
export function logToFrontend(level: string, message: string): void {
  const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
  });
  
  // Keep only last 1000 entries
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  
  localStorage.setItem('app_logs', JSON.stringify(logs));
}
