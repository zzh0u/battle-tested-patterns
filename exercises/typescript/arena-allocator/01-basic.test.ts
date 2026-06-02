import { describe, it, expect } from 'vitest';

/**
 * Arena Allocator - Basic: Implement a bump allocator.
 *
 * TODO: Implement an Arena that allocates from a pre-allocated buffer
 * by bumping a pointer. All allocations are freed at once via reset().
 *
 * - alloc(size): returns a view into the buffer, advances the pointer
 * - reset(): resets the pointer to 0, effectively freeing everything
 */

class Arena {
  private buffer: ArrayBuffer;
  private view: DataView;
  private offset: number;

  constructor(capacity: number) {
    // TODO: implement
    this.buffer = new ArrayBuffer(capacity);
    this.view = new DataView(this.buffer);
    this.offset = 0;
  }

  alloc(size: number): { start: number; size: number } | null {
    // TODO: implement
    if (this.offset + size > this.buffer.byteLength) return null;
    const start = this.offset;
    this.offset += size;
    return { start, size };
  }

  writeU32(offset: number, value: number): void {
    this.view.setUint32(offset, value);
  }

  readU32(offset: number): number {
    return this.view.getUint32(offset);
  }

  reset(): void {
    // TODO: implement
    this.offset = 0;
  }

  get used(): number {
    return this.offset;
  }

  get capacity(): number {
    return this.buffer.byteLength;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Arena Allocator - Basic', () => {
  it('should allocate sequentially from the buffer', () => {
    const arena = new Arena(64);
    const a = arena.alloc(16);
    const b = arena.alloc(16);

    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a!.start).toBe(0);
    expect(b!.start).toBe(16);
    expect(arena.used).toBe(32);
  });

  it('should return null when out of space', () => {
    const arena = new Arena(32);
    expect(arena.alloc(20)).not.toBeNull();
    expect(arena.alloc(20)).toBeNull();
  });

  it('should reset all allocations at once', () => {
    const arena = new Arena(64);
    arena.alloc(32);
    arena.alloc(16);
    expect(arena.used).toBe(48);

    arena.reset();
    expect(arena.used).toBe(0);

    const c = arena.alloc(64);
    expect(c).not.toBeNull();
    expect(c!.start).toBe(0);
  });

  it('should read and write values correctly', () => {
    const arena = new Arena(64);
    const slot = arena.alloc(4);
    expect(slot).not.toBeNull();

    arena.writeU32(slot!.start, 42);
    expect(arena.readU32(slot!.start)).toBe(42);
  });

  it('should allow full reuse after reset', () => {
    const arena = new Arena(16);
    arena.alloc(16);
    expect(arena.alloc(1)).toBeNull();

    arena.reset();
    expect(arena.alloc(16)).not.toBeNull();
  });
});
