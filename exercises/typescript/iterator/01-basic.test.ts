import { describe, it, expect } from 'vitest';

/**
 * Iterator - Basic: Lazy sequence processing.
 *
 * TODO: Implement a lazy Iter class with map, filter, and collect.
 * No intermediate arrays should be created during chaining.
 */

class Iter<T> {
  constructor(private source: () => Generator<T>) {}

  static from<T>(items: T[]): Iter<T> {
    return new Iter(function* () {
      yield* items;
    }); // TODO: implement
  }

  map<U>(fn: (x: T) => U): Iter<U> {
    const source = this.source; // TODO: implement (hint: return new Iter with generator)
    return new Iter(function* () {
      for (const item of source()) yield fn(item);
    });
  }

  filter(pred: (x: T) => boolean): Iter<T> {
    const source = this.source; // TODO: implement
    return new Iter(function* () {
      for (const item of source()) if (pred(item)) yield item;
    });
  }

  take(n: number): Iter<T> {
    const source = this.source; // TODO: implement
    return new Iter(function* () {
      let i = 0;
      for (const item of source()) {
        if (i++ >= n) break;
        yield item;
      }
    });
  }

  collect(): T[] {
    return [...this.source()]; // TODO: implement
  }

  fold<U>(init: U, fn: (acc: U, x: T) => U): U {
    let acc = init; // TODO: implement
    for (const item of this.source()) acc = fn(acc, item);
    return acc;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Iterator - Basic: Lazy Sequence', () => {
  it('should collect all items', () => {
    expect(Iter.from([1, 2, 3]).collect()).toEqual([1, 2, 3]);
  });

  it('should map lazily', () => {
    expect(
      Iter.from([1, 2, 3])
        .map((x) => x * 10)
        .collect(),
    ).toEqual([10, 20, 30]);
  });

  it('should filter lazily', () => {
    expect(
      Iter.from([1, 2, 3, 4, 5])
        .filter((x) => x % 2 === 0)
        .collect(),
    ).toEqual([2, 4]);
  });

  it('should chain map + filter', () => {
    const result = Iter.from([1, 2, 3, 4, 5])
      .filter((x) => x > 2)
      .map((x) => x * 10)
      .collect();
    expect(result).toEqual([30, 40, 50]);
  });

  it('should take N elements', () => {
    expect(Iter.from([1, 2, 3, 4, 5]).take(3).collect()).toEqual([1, 2, 3]);
  });

  it('should fold to a single value', () => {
    const sum = Iter.from([1, 2, 3, 4]).fold(0, (acc, x) => acc + x);
    expect(sum).toBe(10);
  });

  it('should handle empty source', () => {
    expect(
      Iter.from([])
        .map((x: number) => x * 2)
        .collect(),
    ).toEqual([]);
  });
});
