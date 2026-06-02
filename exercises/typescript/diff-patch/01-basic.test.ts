import { describe, it, expect } from 'vitest';

/**
 * Diff/Patch - Basic: Compute keep/insert/delete operations.
 *
 * TODO: Implement diff() that compares two lists and returns
 * the minimal sequence of operations to transform old into new.
 */

type Op<T> =
  | { type: 'keep'; value: T }
  | { type: 'insert'; value: T }
  | { type: 'delete'; value: T };

/** Compute the diff between oldList and newList */
function diff<T>(oldList: T[], newList: T[]): Op<T>[] {
  const ops: Op<T>[] = []; // TODO: implement
  let oi = 0;
  let ni = 0;

  while (oi < oldList.length && ni < newList.length) {
    if (oldList[oi] === newList[ni]) {
      ops.push({ type: 'keep', value: oldList[oi]! }); oi++; ni++;
    } else if (!newList.slice(ni).includes(oldList[oi]!)) {
      ops.push({ type: 'delete', value: oldList[oi]! }); oi++;
    } else {
      ops.push({ type: 'insert', value: newList[ni]! }); ni++;
    }
  }
  while (oi < oldList.length) { ops.push({ type: 'delete', value: oldList[oi]! }); oi++; }
  while (ni < newList.length) { ops.push({ type: 'insert', value: newList[ni]! }); ni++; }

  return ops;
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Diff/Patch - Basic: List Diff', () => {
  it('should keep all for identical lists', () => {
    const ops = diff([1, 2, 3], [1, 2, 3]);
    expect(ops.every((o) => o.type === 'keep')).toBe(true);
    expect(ops.length).toBe(3);
  });

  it('should detect insertions', () => {
    const ops = diff(['a', 'c'], ['a', 'b', 'c']);
    expect(ops).toEqual([
      { type: 'keep', value: 'a' },
      { type: 'insert', value: 'b' },
      { type: 'keep', value: 'c' },
    ]);
  });

  it('should detect deletions', () => {
    const ops = diff(['a', 'b', 'c'], ['a', 'c']);
    expect(ops).toEqual([
      { type: 'keep', value: 'a' },
      { type: 'delete', value: 'b' },
      { type: 'keep', value: 'c' },
    ]);
  });

  it('should handle appending', () => {
    const ops = diff([1, 2], [1, 2, 3, 4]);
    expect(ops.filter((o) => o.type === 'insert').length).toBe(2);
  });

  it('should handle empty lists', () => {
    expect(diff([], [1, 2])).toEqual([{ type: 'insert', value: 1 }, { type: 'insert', value: 2 }]);
    expect(diff([1, 2], [])).toEqual([{ type: 'delete', value: 1 }, { type: 'delete', value: 2 }]);
  });
});
