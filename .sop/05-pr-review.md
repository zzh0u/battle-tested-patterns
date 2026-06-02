# SOP 05: PR Review Process

## Trigger

When reviewing a pull request that adds or modifies patterns, exercises, or documentation.

## Review Dimensions

### 1. Content Accuracy

- [ ] Production Proof links are valid (click each one)
- [ ] Links are precise to line numbers (not `#L1`)
- [ ] Code descriptions match what the linked source actually does
- [ ] No fabricated claims about project usage

### 2. Template Compliance

- [ ] All required sections present (One Liner → Core Idea → Production Proof → Implementation → Exercises → When to Use → When NOT to Use → Also Used In)
- [ ] One Liner ≤ 30 English words
- [ ] Core Idea includes a diagram (Mermaid, ASCII, or table)
- [ ] Production Proof has ≥ 2 projects with line-precise links
- [ ] "Also Used In" section lists additional projects

### 3. Multi-Language

- [ ] TypeScript implementation present (required)
- [ ] ≥ 1 other language (Rust / Go / Python / C)
- [ ] Each implementation is idiomatic (not mechanical translation)
- [ ] Code uses `::: code-group` format in the document

### 4. Exercises

- [ ] ≥ 1 TypeScript exercise file with TODO-stub format
- [ ] Tests pass (`pnpm test`)
- [ ] Separator line between stubs and tests

### 5. Navigation & Sync

- [ ] Sidebar updated in `config.ts` (both English and Chinese)
- [ ] Homepage pattern table updated (`docs/index.md` + `docs/zh/index.md`)
- [ ] README pattern table updated (`README.md` + `README.zh-CN.md`)
- [ ] Chinese translation exists (`docs/zh/patterns/<name>/index.md`)
- [ ] By-project pages updated if new source project

### 6. CI Status

- [ ] All CI checks pass (CI, Content Quality, Verify Links, Deploy)
