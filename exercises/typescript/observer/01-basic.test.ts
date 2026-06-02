import { describe, it, expect } from 'vitest';

/**
 * Observer - Basic: Event emitter with subscribe/unsubscribe/emit.
 *
 * TODO: Implement an EventEmitter where listeners subscribe to
 * named events and get called when those events are emitted.
 */

type Listener = (data: unknown) => void;

class EventEmitter {
  private listeners = new Map<string, Set<Listener>>();

  /** Subscribe to an event. Returns an unsubscribe function. */
  on(event: string, listener: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set()); // TODO: implement
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  /** Unsubscribe a listener */
  off(event: string, listener: Listener): void {
    this.listeners.get(event)?.delete(listener); // TODO: implement
  }

  /** Notify all listeners of an event */
  emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((fn) => fn(data)); // TODO: implement
  }

  /** Count listeners for an event */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0; // TODO: implement
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Observer - Basic: EventEmitter', () => {
  it('should call listeners on emit', () => {
    const emitter = new EventEmitter();
    const received: unknown[] = [];
    emitter.on('msg', (data) => received.push(data));
    emitter.emit('msg', 'hello');
    emitter.emit('msg', 'world');
    expect(received).toEqual(['hello', 'world']);
  });

  it('should support multiple listeners', () => {
    const emitter = new EventEmitter();
    const a: unknown[] = [];
    const b: unknown[] = [];
    emitter.on('click', (d) => a.push(d));
    emitter.on('click', (d) => b.push(d));
    emitter.emit('click', 'btn');
    expect(a).toEqual(['btn']);
    expect(b).toEqual(['btn']);
  });

  it('should unsubscribe via returned function', () => {
    const emitter = new EventEmitter();
    const received: unknown[] = [];
    const unsub = emitter.on('data', (d) => received.push(d));
    emitter.emit('data', 1);
    unsub();
    emitter.emit('data', 2);
    expect(received).toEqual([1]);
  });

  it('should unsubscribe via off()', () => {
    const emitter = new EventEmitter();
    const received: unknown[] = [];
    const listener = (d: unknown) => received.push(d);
    emitter.on('x', listener);
    emitter.emit('x', 'a');
    emitter.off('x', listener);
    emitter.emit('x', 'b');
    expect(received).toEqual(['a']);
  });

  it('should not fail on emit with no listeners', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.emit('nothing', null)).not.toThrow();
  });

  it('should track listener count', () => {
    const emitter = new EventEmitter();
    expect(emitter.listenerCount('x')).toBe(0);
    const unsub = emitter.on('x', () => {});
    expect(emitter.listenerCount('x')).toBe(1);
    unsub();
    expect(emitter.listenerCount('x')).toBe(0);
  });

  it('should isolate events', () => {
    const emitter = new EventEmitter();
    const a: unknown[] = [];
    const b: unknown[] = [];
    emitter.on('a', (d) => a.push(d));
    emitter.on('b', (d) => b.push(d));
    emitter.emit('a', 1);
    expect(a).toEqual([1]);
    expect(b).toEqual([]);
  });
});
