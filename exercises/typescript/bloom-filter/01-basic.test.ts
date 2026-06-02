import { describe, it, expect } from 'vitest';

/**
 * Bloom Filter - Basic: Implement a probabilistic set membership test.
 *
 * TODO: Implement a BloomFilter with add() and mightContain() methods.
 * A bloom filter uses multiple hash functions to set bits in a bit array.
 * - add(item): hash the item k times, set those bit positions to 1
 * - mightContain(item): hash the item k times, return true only if ALL positions are 1
 *
 * False positives are possible. False negatives are NOT.
 */

function hash1(str: string, size: number): number {
  let h = 0; // TODO: implement
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return ((h % size) + size) % size;
}

function hash2(str: string, size: number): number {
  let h = 0; // TODO: implement
  for (let i = 0; i < str.length; i++) {
    h = (h * 37 + str.charCodeAt(i)) | 0;
  }
  return ((h % size) + size) % size;
}

function hash3(str: string, size: number): number {
  let h = 5381; // TODO: implement (djb2)
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return ((h % size) + size) % size;
}

class BloomFilter {
  private bits: Uint8Array;
  private size: number;

  constructor(size: number) {
    // TODO: implement
    this.size = size;
    this.bits = new Uint8Array(size);
  }

  add(item: string): void {
    // TODO: implement
    this.bits[hash1(item, this.size)] = 1;
    this.bits[hash2(item, this.size)] = 1;
    this.bits[hash3(item, this.size)] = 1;
  }

  mightContain(item: string): boolean {
    // TODO: implement
    return (
      this.bits[hash1(item, this.size)] === 1 &&
      this.bits[hash2(item, this.size)] === 1 &&
      this.bits[hash3(item, this.size)] === 1
    );
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Bloom Filter - Basic', () => {
  it('should return true for added items', () => {
    const bf = new BloomFilter(1024);
    bf.add('apple');
    bf.add('banana');
    bf.add('cherry');

    expect(bf.mightContain('apple')).toBe(true);
    expect(bf.mightContain('banana')).toBe(true);
    expect(bf.mightContain('cherry')).toBe(true);
  });

  it('should return false for items not added (with high probability)', () => {
    const bf = new BloomFilter(1024);
    bf.add('hello');
    bf.add('world');

    let falsePositives = 0;
    const testItems = ['foo', 'bar', 'baz', 'qux', 'quux', 'corge', 'grault', 'garply'];
    for (const item of testItems) {
      if (bf.mightContain(item)) falsePositives++;
    }
    expect(falsePositives).toBeLessThan(testItems.length);
  });

  it('should never have false negatives', () => {
    const bf = new BloomFilter(256);
    const items = Array.from({ length: 50 }, (_, i) => `item-${i}`);

    for (const item of items) bf.add(item);
    for (const item of items) {
      expect(bf.mightContain(item)).toBe(true);
    }
  });

  it('should work with an empty filter', () => {
    const bf = new BloomFilter(64);
    expect(bf.mightContain('anything')).toBe(false);
  });
});
