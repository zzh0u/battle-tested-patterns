import { describe, it, expect } from 'vitest';

/**
 * Object Pool - Basic: Reusable object pool.
 *
 * TODO: Implement an ObjectPool that creates objects on demand,
 * returns them to the pool on release, and reuses them on next get.
 */

class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private resetFn: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 0) {
    this.factory = factory; // TODO: implement
    this.resetFn = reset;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  /** Get an object from pool, or create a new one */
  get(): T {
    return this.pool.length > 0 ? this.pool.pop()! : this.factory(); // TODO: implement
  }

  /** Return object to pool after resetting it */
  release(obj: T): void {
    this.resetFn(obj); // TODO: implement
    this.pool.push(obj);
  }

  get size(): number {
    return this.pool.length;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Object Pool - Basic: Reusable Pool', () => {
  it('should create object when pool is empty', () => {
    let created = 0;
    const pool = new ObjectPool(
      () => {
        created++;
        return { id: created };
      },
      () => {},
    );
    const obj = pool.get();
    expect(obj.id).toBe(1);
    expect(created).toBe(1);
  });

  it('should reuse released objects', () => {
    let created = 0;
    const pool = new ObjectPool(
      () => {
        created++;
        return { id: created, data: '' };
      },
      (o) => {
        o.data = '';
      },
    );
    const obj1 = pool.get();
    obj1.data = 'used';
    pool.release(obj1);
    const obj2 = pool.get();
    expect(obj2).toBe(obj1);
    expect(obj2.data).toBe('');
    expect(created).toBe(1);
  });

  it('should pre-allocate initial objects', () => {
    const pool = new ObjectPool(
      () => ({ value: 0 }),
      (o) => {
        o.value = 0;
      },
      5,
    );
    expect(pool.size).toBe(5);
  });

  it('should reset objects on release', () => {
    const pool = new ObjectPool(
      () => ({ buffer: new Array(100).fill(0) }),
      (o) => {
        o.buffer.fill(0);
      },
    );
    const obj = pool.get();
    obj.buffer[0] = 42;
    pool.release(obj);
    const reused = pool.get();
    expect(reused.buffer[0]).toBe(0);
  });

  it('should grow beyond initial size', () => {
    const pool = new ObjectPool(
      () => ({}),
      () => {},
      2,
    );
    const a = pool.get();
    const b = pool.get();
    const c = pool.get();
    expect(pool.size).toBe(0);
    pool.release(a);
    pool.release(b);
    pool.release(c);
    expect(pool.size).toBe(3);
  });
});
