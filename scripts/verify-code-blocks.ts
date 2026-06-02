import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execSync } from 'node:child_process';

const DOCS_DIR = join(import.meta.dirname, '..', 'docs', 'patterns');
const TMP_DIR = join(import.meta.dirname, '..', '.tmp-code-verify');

interface CodeBlock {
  file: string;
  pattern: string;
  lang: string;
  code: string;
  line: number;
}

function findPatternDocs(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      const index = join(full, 'index.md');
      try {
        statSync(index);
        results.push(index);
      } catch {}
    }
  }
  return results;
}

function extractCodeBlocks(file: string): CodeBlock[] {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const blocks: CodeBlock[] = [];
  const pattern = basename(join(file, '..'));

  let inBlock = false;
  let lang = '';
  let code: string[] = [];
  let startLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (!inBlock && /^```(typescript|rust|go|python)/.test(line)) {
      inBlock = true;
      lang = line.match(/^```(\w+)/)?.[1] || '';
      if (lang === 'typescript') lang = 'typescript';
      code = [];
      startLine = i + 1;
    } else if (inBlock && line === '```') {
      inBlock = false;
      if (code.length > 0) {
        blocks.push({ file, pattern, lang, code: code.join('\n'), line: startLine });
      }
    } else if (inBlock) {
      code.push(line);
    }
  }

  return blocks;
}

function verifyTypeScript(block: CodeBlock): string | null {
  const file = join(TMP_DIR, `${block.pattern}.ts`);
  const cleaned = block.code
    .replace(/^\/\/ Usage.*$/gm, '// usage')
    .replace(/^\/\/ usage\n/gm, '');
  writeFileSync(file, cleaned);
  try {
    execSync(`npx tsc --noEmit --strict --target ES2022 --moduleResolution bundler "${file}" 2>&1`, { timeout: 10000 });
    return null;
  } catch (e: any) {
    return e.stdout?.toString() || e.message;
  }
}

function verifyPython(block: CodeBlock): string | null {
  const file = join(TMP_DIR, `${block.pattern}.py`);
  writeFileSync(file, block.code);
  try {
    execSync(`python3 -c "import py_compile; py_compile.compile('${file}', doraise=True)" 2>&1`, { timeout: 10000 });
    return null;
  } catch (e: any) {
    return e.stdout?.toString() || e.message;
  }
}

function verifyRust(block: CodeBlock): string | null {
  const file = join(TMP_DIR, `${block.pattern}.rs`);
  const hasFn = block.code.includes('fn ') || block.code.includes('pub ');
  const code = hasFn && !block.code.includes('fn main')
    ? `#![allow(dead_code, unused_variables, unused_imports)]\n${block.code}\nfn main() {}`
    : `#![allow(dead_code, unused_variables, unused_imports)]\n${block.code}`;
  writeFileSync(file, code);
  try {
    execSync(`rustc --edition 2021 --crate-type bin "${file}" -o /dev/null 2>&1`, { timeout: 15000 });
    return null;
  } catch (e: any) {
    return e.stdout?.toString() || e.stderr?.toString() || e.message;
  }
}

function verifyGo(block: CodeBlock): string | null {
  const dir = join(TMP_DIR, `go_${block.pattern}`);
  mkdirSync(dir, { recursive: true });
  const hasPackage = block.code.includes('package ');
  const code = hasPackage ? block.code : `package main\n\n${block.code}`;
  const file = join(dir, 'main.go');
  writeFileSync(file, code);
  try {
    execSync(`cd "${dir}" && go vet ./... 2>&1`, { timeout: 10000 });
    return null;
  } catch (e: any) {
    return e.stdout?.toString() || e.message;
  }
}

async function main() {
  const docs = findPatternDocs(DOCS_DIR);
  console.log(`Found ${docs.length} pattern documents\n`);

  mkdirSync(TMP_DIR, { recursive: true });

  const results: Array<{ block: CodeBlock; error: string | null }> = [];

  for (const doc of docs) {
    const blocks = extractCodeBlocks(doc);
    for (const block of blocks) {
      let error: string | null = null;

      try {
        switch (block.lang) {
          case 'typescript':
            error = verifyTypeScript(block);
            break;
          case 'python':
            error = verifyPython(block);
            break;
          case 'go':
            error = verifyGo(block);
            break;
          case 'rust':
            error = verifyRust(block);
            break;
          default:
            continue;
        }
      } catch (e: any) {
        error = e.message;
      }

      const status = error ? '❌' : '✅';
      console.log(`  ${status} ${block.pattern} [${block.lang}] (line ${block.line})`);
      results.push({ block, error });
    }
  }

  rmSync(TMP_DIR, { recursive: true, force: true });

  const failures = results.filter((r) => r.error);
  console.log(`\n${results.length} code blocks verified: ${results.length - failures.length} passed, ${failures.length} failed`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`\n  ❌ ${f.block.pattern} [${f.block.lang}] line ${f.block.line}:`);
      console.log(`     ${f.error?.split('\n')[0]}`);
    }
    process.exit(1);
  }
}

main();
