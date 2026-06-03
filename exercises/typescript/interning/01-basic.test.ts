import { describe, it, expect } from 'vitest';

/**
 * Interning - Basic: Implement a string interner.
 *
 * TODO: Implement a StringInterner that deduplicates strings.
 * intern() returns a numeric symbol ID for a string.
 * resolve() converts a symbol ID back to the original string.
 * Two calls to intern() with the same string must return the same ID.
 */

class StringInterner {
  private strToId = new Map<string, number>();
  private idToStr: string[] = [];

  /** Intern a string, returning its unique symbol ID */
  intern(s: string): number {
    // TODO: implement
    const existing = this.strToId.get(s);
    if (existing !== undefined) return existing;
    const id = this.idToStr.length;
    this.strToId.set(s, id);
    this.idToStr.push(s);
    return id;
  }

  /** Resolve a symbol ID back to its string */
  resolve(id: number): string | undefined {
    // TODO: implement
    return this.idToStr[id];
  }

  /** Number of unique strings interned */
  get size(): number {
    return this.idToStr.length;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Interning - Basic', () => {
  it('should return the same ID for the same string', () => {
    const interner = new StringInterner();
    const id1 = interner.intern('hello');
    const id2 = interner.intern('hello');
    expect(id1).toBe(id2);
  });

  it('should return different IDs for different strings', () => {
    const interner = new StringInterner();
    const id1 = interner.intern('hello');
    const id2 = interner.intern('world');
    expect(id1).not.toBe(id2);
  });

  it('should resolve IDs back to strings', () => {
    const interner = new StringInterner();
    const id = interner.intern('test');
    expect(interner.resolve(id)).toBe('test');
  });

  it('should return undefined for unknown IDs', () => {
    const interner = new StringInterner();
    expect(interner.resolve(999)).toBeUndefined();
  });

  it('should track the number of unique strings', () => {
    const interner = new StringInterner();
    interner.intern('a');
    interner.intern('b');
    interner.intern('a'); // duplicate
    interner.intern('c');
    expect(interner.size).toBe(3);
  });
});
