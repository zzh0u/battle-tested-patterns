import { describe, it, expect } from 'vitest';

/**
 * Tagged Union - Intermediate: JSON-like value type with nesting.
 *
 * TODO: Implement a JsonValue tagged union that supports null, boolean,
 * number, string, array (JsonValue[]), and object (Record<string, JsonValue>).
 * Implement stringify and deepEqual using tag-based dispatch.
 *
 * Real-world use: Godot Variant, PyTorch IValue, database drivers.
 */

type JsonTag = 'null' | 'boolean' | 'number' | 'string' | 'array' | 'object';

interface JsonValue {
  tag: JsonTag;
  value: null | boolean | number | string | JsonValue[] | Record<string, JsonValue>;
}

function jsonNull(): JsonValue {
  // TODO: implement
  return { tag: 'null', value: null };
}

function jsonBool(b: boolean): JsonValue {
  // TODO: implement
  return { tag: 'boolean', value: b };
}

function jsonNum(n: number): JsonValue {
  // TODO: implement
  return { tag: 'number', value: n };
}

function jsonStr(s: string): JsonValue {
  // TODO: implement
  return { tag: 'string', value: s };
}

function jsonArr(items: JsonValue[]): JsonValue {
  // TODO: implement
  return { tag: 'array', value: items };
}

function jsonObj(entries: Record<string, JsonValue>): JsonValue {
  // TODO: implement
  return { tag: 'object', value: entries };
}

/** Serialize a JsonValue to a JSON string using tag-based dispatch */
function stringify(jv: JsonValue): string {
  // TODO: implement — recursive dispatch on jv.tag
  switch (jv.tag) {
    case 'null':
      return 'null';
    case 'boolean':
      return String(jv.value);
    case 'number':
      return String(jv.value);
    case 'string':
      return `"${jv.value}"`;
    case 'array': {
      const items = (jv.value as JsonValue[]).map(stringify);
      return `[${items.join(',')}]`;
    }
    case 'object': {
      const obj = jv.value as Record<string, JsonValue>;
      const pairs = Object.keys(obj)
        .sort()
        .map((k) => `"${k}":${stringify(obj[k]!)}`);
      return `{${pairs.join(',')}}`;
    }
  }
}

/** Deep equality check using tag-based dispatch */
function deepEqual(a: JsonValue, b: JsonValue): boolean {
  // TODO: implement — compare tags, then recurse for nested types
  if (a.tag !== b.tag) return false;

  switch (a.tag) {
    case 'null':
      return true;
    case 'boolean':
    case 'number':
    case 'string':
      return a.value === b.value;
    case 'array': {
      const arrA = a.value as JsonValue[];
      const arrB = b.value as JsonValue[];
      if (arrA.length !== arrB.length) return false;
      return arrA.every((v, i) => deepEqual(v, arrB[i]!));
    }
    case 'object': {
      const objA = a.value as Record<string, JsonValue>;
      const objB = b.value as Record<string, JsonValue>;
      const keysA = Object.keys(objA).sort();
      const keysB = Object.keys(objB).sort();
      if (keysA.length !== keysB.length) return false;
      return keysA.every((k, i) => k === keysB[i] && deepEqual(objA[k]!, objB[k]!));
    }
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Tagged Union - Intermediate: JSON Value', () => {
  it('should stringify primitive types', () => {
    expect(stringify(jsonNull())).toBe('null');
    expect(stringify(jsonBool(true))).toBe('true');
    expect(stringify(jsonNum(42))).toBe('42');
    expect(stringify(jsonStr('hello'))).toBe('"hello"');
  });

  it('should stringify nested arrays', () => {
    const arr = jsonArr([jsonNum(1), jsonStr('two'), jsonBool(false)]);
    expect(stringify(arr)).toBe('[1,"two",false]');
  });

  it('should stringify nested objects', () => {
    const obj = jsonObj({
      name: jsonStr('Alice'),
      age: jsonNum(30),
      active: jsonBool(true),
    });
    expect(stringify(obj)).toBe('{"active":true,"age":30,"name":"Alice"}');
  });

  it('should deeply compare equal values', () => {
    const a = jsonObj({ x: jsonArr([jsonNum(1), jsonNull()]) });
    const b = jsonObj({ x: jsonArr([jsonNum(1), jsonNull()]) });
    expect(deepEqual(a, b)).toBe(true);
  });

  it('should detect deep inequality', () => {
    const a = jsonObj({ x: jsonArr([jsonNum(1)]) });
    const b = jsonObj({ x: jsonArr([jsonNum(2)]) });
    expect(deepEqual(a, b)).toBe(false);
    expect(deepEqual(jsonStr('a'), jsonNum(1))).toBe(false);
  });
});
