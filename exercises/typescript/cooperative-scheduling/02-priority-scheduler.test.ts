import { describe, it, expect } from 'vitest';

/**
 * Cooperative Scheduling - Intermediate: Priority scheduler.
 *
 * TODO: Implement PriorityScheduler that processes tasks
 * by priority (lower number = higher priority) and yields
 * when shouldYield() returns true.
 */

interface ScheduledTask {
  id: string;
  priority: number;
  work: () => boolean; // returns true when done
}

class PriorityScheduler {
  private queue: ScheduledTask[] = [];
  private completed: string[] = [];

  /** Add a task, keeping the queue sorted by priority */
  schedule(task: ScheduledTask): void {
    this.queue.push(task); // TODO: implement (hint: sort after push)
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  /** Process tasks until done or yielded */
  workLoop(shouldYield: () => boolean): { done: boolean; completedIds: string[] } {
    while (this.queue.length > 0) { // TODO: implement
      if (shouldYield()) {
        return { done: false, completedIds: [...this.completed] };
      }
      const task = this.queue[0]!;
      if (task.work()) {
        this.completed.push(task.id);
        this.queue.shift();
      }
    }
    return { done: true, completedIds: [...this.completed] };
  }

  pending(): number {
    return this.queue.length;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Cooperative Scheduling - Intermediate: Priority Scheduler', () => {
  it('should process tasks in priority order', () => {
    const s = new PriorityScheduler();
    const order: string[] = [];
    s.schedule({ id: 'low', priority: 3, work: () => { order.push('low'); return true; } });
    s.schedule({ id: 'high', priority: 1, work: () => { order.push('high'); return true; } });
    s.schedule({ id: 'med', priority: 2, work: () => { order.push('med'); return true; } });
    s.workLoop(() => false);
    expect(order).toEqual(['high', 'med', 'low']);
  });

  it('should yield between tasks', () => {
    const s = new PriorityScheduler();
    let calls = 0;
    s.schedule({ id: 'a', priority: 1, work: () => true });
    s.schedule({ id: 'b', priority: 2, work: () => true });
    s.schedule({ id: 'c', priority: 3, work: () => true });
    const result = s.workLoop(() => ++calls > 2);
    expect(result.done).toBe(false);
    expect(result.completedIds).toEqual(['a', 'b']);
    expect(s.pending()).toBe(1);
  });

  it('should resume after yield', () => {
    const s = new PriorityScheduler();
    let calls = 0;
    s.schedule({ id: 'x', priority: 1, work: () => true });
    s.schedule({ id: 'y', priority: 2, work: () => true });
    s.workLoop(() => ++calls > 1);
    calls = 0;
    const result = s.workLoop(() => false);
    expect(result.done).toBe(true);
    expect(result.completedIds).toEqual(['x', 'y']);
  });

  it('should handle multi-step tasks', () => {
    const s = new PriorityScheduler();
    let steps = 0;
    s.schedule({ id: 'multi', priority: 1, work: () => { steps++; return steps >= 3; } });
    s.workLoop(() => false);
    expect(steps).toBe(3);
  });
});
