import { describe, it, expect } from 'vitest';

/**
 * Diff/Patch - Intermediate: Apply a patch to reconstruct the new list.
 *
 * TODO: Implement both diff() and patch(). The patch function takes
 * diff operations and produces the new list by keeping keeps and
 * inserts, dropping deletes.
 */

type Op<T> =
  | { type: 'keep'; value: T }
  | { type: 'insert'; value: T }
  | { type: 'delete'; value: T };

function diff<T>(oldList: T[], newList: T[]): Op<T>[] {
  const ops: Op<T>[] = []; // TODO: implement (same as 01-basic)
  let oi = 0,
    ni = 0;
  while (oi < oldList.length && ni < newList.length) {
    if (oldList[oi] === newList[ni]) {
      ops.push({ type: 'keep', value: oldList[oi]! });
      oi++;
      ni++;
    } else if (!newList.slice(ni).includes(oldList[oi]!)) {
      ops.push({ type: 'delete', value: oldList[oi]! });
      oi++;
    } else {
      ops.push({ type: 'insert', value: newList[ni]! });
      ni++;
    }
  }
  while (oi < oldList.length) {
    ops.push({ type: 'delete', value: oldList[oi]! });
    oi++;
  }
  while (ni < newList.length) {
    ops.push({ type: 'insert', value: newList[ni]! });
    ni++;
  }
  return ops;
}

/** Apply patch operations to produce the new list */
function patch<T>(ops: Op<T>[]): T[] {
  return ops // TODO: implement (hint: filter out deletes, map to values)
    .filter(
      (op): op is Extract<Op<T>, { type: 'keep' | 'insert' }> =>
        op.type === 'keep' || op.type === 'insert',
    )
    .map((op) => op.value);
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Diff/Patch - Intermediate: Patch Apply', () => {
  it('should reconstruct new list from diff ops', () => {
    const ops = diff(['a', 'b', 'c', 'd'], ['a', 'c', 'e', 'd']);
    expect(patch(ops)).toEqual(['a', 'c', 'e', 'd']);
  });

  it('should handle insertion-only patch', () => {
    const ops = diff([1], [1, 2, 3]);
    expect(patch(ops)).toEqual([1, 2, 3]);
  });

  it('should handle deletion-only patch', () => {
    const ops = diff([1, 2, 3], [1]);
    expect(patch(ops)).toEqual([1]);
  });

  it('should roundtrip identical lists', () => {
    expect(patch(diff(['x', 'y', 'z'], ['x', 'y', 'z']))).toEqual(['x', 'y', 'z']);
  });

  it('should roundtrip empty↔populated', () => {
    expect(patch(diff([], [1, 2, 3]))).toEqual([1, 2, 3]);
    expect(patch(diff([1, 2, 3], []))).toEqual([]);
  });

  it('should produce minimal ops for small edits', () => {
    const ops = diff(['a', 'b', 'c', 'd', 'e'], ['a', 'b', 'x', 'd', 'e']);
    const keeps = ops.filter((o) => o.type === 'keep').length;
    expect(keeps).toBe(4);
    expect(patch(ops)).toEqual(['a', 'b', 'x', 'd', 'e']);
  });
});
