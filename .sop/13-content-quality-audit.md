# SOP 13: Content Quality Audit

## Trigger

Before tagging a release, after adding/modifying multiple patterns, or on a periodic quality sweep.

## Purpose

Systematic multi-dimensional audit to ensure all 46+ patterns meet quality standards across EN and ZH versions. This SOP codifies the audit dimensions discovered through iterative improvement.

## Audit Dimensions

### 1. Section Completeness

Every pattern must contain all required sections per SOP 01 template:

- [ ] `# Pattern:` title
- [ ] `<DifficultyBadge />`
- [ ] `## One Liner` (≤ 30 words)
- [ ] `<DemoBadge />`
- [ ] `## Real-World Analogy`
- [ ] `## Core Idea` with diagram + property table
- [ ] `## Production Proof` (≥ 2 projects)
- [ ] `## Implementation` (TypeScript + ≥ 1 other)
- [ ] `## Exercises`
- [ ] `## When to Use` (≥ 3 scenarios)
- [ ] `## When NOT to Use` (≥ 3 alternatives)
- [ ] `## More Production Uses` (≥ 3 entries with URLs)
- [ ] `## Related Patterns` (≥ 2 patterns)
- [ ] `## Challenge Questions` (3-4 Q&A)

### 2. EN/ZH Sync

Code blocks and structural elements must be identical across languages.

**Automated checks (scriptable):**

- [ ] Code blocks (``` fenced sections) are byte-identical between EN and ZH
- [ ] Production Proof links are identical (same URLs, same line ranges)
- [ ] More Production Uses links are identical
- [ ] Related Patterns table has same pattern count

**Manual checks:**

- [ ] Code-group tab order matches (`[TypeScript] [Rust] [Go] [Python]`)
- [ ] Every Production Proof row exists in both languages
- [ ] Info/tip/warning callouts exist in both languages
- [ ] ZH section titles are Chinese (`## 更多生产案例` not `## More Production Uses`)

### 3. Diagram Structural Consistency

- [ ] Mermaid diagrams: ZH has same participants, arrows, and flow as EN
- [ ] Mermaid labels: may be translated (localization), but structure must match
- [ ] ASCII diagrams: use English labels inside box-drawing characters (CJK misaligns)
- [ ] ASCII alignment: borders (`│`, `┌`, `┐`, `└`, `┘`) vertically aligned

### 4. Property Tables

- [ ] Every Core Idea section has a `| Property | Value |` table
- [ ] Table placed after diagram, before "Try it yourself" line
- [ ] Values include O() complexity or key characteristics
- [ ] ZH uses `| 属性 | 值 |` headers with translated descriptions

### 5. Real-World Analogy Quality

- [ ] Uses only non-technical vocabulary (no "hash", "thread", "mutex", "queue")
- [ ] Metaphor is from everyday life (parking lot, restaurant, fuse box, etc.)
- [ ] Captures the core mechanism, not surface-level similarity

### 6. Related Patterns Bidirectionality

- [ ] If pattern A lists pattern B, then B's Related Patterns also lists A
- [ ] Check both EN and ZH versions
- [ ] Relationship descriptions are meaningful (not just "related")

### 7. Challenge Question Quality

- [ ] 3-4 questions per pattern
- [ ] Questions test understanding through scenarios, not memorization
- [ ] Answers are factually verified (version numbers, architecture claims)
- [ ] No unescaped `|` in markdown tables
- [ ] No `*` for multiplication (use `×`)

### 8. Source Link Quality

- [ ] Production Proof links have precise line numbers (`#L42-L80`)
- [ ] No `#L1` links (too imprecise)
- [ ] Links target `main`/`master` branch
- [ ] More Production Uses entries have verified URLs
- [ ] Run `pnpm verify-links` for automated HTTP checks

## Automated Audit Commands

All content quality checks are now implemented as TypeScript scripts in `scripts/`:

```bash
pnpm check:content      # Run all 4 checks below in sequence
pnpm check:structure    # S1-S8: frontmatter, sections, tab order, property table, source links
pnpm check:zh-parity    # P1-P7: code blocks, links, Mermaid parity between EN/ZH
pnpm check:exercises    # E1-E6: exercise + answer files, stub detection
pnpm check:relations    # R1-R3: bidirectional Related Patterns, sidebar, homepage consistency
pnpm verify-lines       # L1-L2: Production Proof line range validity + keyword presence
```

These scripts output GitHub Actions annotations in CI and human-readable format locally. All checks are also run as part of `pnpm check`.

Shared utilities live in `scripts/lib/patterns.ts` (pattern discovery, frontmatter parsing, section extraction, CI output formatting).

## Audit Frequency

- **Before every release tag**: full audit (all 8 dimensions)
- **After batch edits (>5 patterns)**: dimensions 2, 3, 4 (sync and structural)
- **After adding a new pattern**: dimensions 1, 2, 6 (completeness and integration)

## Common Findings

| Finding | Fix |
|---------|-----|
| ZH missing subscribe arrows in mermaid | Add matching arrows from EN diagram |
| ZH diagram restructured (participants removed) | Restore full participant list matching EN |
| Property table missing from Core Idea | Add `\| Property \| Value \|` table with complexity info |
| More Production Uses has < 3 entries | Add entries with verified source URLs |
| Analogy uses technical terms | Replace with everyday vocabulary |
| Related Patterns not bidirectional | Add missing back-reference in the other pattern |
