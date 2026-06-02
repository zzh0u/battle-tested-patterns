<div align="center">

# Battle-Tested Patterns

**Code-level programming patterns extracted from production codebases.**

Every pattern backed by precise GitHub source links · Multi-language · Runnable exercises

[📖 Docs](https://totoro-jam.github.io/battle-tested-patterns/) · [📖 中文文档](https://totoro-jam.github.io/battle-tested-patterns/zh/) · English | [简体中文](README.zh-CN.md)

[![CI](https://github.com/Totoro-jam/battle-tested-patterns/actions/workflows/ci.yml/badge.svg)](https://github.com/Totoro-jam/battle-tested-patterns/actions/workflows/ci.yml)
[![Deploy](https://github.com/Totoro-jam/battle-tested-patterns/actions/workflows/deploy.yml/badge.svg)](https://github.com/Totoro-jam/battle-tested-patterns/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

## The Gap This Fills

| What exists | What's missing |
|------------|----------------|
| Design patterns books | Too abstract, too OOP-centric |
| Algorithm repos | Disconnected from real engineering |
| System design guides | Architecture-level, not code-level |

This project: **code-level techniques from React, Linux, Go, Chromium — each with verifiable source links**.

## Patterns

| Pattern | What It Does | Proven In | Langs |
|---------|-------------|-----------|-------|
| [**Bitmask**](https://totoro-jam.github.io/battle-tested-patterns/patterns/bitmask/) | Pack N flags into one integer, check any combo in O(1) | [React Flags](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberFlags.js#L14-L36) · [Linux stat.h](https://github.com/torvalds/linux/blob/master/include/uapi/linux/stat.h#L25-L33) | TS Rust Go Py |
| [**Double Buffering**](https://totoro-jam.github.io/battle-tested-patterns/patterns/double-buffering/) | Swap two copies atomically, zero allocation | [React Fiber](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiber.js#L327-L355) · SDL | TS Rust Go Py |
| [**Cooperative Scheduling**](https://totoro-jam.github.io/battle-tested-patterns/patterns/cooperative-scheduling/) | Yield control between work chunks to stay responsive | [React Scheduler](https://github.com/facebook/react/blob/main/packages/scheduler/src/forks/Scheduler.js#L1) · [Go Runtime](https://github.com/golang/go/blob/master/src/runtime/proc.go#L1) | TS Rust Go Py |
| [**Min Heap**](https://totoro-jam.github.io/battle-tested-patterns/patterns/min-heap/) | O(1) peek at highest priority, O(log n) push/pop | [React MinHeap](https://github.com/facebook/react/blob/main/packages/scheduler/src/SchedulerMinHeap.js#L17-L90) · Linux CFS | TS Rust Go Py |
| [**Diff / Patch**](https://totoro-jam.github.io/battle-tested-patterns/patterns/diff-patch/) | Compute minimal edits between two sequences | [React Reconciler](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactChildFiber.js#L1) · [Git](https://github.com/git/git/blob/master/diff.c#L1) | TS Rust Go Py |

> Every "Proven In" link goes to the **exact lines** in the source code. Not a directory. Not a file. The lines.

## What a Pattern Looks Like

Each pattern follows a consistent structure — here's a taste from **Bitmask**:

```text
  Bit position:  7   6   5   4   3   2   1   0
                ┌───┬───┬───┬───┬───┬───┬───┬───┐
  Flags:        │   │   │   │ SN│ CB│ RF│ UP│ PL│
                └───┴───┴───┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┘
                              │   │   │   │   └─ Placement  (1 << 0)
                              │   │   │   └──── Update     (1 << 1)
                              │   │   └──────── Ref        (1 << 2)
                              │   └──────────── Callback   (1 << 3)
                              └──────────────── Snapshot   (1 << 4)
```

Implementations in 4 languages, each idiomatic:

```typescript
// TypeScript                          // Python
const READ  = 1 << 0;                  READ  = 1 << 0
const WRITE = 1 << 1;                  WRITE = 1 << 1
const perms = READ | WRITE;            perms = READ | WRITE
(perms & READ) !== 0;  // true         bool(perms & READ)  # True
```

Then exercises at 3 difficulty levels — all with tests you can run.

## Quick Start

```bash
git clone https://github.com/Totoro-jam/battle-tested-patterns.git
cd battle-tested-patterns && pnpm install

pnpm test                         # TypeScript exercises (Vitest)
cd exercises/rust && cargo test   # Rust exercises
cd exercises/go && go test ./...  # Go exercises
pnpm dev                          # Local docs site
```

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md). The bar is intentionally high:

1. **≥ 2 production proofs** with verified, line-number-precise source links
2. **TypeScript + ≥ 1 other language** — idiomatic, not translated
3. **≥ 2 exercises** with tests that pass
4. Source links checked weekly by CI — broken links auto-open an Issue

## License

[MIT](LICENSE) © Totoro-jam
