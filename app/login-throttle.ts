export const ATTEMPT_WINDOW_SECONDS = 15 * 60;
export const BLOCK_SECONDS = 15 * 60;
export const MAX_FAILURES = 5;

export type LoginAttemptRecord = { failures: number; windowStartedAt: number; blockedUntil: number } | null | undefined;

export function isBlocked(attempt: LoginAttemptRecord, now: number): { blocked: false } | { blocked: true; retryAfter: number } {
  if (!attempt || attempt.blockedUntil <= now) return { blocked: false };
  return { blocked: true, retryAfter: Math.max(1, attempt.blockedUntil - now) };
}

export function nextFailureState(previous: LoginAttemptRecord, now: number): { failures: number; windowStartedAt: number; blockedUntil: number } {
  const inWindow = Boolean(previous && now - previous.windowStartedAt < ATTEMPT_WINDOW_SECONDS);
  const failures = inWindow ? previous!.failures + 1 : 1;
  return {
    failures,
    windowStartedAt: inWindow ? previous!.windowStartedAt : now,
    blockedUntil: failures >= MAX_FAILURES ? now + BLOCK_SECONDS : 0,
  };
}
