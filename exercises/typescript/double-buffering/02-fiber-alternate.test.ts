import { describe, it, expect } from 'vitest';

/**
 * Double Buffering - Intermediate: React-style fiber alternates.
 *
 * TODO: Implement createWorkInProgress that reuses an alternate fiber
 * instead of allocating a new one each render — the "pooling" technique
 * React describes in its source code.
 */

interface Fiber {
  tag: string;
  pendingProps: Record<string, unknown>;
  memoizedState: unknown;
  alternate: Fiber | null;
}

function createFiber(tag: string, props: Record<string, unknown>): Fiber {
  return { tag, pendingProps: props, memoizedState: null, alternate: null };
}

/**
 * Create or reuse a work-in-progress fiber.
 * - If current has no alternate: create one, link them mutually
 * - If current already has an alternate: reuse it (zero allocation)
 */
function createWorkInProgress(current: Fiber, pendingProps: Record<string, unknown>): Fiber {
  let wip = current.alternate; // TODO: implement

  if (wip === null) {
    wip = createFiber(current.tag, pendingProps);
    wip.memoizedState = current.memoizedState;
    wip.alternate = current;
    current.alternate = wip;
  } else {
    wip.pendingProps = pendingProps;
    wip.memoizedState = current.memoizedState;
  }

  return wip;
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Double Buffering - Intermediate: Fiber Alternates', () => {
  it('should create alternate on first call', () => {
    const current = createFiber('div', { className: 'old' });
    current.memoizedState = 'state-v1';
    const wip = createWorkInProgress(current, { className: 'new' });
    expect(wip.alternate).toBe(current);
    expect(current.alternate).toBe(wip);
    expect(wip.pendingProps).toEqual({ className: 'new' });
    expect(wip.memoizedState).toBe('state-v1');
  });

  it('should reuse alternate on subsequent calls (zero allocation)', () => {
    const current = createFiber('span', { text: 'v1' });
    const wip1 = createWorkInProgress(current, { text: 'v2' });
    const wip2 = createWorkInProgress(wip1, { text: 'v3' });
    expect(wip2).toBe(current);
  });

  it('should maintain mutual alternate links', () => {
    const a = createFiber('div', {});
    const b = createWorkInProgress(a, { updated: true });
    expect(a.alternate).toBe(b);
    expect(b.alternate).toBe(a);
  });

  it('should carry memoizedState from current to wip', () => {
    const current = createFiber('Counter', {});
    current.memoizedState = { count: 42 };
    const wip = createWorkInProgress(current, {});
    expect(wip.memoizedState).toEqual({ count: 42 });
  });
});
