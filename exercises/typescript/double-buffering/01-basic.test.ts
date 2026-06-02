import { describe, it, expect } from 'vitest';

/**
 * Double Buffering - Basic: Generic double buffer with swap.
 *
 * TODO: Implement the DoubleBuffer class that maintains two copies,
 * allowing writes to the "back" buffer while "front" stays stable.
 */

class DoubleBuffer<T> {
  private buffers: [T, T];
  private currentIndex: 0 | 1 = 0;

  constructor(a: T, b: T) {
    this.buffers = [a, b]; // TODO: store two buffers
  }

  /** Return the current (front) buffer — stable for readers */
  current(): T {
    return this.buffers[this.currentIndex]; // TODO: implement
  }

  /** Return the next (back) buffer — safe for writers */
  next(): T {
    return this.buffers[this.currentIndex === 0 ? 1 : 0]; // TODO: implement
  }

  /** Atomically swap front and back */
  swap(): void {
    this.currentIndex = this.currentIndex === 0 ? 1 : 0; // TODO: implement
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Double Buffering - Basic: Swap Mechanics', () => {
  it('should return initial current value', () => {
    const buf = new DoubleBuffer('frame-A', 'frame-B');
    expect(buf.current()).toBe('frame-A');
  });

  it('should return next (back) buffer', () => {
    const buf = new DoubleBuffer('frame-A', 'frame-B');
    expect(buf.next()).toBe('frame-B');
  });

  it('should swap current and next', () => {
    const buf = new DoubleBuffer('frame-A', 'frame-B');
    buf.swap();
    expect(buf.current()).toBe('frame-B');
    expect(buf.next()).toBe('frame-A');
  });

  it('should return to original after double swap', () => {
    const buf = new DoubleBuffer(1, 2);
    buf.swap();
    buf.swap();
    expect(buf.current()).toBe(1);
  });

  it('should allow writing to back buffer without affecting front', () => {
    const buf = new DoubleBuffer({ pixels: [0, 0] }, { pixels: [0, 0] });
    buf.next().pixels = [255, 128];
    expect(buf.current().pixels).toEqual([0, 0]);
    buf.swap();
    expect(buf.current().pixels).toEqual([255, 128]);
  });

  it('should reuse objects (zero allocation)', () => {
    const objA = { value: 'a' };
    const objB = { value: 'b' };
    const buf = new DoubleBuffer(objA, objB);
    buf.swap();
    expect(buf.current()).toBe(objB);
    expect(buf.next()).toBe(objA);
  });
});
