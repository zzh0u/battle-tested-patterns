import { describe, it, expect } from 'vitest';

/**
 * Bitmask - Basic: Fundamental bitwise flag operations.
 *
 * TODO: Implement the functions below using bitwise operators.
 * Run `pnpm test` to check your work — all tests should pass.
 *
 * Hint: OR (|), AND (&), NOT (~), XOR (^)
 */

const FLAGS = {
  READ: 1 << 0,    // 0b0001
  WRITE: 1 << 1,   // 0b0010
  EXECUTE: 1 << 2, // 0b0100
  DELETE: 1 << 3,  // 0b1000
} as const;

// TODO: Implement these functions

/** Set a flag on the given flags value */
function setFlag(flags: number, flag: number): number {
  return flags | flag; // TODO: implement (hint: use OR)
}

/** Check if a specific flag is set */
function hasFlag(flags: number, flag: number): boolean {
  return (flags & flag) !== 0; // TODO: implement (hint: use AND)
}

/** Remove a flag from the given flags value */
function clearFlag(flags: number, flag: number): number {
  return flags & ~flag; // TODO: implement (hint: use AND + NOT)
}

/** Toggle a flag on/off */
function toggleFlag(flags: number, flag: number): number {
  return flags ^ flag; // TODO: implement (hint: use XOR)
}

/** Check if ALL flags in a mask are set */
function hasAll(flags: number, mask: number): boolean {
  return (flags & mask) === mask; // TODO: implement
}

/** Check if ANY flag in a mask is set */
function hasAny(flags: number, mask: number): boolean {
  return (flags & mask) !== 0; // TODO: implement
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Bitmask - Basic: Bitwise Flag Operations', () => {
  it('should set a single flag', () => {
    expect(setFlag(0, FLAGS.READ)).toBe(1);
    expect(hasFlag(setFlag(0, FLAGS.READ), FLAGS.READ)).toBe(true);
  });

  it('should set multiple flags', () => {
    const perms = setFlag(setFlag(0, FLAGS.READ), FLAGS.WRITE);
    expect(perms).toBe(0b0011);
    expect(hasFlag(perms, FLAGS.READ)).toBe(true);
    expect(hasFlag(perms, FLAGS.WRITE)).toBe(true);
    expect(hasFlag(perms, FLAGS.EXECUTE)).toBe(false);
  });

  it('should clear a flag', () => {
    const perms = FLAGS.READ | FLAGS.WRITE | FLAGS.EXECUTE;
    const result = clearFlag(perms, FLAGS.WRITE);
    expect(hasFlag(result, FLAGS.READ)).toBe(true);
    expect(hasFlag(result, FLAGS.WRITE)).toBe(false);
    expect(hasFlag(result, FLAGS.EXECUTE)).toBe(true);
  });

  it('should toggle a flag on and off', () => {
    let perms = FLAGS.READ;
    perms = toggleFlag(perms, FLAGS.WRITE);
    expect(hasFlag(perms, FLAGS.WRITE)).toBe(true);
    perms = toggleFlag(perms, FLAGS.WRITE);
    expect(hasFlag(perms, FLAGS.WRITE)).toBe(false);
  });

  it('should check if all flags in a mask are set', () => {
    const required = FLAGS.READ | FLAGS.WRITE;
    expect(hasAll(FLAGS.READ | FLAGS.WRITE | FLAGS.EXECUTE, required)).toBe(true);
    expect(hasAll(FLAGS.READ, required)).toBe(false);
  });

  it('should check if any flag in a mask is set', () => {
    const dangerous = FLAGS.WRITE | FLAGS.DELETE;
    expect(hasAny(FLAGS.READ, dangerous)).toBe(false);
    expect(hasAny(FLAGS.READ | FLAGS.WRITE, dangerous)).toBe(true);
  });

  it('should be idempotent — setting an already-set flag changes nothing', () => {
    const perms = FLAGS.READ | FLAGS.WRITE;
    expect(setFlag(perms, FLAGS.READ)).toBe(perms);
  });

  it('should be idempotent — clearing an unset flag changes nothing', () => {
    expect(clearFlag(FLAGS.READ, FLAGS.DELETE)).toBe(FLAGS.READ);
  });
});
