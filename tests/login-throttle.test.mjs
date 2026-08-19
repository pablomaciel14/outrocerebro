import assert from "node:assert/strict";
import test from "node:test";
import { ATTEMPT_WINDOW_SECONDS, BLOCK_SECONDS, MAX_FAILURES, isBlocked, nextFailureState } from "../app/login-throttle.ts";

test("a first failure is never blocked and starts a fresh window", () => {
  const state = nextFailureState(null, 1000);
  assert.deepEqual(state, { failures: 1, windowStartedAt: 1000, blockedUntil: 0 });
  assert.deepEqual(isBlocked(state, 1000), { blocked: false });
});

test("failures accumulate within the attempt window", () => {
  let state = nextFailureState(null, 1000);
  for (let i = 2; i < MAX_FAILURES; i += 1) {
    state = nextFailureState(state, 1000 + i);
    assert.equal(state.failures, i);
    assert.equal(state.blockedUntil, 0);
    assert.deepEqual(isBlocked(state, 1000 + i), { blocked: false });
  }
});

test("the MAX_FAILURES-th failure inside the window blocks for BLOCK_SECONDS", () => {
  let state = null;
  let now = 5000;
  let lastNow = now;
  for (let i = 0; i < MAX_FAILURES; i += 1) {
    lastNow = now;
    state = nextFailureState(state, now);
    now += 1;
  }
  assert.equal(state.failures, MAX_FAILURES);
  assert.equal(state.blockedUntil, lastNow + BLOCK_SECONDS);
  const result = isBlocked(state, now);
  assert.equal(result.blocked, true);
  assert.ok(result.retryAfter > 0 && result.retryAfter <= BLOCK_SECONDS);
});

test("isBlocked stops blocking exactly once blockedUntil has passed", () => {
  const state = { failures: MAX_FAILURES, windowStartedAt: 1000, blockedUntil: 1000 + BLOCK_SECONDS };
  assert.equal(isBlocked(state, 1000 + BLOCK_SECONDS - 1).blocked, true);
  assert.equal(isBlocked(state, 1000 + BLOCK_SECONDS).blocked, false);
  assert.equal(isBlocked(state, 1000 + BLOCK_SECONDS + 1).blocked, false);
});

test("a failure after the attempt window has elapsed resets the counter instead of accumulating", () => {
  const previous = { failures: MAX_FAILURES - 1, windowStartedAt: 1000, blockedUntil: 0 };
  const now = 1000 + ATTEMPT_WINDOW_SECONDS + 1;
  const state = nextFailureState(previous, now);
  assert.equal(state.failures, 1);
  assert.equal(state.windowStartedAt, now);
  assert.equal(state.blockedUntil, 0);
});

test("a successful lockout does not itself unblock early: retryAfter is never less than 1 second", () => {
  const state = { failures: MAX_FAILURES, windowStartedAt: 1000, blockedUntil: 1000 };
  const result = isBlocked(state, 999);
  assert.equal(result.blocked, true);
  assert.equal(result.retryAfter, 1);
});

test("an attacker cannot reset the lockout early by sending one more failure while already blocked", () => {
  let state = null;
  let now = 0;
  for (let i = 0; i < MAX_FAILURES; i += 1) {
    state = nextFailureState(state, now);
    now += 1;
  }
  const blockedUntilBefore = state.blockedUntil;
  const extra = nextFailureState(state, now);
  assert.ok(extra.blockedUntil >= blockedUntilBefore);
  assert.equal(isBlocked(extra, now).blocked, true);
});
