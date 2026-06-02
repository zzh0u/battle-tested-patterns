# SOP 04: Exercise Design Standards

## Trigger

When creating runnable exercises for a pattern.

## Design Principles

1. **TODO-stub format** — functions have working implementations with `// TODO` markers; learners delete and rewrite
2. **Test-driven** — tests verify the functions; tests are immutable
3. **Self-contained** — each exercise file can run independently
4. **Progressive difficulty** — basic (01-) → intermediate (02-) → advanced (03-)

## File Structure

```text
exercises/typescript/<pattern-name>/
├── 01-basic.test.ts         # Required: core concept
└── 02-<scenario>.test.ts    # Optional: realistic application
```

Minimum: **≥ 1 exercise file** per pattern.

## Exercise File Format

```typescript
import { describe, it, expect } from 'vitest';

/**
 * <Pattern> - <Level>: <Title>
 *
 * TODO: Implement the functions below.
 * Run `pnpm test` to check your work.
 */

/** Description of what this function should do */
function myFunction(input: number): number {
  return input * 2; // TODO: implement (hint: ...)
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('<Pattern> - <Level>: <Title>', () => {
  it('should <expected behavior>', () => {
    expect(myFunction(5)).toBe(10);
  });
});
```

Key rules:
- Functions above the separator contain working solutions (so CI passes)
- `// TODO` comments mark lines the learner should rewrite
- Tests below the separator are immutable
- Learners delete function bodies and implement from scratch

## Checklist

- [ ] ≥ 1 exercise file per pattern
- [ ] Filename has difficulty label (01-, 02-, 03-)
- [ ] All tests pass with `pnpm test`
- [ ] TODO-stub format with separator line
- [ ] Test descriptions clearly state expected behavior
