import { describe, it, expect } from 'vitest';

/**
 * Batch Processing - Basic: Size-based batch flushing.
 *
 * TODO: Implement a SyncBatchProcessor that accumulates items
 * and flushes when the batch reaches maxSize.
 */

class SyncBatchProcessor<T, R> {
  private queue: T[] = [];
  private results: R[] = [];

  constructor(
    private processBatch: (items: T[]) => R[],
    private maxSize: number,
  ) {} // TODO: implement

  /** Add item. If batch is full, flush and return results. */
  add(item: T): R[] | null {
    this.queue.push(item); // TODO: implement
    if (this.queue.length >= this.maxSize) {
      return this.flush();
    }
    return null;
  }

  /** Process all queued items and return results */
  flush(): R[] {
    if (this.queue.length === 0) return []; // TODO: implement
    const batch = this.queue.splice(0);
    const results = this.processBatch(batch);
    this.results.push(...results);
    return results;
  }

  get pending(): number { return this.queue.length; }
  get allResults(): R[] { return [...this.results]; }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Batch Processing - Basic: Size-Based Flush', () => {
  it('should accumulate items until batch size', () => {
    const bp = new SyncBatchProcessor((items: number[]) => items.map((x) => x * 2), 3);
    expect(bp.add(1)).toBeNull();
    expect(bp.add(2)).toBeNull();
    expect(bp.pending).toBe(2);
  });

  it('should flush when batch size reached', () => {
    const bp = new SyncBatchProcessor((items: number[]) => items.map((x) => x * 2), 3);
    bp.add(1);
    bp.add(2);
    const result = bp.add(3);
    expect(result).toEqual([2, 4, 6]);
    expect(bp.pending).toBe(0);
  });

  it('should flush remaining items manually', () => {
    const bp = new SyncBatchProcessor((items: string[]) => items.map((s) => s.toUpperCase()), 5);
    bp.add('hello');
    bp.add('world');
    const result = bp.flush();
    expect(result).toEqual(['HELLO', 'WORLD']);
  });

  it('should track all results', () => {
    const bp = new SyncBatchProcessor((items: number[]) => items, 2);
    bp.add(1); bp.add(2); // flush
    bp.add(3); bp.add(4); // flush
    expect(bp.allResults).toEqual([1, 2, 3, 4]);
  });

  it('should handle empty flush', () => {
    const bp = new SyncBatchProcessor((items: number[]) => items, 5);
    expect(bp.flush()).toEqual([]);
  });
});
