const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

interface Attempts {
  count: number;
  windowStart: number;
  lockedUntil: number | null;
}

const attemptsByKey = new Map<string, Attempts>();

function keyFor(tagId: string, ip: string): string {
  return `${tagId}:${ip}`;
}

/** Returns remaining lockout ms if this tag/IP is currently locked out, otherwise null. */
export function checkPinLockout(tagId: string, ip: string): number | null {
  const entry = attemptsByKey.get(keyFor(tagId, ip));
  if (!entry?.lockedUntil) {
    return null;
  }
  const remaining = entry.lockedUntil - Date.now();
  return remaining > 0 ? remaining : null;
}

/** Records a failed PIN attempt, locking out the tag/IP pair after too many failures. */
export function recordFailedPinAttempt(tagId: string, ip: string): void {
  const key = keyFor(tagId, ip);
  const now = Date.now();
  const entry = attemptsByKey.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attemptsByKey.set(key, { count: 1, windowStart: now, lockedUntil: null });
    return;
  }

  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
  }
}

/** Clears failed-attempt tracking after a successful PIN check. */
export function clearPinAttempts(tagId: string, ip: string): void {
  attemptsByKey.delete(keyFor(tagId, ip));
}
