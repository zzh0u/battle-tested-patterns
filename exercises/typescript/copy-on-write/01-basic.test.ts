import { describe, it, expect } from 'vitest';

/**
 * Copy-on-Write - Basic: Defer copying until mutation.
 *
 * TODO: Implement a Cow class that shares data by reference
 * for reads, and only copies when write() is called.
 */

class Cow<T extends Record<string, unknown>> {
  private data: T;
  private shared: boolean;

  private constructor(data: T, shared: boolean) {
    this.data = data; // TODO: implement
    this.shared = shared;
  }

  static owned<T extends Record<string, unknown>>(data: T): Cow<T> {
    return new Cow(data, false);
  }

  static share<T extends Record<string, unknown>>(data: T): Cow<T> {
    return new Cow(data, true); // TODO: implement
  }

  /** Read without copying — returns the shared reference */
  read(): Readonly<T> {
    return this.data; // TODO: implement
  }

  /** Get mutable access — copies if shared, then returns owned data */
  write(): T {
    if (this.shared) {
      // TODO: implement
      this.data = structuredClone(this.data);
      this.shared = false;
    }
    return this.data;
  }

  isOwned(): boolean {
    return !this.shared;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Copy-on-Write - Basic: Deferred Copy', () => {
  it('should share data for reads (no copy)', () => {
    const original = { name: 'alice', scores: [100, 200] };
    const cow = Cow.share(original);
    expect(cow.read()).toBe(original);
    expect(cow.isOwned()).toBe(false);
  });

  it('should copy on first write', () => {
    const original = { name: 'alice', scores: [100, 200] };
    const cow = Cow.share(original);
    const mutable = cow.write();
    expect(mutable).not.toBe(original);
    expect(mutable).toEqual(original);
    expect(cow.isOwned()).toBe(true);
  });

  it('should not copy again on subsequent writes', () => {
    const cow = Cow.share({ x: 1 });
    const first = cow.write();
    const second = cow.write();
    expect(second).toBe(first);
  });

  it('should not affect original after write', () => {
    const original = { items: ['a', 'b'] };
    const cow = Cow.share(original);
    const mutable = cow.write();
    (mutable.items as string[]).push('c');
    expect(original.items).toEqual(['a', 'b']);
    expect((cow.read() as any).items).toEqual(['a', 'b', 'c']);
  });

  it('owned Cow should not copy on write', () => {
    const data = { value: 42 };
    const cow = Cow.owned(data);
    expect(cow.isOwned()).toBe(true);
    expect(cow.write()).toBe(data);
  });
});
