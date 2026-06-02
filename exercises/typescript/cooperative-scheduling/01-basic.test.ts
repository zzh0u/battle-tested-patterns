import { describe, it, expect } from 'vitest';

/**
 * Cooperative Scheduling - Basic: Time-sliced work loop.
 *
 * TODO: Implement workLoop that processes items one by one,
 * but yields (returns early) when shouldYield() returns true.
 */

interface WorkResult {
  completed: number;
  yielded: boolean;
}

/** Process items from the list, yielding when shouldYield() is true */
function workLoop(
  items: number[],
  processItem: (item: number) => void,
  shouldYield: () => boolean,
): WorkResult {
  let completed = 0; // TODO: implement the loop

  while (completed < items.length) {
    if (shouldYield()) {
      return { completed, yielded: true };
    }
    processItem(items[completed]!);
    completed++;
  }

  return { completed, yielded: false };
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Cooperative Scheduling - Basic: Work Loop', () => {
  it('should process all items when no yield needed', () => {
    const processed: number[] = [];
    const result = workLoop([1, 2, 3, 4, 5], (x) => processed.push(x), () => false);
    expect(result.completed).toBe(5);
    expect(result.yielded).toBe(false);
    expect(processed).toEqual([1, 2, 3, 4, 5]);
  });

  it('should yield after shouldYield returns true', () => {
    const processed: number[] = [];
    let calls = 0;
    const result = workLoop(
      [10, 20, 30, 40, 50],
      (x) => processed.push(x),
      () => ++calls > 3,
    );
    expect(result.completed).toBe(3);
    expect(result.yielded).toBe(true);
    expect(processed).toEqual([10, 20, 30]);
  });

  it('should yield immediately if shouldYield starts true', () => {
    const processed: number[] = [];
    const result = workLoop([1, 2, 3], (x) => processed.push(x), () => true);
    expect(result.completed).toBe(0);
    expect(result.yielded).toBe(true);
  });

  it('should handle empty list', () => {
    const result = workLoop([], () => {}, () => false);
    expect(result).toEqual({ completed: 0, yielded: false });
  });

  it('should support resuming with remaining items', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const processed: number[] = [];
    let calls = 0;
    const r1 = workLoop(items, (x) => processed.push(x), () => ++calls > 2);
    const remaining = items.slice(r1.completed);
    calls = 0;
    workLoop(remaining, (x) => processed.push(x), () => false);
    expect(processed).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
