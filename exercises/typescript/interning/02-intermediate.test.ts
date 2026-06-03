import { describe, it, expect } from 'vitest';

/**
 * Interning - Intermediate: Type interner with structural equality.
 *
 * TODO: Implement a TypeInterner that deduplicates type descriptors
 * based on structural equality. Two types with the same structure
 * (e.g., Array<Int> and Array<Int>) should get the same ID, even
 * if constructed separately.
 *
 * Real-world use: Rust compiler type interning, database query planners.
 */

type TypeKind = 'int' | 'float' | 'string' | 'bool' | 'array' | 'tuple' | 'fn';

interface TypeDesc {
  kind: TypeKind;
  params: number[]; // symbol IDs of parameter types (e.g., element type for array)
}

class TypeInterner {
  private keyToId = new Map<string, number>();
  private types: TypeDesc[] = [];

  /** Create a canonical key from a type descriptor */
  private toKey(desc: TypeDesc): string {
    // TODO: implement — produce a unique string key from kind + params
    return `${desc.kind}(${desc.params.join(',')})`;
  }

  /** Intern a type, returning its unique ID */
  intern(desc: TypeDesc): number {
    // TODO: implement
    const key = this.toKey(desc);
    const existing = this.keyToId.get(key);
    if (existing !== undefined) return existing;
    const id = this.types.length;
    this.keyToId.set(key, id);
    this.types.push(desc);
    return id;
  }

  /** Resolve a type ID back to its descriptor */
  resolve(id: number): TypeDesc | undefined {
    // TODO: implement
    return this.types[id];
  }

  /** Helper: intern a primitive type */
  primitive(kind: 'int' | 'float' | 'string' | 'bool'): number {
    return this.intern({ kind, params: [] });
  }

  /** Helper: intern an array type */
  array(elementTypeId: number): number {
    return this.intern({ kind: 'array', params: [elementTypeId] });
  }

  /** Helper: intern a function type (params... -> return) */
  fn(paramTypeIds: number[], returnTypeId: number): number {
    return this.intern({ kind: 'fn', params: [...paramTypeIds, returnTypeId] });
  }

  get size(): number {
    return this.types.length;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Interning - Intermediate: Type Interner', () => {
  it('should deduplicate identical primitive types', () => {
    const ti = new TypeInterner();
    const int1 = ti.primitive('int');
    const int2 = ti.primitive('int');
    expect(int1).toBe(int2);
    expect(ti.size).toBe(1);
  });

  it('should distinguish different primitive types', () => {
    const ti = new TypeInterner();
    const intId = ti.primitive('int');
    const strId = ti.primitive('string');
    expect(intId).not.toBe(strId);
  });

  it('should deduplicate structurally identical compound types', () => {
    const ti = new TypeInterner();
    const intId = ti.primitive('int');
    const arr1 = ti.array(intId);
    const arr2 = ti.array(intId);
    expect(arr1).toBe(arr2);
  });

  it('should distinguish differently parameterized compound types', () => {
    const ti = new TypeInterner();
    const intId = ti.primitive('int');
    const strId = ti.primitive('string');
    const arrInt = ti.array(intId);
    const arrStr = ti.array(strId);
    expect(arrInt).not.toBe(arrStr);
  });

  it('should handle nested types like fn(Array<Int>, String) -> Bool', () => {
    const ti = new TypeInterner();
    const intId = ti.primitive('int');
    const strId = ti.primitive('string');
    const boolId = ti.primitive('bool');
    const arrInt = ti.array(intId);
    const fnType1 = ti.fn([arrInt, strId], boolId);
    const fnType2 = ti.fn([arrInt, strId], boolId);
    expect(fnType1).toBe(fnType2);
    expect(ti.resolve(fnType1)!.kind).toBe('fn');
  });
});
