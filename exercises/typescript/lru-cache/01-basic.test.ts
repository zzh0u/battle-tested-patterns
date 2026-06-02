import { describe, it, expect } from 'vitest';

/**
 * LRU Cache - Basic: Implement a Least Recently Used cache.
 *
 * TODO: Implement an LRUCache with get() and put() that evicts
 * the least recently used entry when capacity is exceeded.
 * Both get and put should be O(1).
 */

class LRUCache<K, V> {
  private map = new Map<K, V>();

  constructor(private capacity: number) {} // TODO: implement

  get(key: K): V | undefined {
    // TODO: implement
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    // TODO: implement
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value!;
      this.map.delete(oldest);
    }
  }

  get size(): number {
    return this.map.size;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('LRU Cache - Basic', () => {
  it('should store and retrieve values', () => {
    const cache = new LRUCache<string, number>(3);
    cache.put('a', 1);
    cache.put('b', 2);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
  });

  it('should return undefined for missing keys', () => {
    const cache = new LRUCache<string, number>(3);
    expect(cache.get('x')).toBeUndefined();
  });

  it('should evict least recently used on overflow', () => {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('b', 2);
    cache.put('c', 3); // evicts 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });

  it('should update recency on get', () => {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('b', 2);
    cache.get('a'); // 'a' is now most recent
    cache.put('c', 3); // evicts 'b' (not 'a')
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('should update value on duplicate put', () => {
    const cache = new LRUCache<string, number>(2);
    cache.put('a', 1);
    cache.put('a', 10);
    expect(cache.get('a')).toBe(10);
    expect(cache.size).toBe(1);
  });
});
