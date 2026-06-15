import { describe, it, expect } from 'vitest';

/**
 * Backpressure - Basic: Implement a bounded async queue with flow control.
 *
 * TODO: Implement a BoundedQueue where:
 * - push() blocks (returns a Promise) when the queue is full
 * - pull() blocks when the queue is empty
 * - The producer is naturally slowed down when the consumer can't keep up
 */

class BoundedQueue<T> {
  private buffer: T[] = [];
  private pushWaiters: Array<() => void> = [];
  private pullWaiters: Array<(value: T) => void> = [];

  constructor(private capacity: number) {} // TODO: implement

  async push(item: T): Promise<void> {
    // TODO: implement
    if (this.pullWaiters.length > 0) {
      const resolve = this.pullWaiters.shift()!;
      resolve(item);
      return;
    }
    if (this.buffer.length >= this.capacity) {
      await new Promise<void>((resolve) => this.pushWaiters.push(resolve));
    }
    this.buffer.push(item);
  }

  async pull(): Promise<T> {
    // TODO: implement
    if (this.buffer.length > 0) {
      const item = this.buffer.shift()!;
      if (this.pushWaiters.length > 0) {
        const resolve = this.pushWaiters.shift()!;
        resolve();
      }
      return item;
    }
    return new Promise<T>((resolve) => this.pullWaiters.push(resolve));
  }

  get size(): number {
    return this.buffer.length;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Backpressure - Basic', () => {
  it('should push and pull items', async () => {
    const q = new BoundedQueue<number>(3);
    await q.push(1);
    await q.push(2);
    expect(await q.pull()).toBe(1);
    expect(await q.pull()).toBe(2);
  });

  it('should block push when full', async () => {
    const q = new BoundedQueue<number>(2);
    await q.push(1);
    await q.push(2);

    let pushed = false;
    const pushPromise = q.push(3).then(() => {
      pushed = true;
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(pushed).toBe(false);

    await q.pull(); // free a slot
    await pushPromise;
    expect(pushed).toBe(true);
  });

  it('should block pull when empty', async () => {
    const q = new BoundedQueue<string>(5);

    let pulled = false;
    let result = '';
    const pullPromise = q.pull().then((v) => {
      pulled = true;
      result = v;
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(pulled).toBe(false);

    await q.push('hello');
    await pullPromise;
    expect(pulled).toBe(true);
    expect(result).toBe('hello');
  });

  it('should respect capacity as backpressure', async () => {
    const q = new BoundedQueue<number>(2);
    const order: string[] = [];

    q.push(1).then(() => order.push('push1'));
    q.push(2).then(() => order.push('push2'));
    q.push(3).then(() => order.push('push3'));

    await new Promise((r) => setTimeout(r, 10));
    expect(q.size).toBeLessThanOrEqual(2);

    await q.pull();
    await new Promise((r) => setTimeout(r, 10));

    expect(order).toContain('push3');
  });
});
