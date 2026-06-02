import { describe, it, expect } from 'vitest';

/**
 * Bitmask - Advanced: React-style fiber flags.
 *
 * TODO: Implement the fiber flag system used by React's reconciler.
 * Each fiber node tracks pending side effects as a bitmask.
 * Parent nodes "bubble up" their children's flags for fast subtree skipping.
 */

const FiberFlags = {
  NoFlags:       0b0000000,
  Placement:     0b0000001,
  Update:        0b0000010,
  Deletion:      0b0000100,
  ChildDeletion: 0b0001000,
  Ref:           0b0010000,
  Callback:      0b0100000,
  Snapshot:      0b1000000,
} as const;

interface SimpleFiber {
  tag: string;
  flags: number;
  subtreeFlags: number;
  children: SimpleFiber[];
}

function createFiber(tag: string): SimpleFiber {
  return { tag, flags: FiberFlags.NoFlags, subtreeFlags: FiberFlags.NoFlags, children: [] };
}

/** Mark a fiber as needing an update */
function markUpdate(fiber: SimpleFiber): void {
  fiber.flags |= FiberFlags.Update; // TODO: implement (hint: use |=)
}

/** Mark a fiber as needing placement (new node) */
function markPlacement(fiber: SimpleFiber): void {
  fiber.flags |= FiberFlags.Placement; // TODO: implement
}

/** Mark a fiber as needing ref attachment */
function markRef(fiber: SimpleFiber): void {
  fiber.flags |= FiberFlags.Ref; // TODO: implement
}

/** Check if a fiber has any pending side effects */
function hasSideEffects(fiber: SimpleFiber): boolean {
  return fiber.flags !== FiberFlags.NoFlags; // TODO: implement
}

/**
 * Bubble flags up the tree: each parent's subtreeFlags should be
 * the OR of all its children's (flags | subtreeFlags).
 * This lets React skip entire subtrees that have no work.
 */
function bubbleFlags(fiber: SimpleFiber): void {
  let subtreeFlags = FiberFlags.NoFlags; // TODO: implement
  for (const child of fiber.children) {
    bubbleFlags(child);
    subtreeFlags |= child.flags | child.subtreeFlags;
  }
  fiber.subtreeFlags = subtreeFlags;
}

/** Check if a subtree has any pending work */
function subtreeHasWork(fiber: SimpleFiber): boolean {
  return fiber.subtreeFlags !== FiberFlags.NoFlags; // TODO: implement
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Bitmask - Advanced: React-Style Fiber Flags', () => {
  it('should create fiber with no flags', () => {
    const fiber = createFiber('div');
    expect(fiber.flags).toBe(FiberFlags.NoFlags);
    expect(hasSideEffects(fiber)).toBe(false);
  });

  it('should mark and check individual effects', () => {
    const fiber = createFiber('span');
    markUpdate(fiber);
    expect((fiber.flags & FiberFlags.Update) !== 0).toBe(true);
    expect((fiber.flags & FiberFlags.Placement) !== 0).toBe(false);
    expect(hasSideEffects(fiber)).toBe(true);
  });

  it('should accumulate multiple effects on one fiber', () => {
    const fiber = createFiber('div');
    markPlacement(fiber);
    markRef(fiber);
    expect(fiber.flags).toBe(FiberFlags.Placement | FiberFlags.Ref);
  });

  it('should bubble subtree flags from children to parent', () => {
    const parent = createFiber('div');
    const child1 = createFiber('span');
    const child2 = createFiber('p');
    markUpdate(child1);
    markPlacement(child2);
    parent.children = [child1, child2];
    bubbleFlags(parent);
    expect(parent.subtreeFlags).toBe(FiberFlags.Update | FiberFlags.Placement);
    expect(subtreeHasWork(parent)).toBe(true);
  });

  it('should bubble through multiple levels', () => {
    const root = createFiber('root');
    const middle = createFiber('div');
    const leaf = createFiber('span');
    markUpdate(leaf);
    middle.children = [leaf];
    root.children = [middle];
    bubbleFlags(root);
    expect(root.subtreeFlags).toBe(FiberFlags.Update);
  });

  it('should skip clean subtrees', () => {
    const root = createFiber('root');
    const clean = createFiber('clean');
    const dirty = createFiber('dirty');
    const leaf = createFiber('leaf');
    markUpdate(leaf);
    dirty.children = [leaf];
    root.children = [clean, dirty];
    bubbleFlags(root);
    expect(subtreeHasWork(clean)).toBe(false);
    expect(subtreeHasWork(dirty)).toBe(true);
  });
});
