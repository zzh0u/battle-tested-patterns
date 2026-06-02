import { describe, it, expect } from 'vitest';

/**
 * Semaphore - Basic: Bounded concurrency control.
 *
 * TODO: Implement a Semaphore that limits concurrent access.
 */

class Semaphore {
  private queue: (() => void)[] = [];
  private count: number;

  constructor(max: number) {
    this.count = max; // TODO: implement
  }

  async acquire(): Promise<void> {
    if (this.count > 0) { this.count--; return; } // TODO: implement
    return new Promise<void>((resolve) => this.queue.push(resolve));
  }

  release(): void {
    const next = this.queue.shift(); // TODO: implement
    if (next) { next(); } else { this.count++; }
  }

  get available(): number { return this.count; }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Semaphore - Basic: Bounded Concurrency', () => {
  it('should allow up to max concurrent acquires', async () => {
    const sem = new Semaphore(2);
    await sem.acquire();
    await sem.acquire();
    expect(sem.available).toBe(0);
  });

  it('should block when limit reached and unblock on release', async () => {
    const sem = new Semaphore(1);
    await sem.acquire();

    let unblocked = false;
    const blocked = sem.acquire().then(() => { unblocked = true; });

    expect(unblocked).toBe(false);
    sem.release();
    await blocked;
    expect(unblocked).toBe(true);
  });

  it('should process waiters in FIFO order', async () => {
    const sem = new Semaphore(1);
    await sem.acquire();

    const order: number[] = [];
    const p1 = sem.acquire().then(() => order.push(1));
    const p2 = sem.acquire().then(() => order.push(2));

    sem.release();
    await p1;
    sem.release();
    await p2;

    expect(order).toEqual([1, 2]);
  });

  it('should restore count after release', async () => {
    const sem = new Semaphore(3);
    await sem.acquire();
    await sem.acquire();
    expect(sem.available).toBe(1);
    sem.release();
    expect(sem.available).toBe(2);
    sem.release();
    expect(sem.available).toBe(3);
  });
});
