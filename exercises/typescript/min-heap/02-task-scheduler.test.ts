import { describe, it, expect } from 'vitest';

/**
 * Min Heap - Intermediate: React-style task scheduler.
 *
 * TODO: Build a scheduler that uses a min heap to always
 * process the most urgent (lowest expirationTime) task first.
 */

interface Task {
  id: number;
  expirationTime: number;
  callback: () => string;
}

class TaskScheduler {
  private heap: Task[] = [];
  private idCounter = 0;

  /** Schedule a task with a given expiration time */
  schedule(expirationTime: number, callback: () => string): number {
    const id = ++this.idCounter; // TODO: implement (push + siftUp)
    this.heap.push({ id, expirationTime, callback });
    this.siftUp(this.heap.length - 1);
    return id;
  }

  /** Process and remove the most urgent task */
  processNext(): string | null {
    if (this.heap.length === 0) return null; // TODO: implement (pop + siftDown)
    const task = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) { this.heap[0] = last; this.siftDown(0); }
    return task.callback();
  }

  peekExpiration(): number | null {
    return this.heap[0]?.expirationTime ?? null;
  }

  get pending(): number {
    return this.heap.length;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >>> 1;
      if (this.heap[i]!.expirationTime < this.heap[p]!.expirationTime) {
        [this.heap[i], this.heap[p]] = [this.heap[p]!, this.heap[i]!]; i = p;
      } else break;
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let s = i; const l = 2*i+1; const r = 2*i+2;
      if (l < n && this.heap[l]!.expirationTime < this.heap[s]!.expirationTime) s = l;
      if (r < n && this.heap[r]!.expirationTime < this.heap[s]!.expirationTime) s = r;
      if (s !== i) { [this.heap[i], this.heap[s]] = [this.heap[s]!, this.heap[i]!]; i = s; }
      else break;
    }
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Min Heap - Intermediate: Task Scheduler', () => {
  it('should process most urgent task first', () => {
    const s = new TaskScheduler();
    s.schedule(100, () => 'low');
    s.schedule(10, () => 'high');
    s.schedule(50, () => 'medium');
    expect(s.processNext()).toBe('high');
    expect(s.processNext()).toBe('medium');
    expect(s.processNext()).toBe('low');
  });

  it('should peek without removing', () => {
    const s = new TaskScheduler();
    s.schedule(30, () => 'a');
    s.schedule(10, () => 'b');
    expect(s.peekExpiration()).toBe(10);
    expect(s.pending).toBe(2);
  });

  it('should handle dynamic scheduling', () => {
    const s = new TaskScheduler();
    s.schedule(50, () => 'first');
    s.processNext();
    s.schedule(20, () => 'second');
    s.schedule(10, () => 'third');
    expect(s.processNext()).toBe('third');
    expect(s.processNext()).toBe('second');
  });

  it('should process many tasks in order', () => {
    const s = new TaskScheduler();
    [50, 30, 70, 10, 90, 20, 60, 40, 80].forEach((exp) =>
      s.schedule(exp, () => `t-${exp}`),
    );
    const results: string[] = [];
    while (s.pending > 0) results.push(s.processNext()!);
    expect(results).toEqual(['t-10','t-20','t-30','t-40','t-50','t-60','t-70','t-80','t-90']);
  });
});
