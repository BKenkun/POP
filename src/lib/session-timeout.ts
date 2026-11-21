export const USER_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes for customer sessions
export const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes for admin sessions
export const IDLE_WARNING_WINDOW_MS = 2 * 60 * 1000; // Show warning modal in the last 2 minutes
export const SESSION_HEARTBEAT_INTERVAL_MS = 3 * 60 * 1000; // Sync activity to server every 3 minutes
export const ACTIVITY_THROTTLE_MS = 5 * 1000; // Throttle DOM activity writes

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours max server session cookie lifetime
export const LAST_ACTIVITY_STORAGE_KEY = 'purorush_last_activity_at';
export const SESSION_OWNER_STORAGE_KEY = 'purorush_session_owner_uid';
export const SESSION_EXPIRED_QUERY_PARAM = 'expired';

export function getIdleTimeoutMs(isAdmin: boolean): number {
  return isAdmin ? ADMIN_IDLE_TIMEOUT_MS : USER_IDLE_TIMEOUT_MS;
}

export function formatRemainingClock(ms: number): string {
  const clampedSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(clampedSeconds / 60);
  const seconds = clampedSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
