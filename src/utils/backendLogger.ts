/**
 * Backend Terminal Audit Logger Utility
 * Simulates real-time Spring Boot server terminal log output
 * Output format: Timestamp | Username | Action | Endpoint | HTTP Method | Execution Time | Status
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  executionTimeMs: number;
  status: number;
  details?: string;
}

const auditLogListeners: Set<(log: AuditLogEntry) => void> = new Set();
const auditLogHistory: AuditLogEntry[] = [];

export const onBackendLog = (listener: (log: AuditLogEntry) => void): (() => void) => {
  auditLogListeners.add(listener);
  return () => auditLogListeners.delete(listener);
};

export const getBackendLogHistory = (): AuditLogEntry[] => [...auditLogHistory];

export const logBackendAction = (
  action: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  status: number = 200,
  username: string = 'admin.rajesh',
  executionTimeMs?: number,
  details?: string
): AuditLogEntry => {
  const timeMs = executionTimeMs ?? Math.floor(12 + Math.random() * 38);
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    username,
    action,
    endpoint,
    method,
    executionTimeMs: timeMs,
    status,
    details,
  };

  auditLogHistory.unshift(entry);
  if (auditLogHistory.length > 200) auditLogHistory.pop();

  // Styled browser/terminal console print out mimicking Spring Boot stdout
  const statusColor = status >= 200 && status < 300 ? '#10b981' : status >= 400 ? '#f43f5e' : '#f59e0b';
  console.log(
    `%c[SPRING BOOT BACKEND LOG]%c ${entry.timestamp} | %c${entry.username}%c | %c${entry.action}%c | %c${entry.method} ${entry.endpoint}%c | Status: %c${entry.status}%c (${entry.executionTimeMs}ms)`,
    'color: #8b5cf6; font-weight: bold;',
    'color: #64748b;',
    'color: #3b82f6; font-weight: bold;',
    'color: #64748b;',
    'color: #10b981; font-weight: bold;',
    'color: #64748b;',
    'color: #06b6d4; font-weight: bold;',
    'color: #64748b;',
    `color: ${statusColor}; font-weight: bold;`,
    'color: #64748b;'
  );

  auditLogListeners.forEach((listener) => {
    try {
      listener(entry);
    } catch (err) {
      console.error('[BackendLogger] Error notifying log listener:', err);
    }
  });

  return entry;
};
