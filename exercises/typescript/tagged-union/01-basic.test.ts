import { describe, it, expect } from 'vitest';

/**
 * Tagged Union - Basic: Implement a tagged value container.
 *
 * TODO: Implement a TaggedValue that stores a type tag alongside
 * a value, allowing safe dispatch based on the tag. The container
 * should support number, string, and boolean types.
 */

type Tag = 'number' | 'string' | 'boolean';

interface TaggedValue {
  tag: Tag;
  value: number | string | boolean;
}

/** Create a tagged value from a number */
function tagNumber(n: number): TaggedValue {
  // TODO: implement
  return { tag: 'number', value: n };
}

/** Create a tagged value from a string */
function tagString(s: string): TaggedValue {
  // TODO: implement
  return { tag: 'string', value: s };
}

/** Create a tagged value from a boolean */
function tagBoolean(b: boolean): TaggedValue {
  // TODO: implement
  return { tag: 'boolean', value: b };
}

/** Convert any tagged value to a display string using tag-based dispatch */
function display(tv: TaggedValue): string {
  // TODO: implement — dispatch on tv.tag
  switch (tv.tag) {
    case 'number':
      return `Number(${tv.value})`;
    case 'string':
      return `String("${tv.value}")`;
    case 'boolean':
      return `Boolean(${tv.value})`;
  }
}

/** Add two tagged values if both are numbers, otherwise return null */
function tryAdd(a: TaggedValue, b: TaggedValue): TaggedValue | null {
  // TODO: implement — only add when both are numbers
  if (a.tag !== 'number' || b.tag !== 'number') return null;
  return tagNumber((a.value as number) + (b.value as number));
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Tagged Union - Basic', () => {
  it('should create tagged values with correct tags', () => {
    expect(tagNumber(42).tag).toBe('number');
    expect(tagString('hello').tag).toBe('string');
    expect(tagBoolean(true).tag).toBe('boolean');
  });

  it('should store the correct value', () => {
    expect(tagNumber(42).value).toBe(42);
    expect(tagString('hello').value).toBe('hello');
    expect(tagBoolean(false).value).toBe(false);
  });

  it('should display values using tag-based dispatch', () => {
    expect(display(tagNumber(42))).toBe('Number(42)');
    expect(display(tagString('hello'))).toBe('String("hello")');
    expect(display(tagBoolean(true))).toBe('Boolean(true)');
  });

  it('should add two numbers via tag check', () => {
    const result = tryAdd(tagNumber(3), tagNumber(7));
    expect(result).not.toBeNull();
    expect(result!.tag).toBe('number');
    expect(result!.value).toBe(10);
  });

  it('should reject addition of non-number tagged values', () => {
    expect(tryAdd(tagNumber(1), tagString('x'))).toBeNull();
    expect(tryAdd(tagBoolean(true), tagNumber(2))).toBeNull();
    expect(tryAdd(tagString('a'), tagString('b'))).toBeNull();
  });
});
