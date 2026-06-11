/**
 * check-exercises.ts — Teaching loop completeness check.
 *
 * Validates:
 * - E1: TypeScript test file exists
 * - E2: Rust exercise module exists
 * - E3: Go test file exists
 * - E4: Python test file exists
 * - E5: Answer files exist for all 4 languages
 * - E6: Answer files are not empty stubs (warning)
 *
 * Usage:
 *   tsx scripts/check-exercises.ts
 *   tsx scripts/check-exercises.ts --pattern circuit-breaker
 *   tsx scripts/check-exercises.ts --verbose
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT,
  discoverPatterns,
  toSnakeCase,
  report,
  summarize,
  type PatternFile,
} from './lib/patterns.js';

const args = process.argv.slice(2);
const filterPattern = args.find((_, i, a) => a[i - 1] === '--pattern') || '';
const verbose = args.includes('--verbose');

const EXERCISES_DIR = join(ROOT, 'exercises');
const ANSWERS_DIR = join(ROOT, 'exercises/answers');

function fileExists(path: string): boolean {
  return !!statSync(path, { throwIfNoEntry: false })?.isFile();
}

function dirHasTestFiles(dir: string, ext: string): boolean {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return false;
  return readdirSync(dir).some(f => f.endsWith(ext));
}

function isStubFile(path: string): boolean {
  if (!fileExists(path)) return true;
  const content = readFileSync(path, 'utf-8');
  // A stub file is very short or contains TODO markers
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 5) return true;
  if (/\/\/\s*TODO|#\s*TODO|\/\*\s*TODO/.test(content)) return true;
  return false;
}

function checkExercises(pf: PatternFile): void {
  const slug = pf.slug;
  const snake = toSnakeCase(slug);

  // E1: TypeScript
  const tsDir = join(EXERCISES_DIR, 'typescript', slug);
  if (!dirHasTestFiles(tsDir, '.test.ts')) {
    report({
      file: pf.enPath,
      severity: 'error',
      message: `Missing TypeScript exercise: exercises/typescript/${slug}/*.test.ts`,
      rule: 'E1',
    });
  }

  // E2: Rust
  const rustFile = join(EXERCISES_DIR, 'rust/src', snake, 'mod.rs');
  if (!fileExists(rustFile)) {
    report({
      file: pf.enPath,
      severity: 'error',
      message: `Missing Rust exercise: exercises/rust/src/${snake}/mod.rs`,
      rule: 'E2',
    });
  }

  // E3: Go
  const goFile = join(EXERCISES_DIR, 'go', snake, `${snake}_test.go`);
  if (!fileExists(goFile)) {
    report({
      file: pf.enPath,
      severity: 'error',
      message: `Missing Go exercise: exercises/go/${snake}/${snake}_test.go`,
      rule: 'E3',
    });
  }

  // E4: Python
  const pyFile = join(EXERCISES_DIR, 'python', snake, `test_${snake}.py`);
  if (!fileExists(pyFile)) {
    report({
      file: pf.enPath,
      severity: 'error',
      message: `Missing Python exercise: exercises/python/${snake}/test_${snake}.py`,
      rule: 'E4',
    });
  }

  // E5: Answer files
  const answerPaths = [
    join(ANSWERS_DIR, 'typescript', slug, `${slug}.ts`),
    join(ANSWERS_DIR, 'rust', snake, `${snake}.rs`),
    join(ANSWERS_DIR, 'go', snake, `${snake}.go`),
    join(ANSWERS_DIR, 'python', snake, `${snake}.py`),
  ];

  for (const ansPath of answerPaths) {
    if (!fileExists(ansPath)) {
      const relPath = ansPath.replace(ROOT + '/', '');
      report({
        file: pf.enPath,
        severity: 'error',
        message: `Missing answer file: ${relPath}`,
        rule: 'E5',
      });
    }
  }

  // E6: Answer not a stub (warning)
  for (const ansPath of answerPaths) {
    if (fileExists(ansPath) && isStubFile(ansPath)) {
      const relPath = ansPath.replace(ROOT + '/', '');
      report({
        file: pf.enPath,
        severity: 'warning',
        message: `Answer file appears to be a stub (< 5 lines or contains TODO): ${relPath}`,
        rule: 'E6',
      });
    }
  }

  if (verbose) {
    console.log(`  ✓ ${slug}: exercises complete`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main(): void {
  console.log('check-exercises: Verifying teaching loop completeness...\n');

  const patterns = discoverPatterns();
  const filtered = filterPattern
    ? patterns.filter(p => p.slug === filterPattern)
    : patterns;

  if (filtered.length === 0) {
    console.error(`No patterns found${filterPattern ? ` matching "${filterPattern}"` : ''}`);
    process.exit(1);
  }

  console.log(`Checking ${filtered.length} pattern(s)...\n`);

  for (const pf of filtered) {
    checkExercises(pf);
  }

  process.exit(summarize('check-exercises'));
}

main();
