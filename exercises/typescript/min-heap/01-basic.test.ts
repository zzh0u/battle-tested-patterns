import { describe, it, expect } from 'vitest';

/**
 * Min Heap - Basic: Implement push, pop, peek with sift operations.
 *
 * TODO: Implement a min heap where the smallest element is always at index 0.
 * Use siftUp after push, siftDown after pop.
 */

interface HeapNode {
  sortIndex: number;
  id: number;
}

class MinHeap {
  private heap: HeapNode[] = [];

  peek(): HeapNode | null {
    return this.heap[0] ?? null; // TODO: implement
  }

  push(node: HeapNode): void {
    this.heap.push(node); // TODO: implement (hint: push then siftUp)
    this.siftUp(this.heap.length - 1);
  }

  pop(): HeapNode | null {
    if (this.heap.length === 0) return null; // TODO: implement
    const first = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return first;
  }

  get size(): number {
    return this.heap.length;
  }

  /** Bubble element up until parent is smaller */
  private siftUp(i: number): void {
    while (i > 0) {
      // TODO: implement
      const parent = (i - 1) >>> 1;
      if (this.compare(this.heap[i]!, this.heap[parent]!) < 0) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent]!, this.heap[i]!];
        i = parent;
      } else break;
    }
  }

  /** Push element down until both children are larger */
  private siftDown(i: number): void {
    const len = this.heap.length; // TODO: implement
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < len && this.compare(this.heap[left]!, this.heap[smallest]!) < 0) smallest = left;
      if (right < len && this.compare(this.heap[right]!, this.heap[smallest]!) < 0)
        smallest = right;
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest]!, this.heap[i]!];
        i = smallest;
      } else break;
    }
  }

  private compare(a: HeapNode, b: HeapNode): number {
    const diff = a.sortIndex - b.sortIndex;
    return diff !== 0 ? diff : a.id - b.id;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Min Heap - Basic: Core Operations', () => {
  it('should return null for empty heap', () => {
    const h = new MinHeap();
    expect(h.peek()).toBeNull();
    expect(h.pop()).toBeNull();
  });

  it('should peek at minimum', () => {
    const h = new MinHeap();
    h.push({ sortIndex: 5, id: 1 });
    h.push({ sortIndex: 3, id: 2 });
    h.push({ sortIndex: 7, id: 3 });
    expect(h.peek()!.sortIndex).toBe(3);
  });

  it('should pop in sorted order', () => {
    const h = new MinHeap();
    [5, 1, 3, 2, 4].forEach((s, i) => h.push({ sortIndex: s, id: i }));
    const result = [];
    while (h.size > 0) result.push(h.pop()!.sortIndex);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should break ties by id', () => {
    const h = new MinHeap();
    h.push({ sortIndex: 1, id: 99 });
    h.push({ sortIndex: 1, id: 10 });
    h.push({ sortIndex: 1, id: 50 });
    expect(h.pop()!.id).toBe(10);
    expect(h.pop()!.id).toBe(50);
    expect(h.pop()!.id).toBe(99);
  });

  it('should maintain heap property after mixed push/pop', () => {
    const h = new MinHeap();
    h.push({ sortIndex: 10, id: 1 });
    h.push({ sortIndex: 5, id: 2 });
    h.pop();
    h.push({ sortIndex: 3, id: 3 });
    h.push({ sortIndex: 8, id: 4 });
    h.pop();
    expect(h.peek()!.sortIndex).toBe(8);
  });
});
