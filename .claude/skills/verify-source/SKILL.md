---
name: verify-source
description: Verify all production proof source links in pattern documents. Run automated checks for HTTP status, format, SHA permanence, and line-range content accuracy.
---

# Verify Source Links

You are verifying production proof links in this repository. This is the most critical quality check — every pattern's credibility depends on accurate, live source links.

## Steps

### 1. Run automated link check

```bash
pnpm verify-links
```

This scans all `docs/**/*.md` and root `README.md`/`README.zh-CN.md` files, extracts GitHub URLs, and checks:
- HTTP status (with automatic retry on 5xx)
- Whether Production Proof links include line numbers (`#L18-L22`)
- Whether links use SHA permalinks vs branch names
- Whether any `#L1` file-level links exist in Production Proof

Output categories:
- `✅ [proof]` — valid Production Proof link with line numbers
- `✅ [other]` — valid non-Production-Proof link
- `⚠️ [proof]` — Production Proof link missing line numbers
- `ℹ️` — branch-based link (not SHA permalink)
- `❌` — broken link (HTTP error)

For CI mode (exit 1 on broken links): `pnpm verify-links -- --ci`

### 2. Convert branch links to SHA permalinks

If the report shows branch-based links, convert them:

```bash
tsx scripts/convert-to-sha-links.ts --dry-run    # preview changes
tsx scripts/convert-to-sha-links.ts               # execute conversion
```

Authentication: prefers `gh auth token` (system keyring), falls back to `GITHUB_TOKEN` env var.

### 3. Verify line-range content

For links that pass HTTP checks, verify that the referenced code lines actually match the pattern:

```bash
pnpm verify-lines                    # Check all Production Proof links
pnpm verify-lines --pattern <name>   # Check a single pattern
pnpm verify-lines --verbose          # Show all results including passes
pnpm verify-lines --section all      # Also check "More Production Uses" section
pnpm verify-lines --no-cache         # Re-fetch everything (ignore cache)
```

This script performs two layers of verification:
- **L1: Range validity** — checks that line numbers are within file bounds
- **L2: Keyword presence** — checks that pattern-related keywords appear in the referenced code

Output:
- `✅` — line range valid and keywords found
- `⚠️` — line range valid but no keywords found (review manually)
- `❌ FAIL` — line range exceeds file length (must fix)
- `❌ ERROR` — fetch failed (network issue, retry)

Results are cached in `tmp/line-range-cache.json` (SHA links are immutable, so cache is permanent).

### 4. Manual verification (for warnings)

For any `⚠️` warnings from `verify-lines`, manually confirm:
- Open the GitHub link in a browser
- Verify the code at the specified lines actually demonstrates the pattern
- The usage description in the table is accurate

For `❌ FAIL` results (line range out of bounds), the link must be fixed:
1. Open the raw file at the SHA commit
2. Find the correct line range for the relevant code
3. Update the link in both EN and ZH pattern docs
4. Also check README.md / README.zh-CN.md for the same link

### 5. Report

Output a summary:
- ✅ Valid links (count)
- ⚠️ Format issues or keyword warnings (list each)
- ❌ Broken links (list each with file location)

For broken links, suggest the fix per `.sop/06-broken-link-fix.md`.

## Rules

- Never fabricate a replacement URL — if you can't find the new location, leave a `<!-- TODO -->` marker
- Always verify with automated tools first (`pnpm verify-links`, `pnpm verify-lines`), then manually for warnings
- When fixing line-range errors in pattern docs, also update README.md and README.zh-CN.md if they contain the same link
- Check the actual code content, not just HTTP status
