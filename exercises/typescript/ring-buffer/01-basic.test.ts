import { describe, it, expect } from 'vitest';

/**
 * Ring Buffer - Basic: Fixed-size circular queue.
 *
 * TODO: Implement a RingBuffer using modular arithmetic
 * for wrap-around. No resizing, no shifting.
 */

class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private tail = 0;
  private count = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity; // TODO: implement
    this.buffer = new Array(capacity);
  }

  enqueue(item: T): boolean {
    if (this.count === this.capacity) return false; // TODO: implement
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return true;
  }

  dequeue(): T | undefined {
    if (this.count === 0) return undefined; // TODO: implement
    const item = this.buffer[this.head];
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return item;
  }

  peek(): T | undefined {
    return this.count > 0 ? this.buffer[this.head] : undefined;
  }

  get size(): number {
    return this.count;
  }
  get isFull(): boolean {
    return this.count === this.capacity;
  }
  get isEmpty(): boolean {
    return this.count === 0;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Ring Buffer - Basic: Circular Queue', () => {
  it('should enqueue and dequeue in FIFO order', () => {
    const rb = new RingBuffer<number>(4);
    rb.enqueue(1);
    rb.enqueue(2);
    rb.enqueue(3);
    expect(rb.dequeue()).toBe(1);
    expect(rb.dequeue()).toBe(2);
    expect(rb.dequeue()).toBe(3);
  });

  it('should return false when full', () => {
    const rb = new RingBuffer<string>(2);
    expect(rb.enqueue('a')).toBe(true);
    expect(rb.enqueue('b')).toBe(true);
    expect(rb.enqueue('c')).toBe(false);
    expect(rb.isFull).toBe(true);
  });

  it('should return undefined when empty', () => {
    const rb = new RingBuffer<number>(3);
    expect(rb.dequeue()).toBeUndefined();
    expect(rb.isEmpty).toBe(true);
  });

  it('should wrap around correctly', () => {
    const rb = new RingBuffer<number>(3);
    rb.enqueue(1);
    rb.enqueue(2);
    rb.enqueue(3);
    rb.dequeue();
    rb.dequeue();
    rb.enqueue(4);
    rb.enqueue(5);
    expect(rb.dequeue()).toBe(3);
    expect(rb.dequeue()).toBe(4);
    expect(rb.dequeue()).toBe(5);
  });

  it('should track size correctly through wrap-around', () => {
    const rb = new RingBuffer<number>(2);
    expect(rb.size).toBe(0);
    rb.enqueue(1);
    expect(rb.size).toBe(1);
    rb.enqueue(2);
    expect(rb.size).toBe(2);
    rb.dequeue();
    expect(rb.size).toBe(1);
    rb.enqueue(3);
    expect(rb.size).toBe(2);
    rb.dequeue();
    expect(rb.size).toBe(1);
    rb.dequeue();
    expect(rb.size).toBe(0);
  });

  it('should peek without removing', () => {
    const rb = new RingBuffer<string>(3);
    rb.enqueue('x');
    expect(rb.peek()).toBe('x');
    expect(rb.size).toBe(1);
  });
});
