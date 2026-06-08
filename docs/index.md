---
layout: home
description: "46 battle-tested programming patterns from React, Linux, Go, and Chromium — interactive visualizations, precise source links, multi-language implementations, and runnable exercises."

hero:
  name: Battle-Tested Patterns
  text: Production-Proven Programming Patterns
  tagline: From React Scheduler to Linux kernel — 46 patterns you can explore interactively, trace to real source code, and implement in 4 languages.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/what-is-this
    - theme: alt
      text: Browse Patterns
      link: /patterns/
    - theme: alt
      text: Interview Guide
      link: /guide/interview

features:
  - icon:
      src: /images/interactive_visualizations.png
      width: 100
      height: 100
    title: Interactive Visualizations
    details: Every pattern has a hands-on SVG visualization. Click, drag, and experiment to build intuition — not just read about it.
  - icon:
      src: /images/production_proof.png
      width: 100
      height: 100
    title: Production Proof
    details: Every pattern comes with precise GitHub source links (down to line numbers) proving it's used in real-world projects.
  - icon:
      src: /images/multi-language.png
      width: 100
      height: 100
    title: Multi-Language
    details: Idiomatic implementations in TypeScript, Rust, Go, and Python — not mechanical translations, but native expressions of each pattern.
  - icon:
      src: /images/runnable_exercises.png
      width: 100
      height: 100
    title: Runnable Exercises
    details: Progressive exercises (basic → intermediate → advanced) with test suites you can run locally.
  - icon:
      src: /images/challengequestions.png
      width: 100
      height: 100
    title: Challenge Questions
    details: Each pattern includes 3-4 scenario-based "guess what happens" questions to test real understanding, not just reading.
  - icon:
      src: /images/real_system_case.png
      width: 100
      height: 100
    title: Real System Case Studies
    details: See how React, Redis, Go runtime, Linux, PostgreSQL, and Kafka compose multiple patterns in production.
---

## Try It — Interactive Min Heap

Every pattern page has a hands-on visualization like this one. Click **Insert Random** to watch the heap algorithm in action, or try the **React Scheduler** scenario:

<MinHeapViz />

## Pattern Highlights

> [Browse all 46 patterns →](/patterns/) · [Pattern Timeline →](/guide/timeline)

### Data Structures <span class="home-count">11 patterns</span>

| Pattern | Key Insight | Source Projects |
|---------|------------|-----------------|
| [Bloom Filter](/patterns/bloom-filter/) | Probabilistic membership — zero false negatives | LevelDB, Chromium |
| [B+ Tree](/patterns/b-plus-tree/) | Leaf-linked balanced tree for range scans | PostgreSQL, SQLite |
| [Min Heap](/patterns/min-heap/) | O(1) access to the highest-priority item | React Scheduler, Linux CFS |

### Concurrency <span class="home-count">9 patterns</span>

| Pattern | Key Insight | Source Projects |
|---------|------------|-----------------|
| [Event Loop](/patterns/event-loop/) | Single-threaded I/O multiplexing | libuv, Redis |
| [MVCC](/patterns/mvcc/) | Versioned reads never block writers | PostgreSQL, etcd |
| [Work Stealing](/patterns/work-stealing/) | Idle threads steal from busy queues | Go runtime, Tokio |

### System <span class="home-count">12 patterns</span>

| Pattern | Key Insight | Source Projects |
|---------|------------|-----------------|
| [Circuit Breaker](/patterns/circuit-breaker/) | Stop calling failing services, fail fast | Netflix Hystrix, gobreaker |
| [Write-Ahead Log](/patterns/write-ahead-log/) | Log before applying for crash recovery | etcd, PostgreSQL |
| [Consistent Hashing](/patterns/consistent-hashing/) | Add/remove nodes remaps only ~1/n keys | Go groupcache, HAProxy |

### Memory <span class="home-count">8 patterns</span>

| Pattern | Key Insight | Source Projects |
|---------|------------|-----------------|
| [Copy-on-Write](/patterns/copy-on-write/) | Share by reference, copy on mutation | Git, Rust Cow |
| [Arena Allocator](/patterns/arena-allocator/) | Bump-allocate in region, free all at once | Rust bumpalo, Go |
| [Reference Counting](/patterns/reference-counting/) | Auto-cleanup at zero owners | CPython, Rust Arc |

### Behavioral <span class="home-count">6 patterns</span>

| Pattern | Key Insight | Source Projects |
|---------|------------|-----------------|
| [State Machine](/patterns/state-machine/) | Explicit states, impossible transitions unrepresentable | XState, Linux TCP |
| [Diff / Patch](/patterns/diff-patch/) | Compute minimal changes between states | React Reconciler, Git |
| [Iterator](/patterns/iterator/) | Lazy sequences, zero intermediate allocations | Rust Iterator, Python |

<p style="text-align: center; margin-top: 2rem;">

[Browse all 46 patterns →](/patterns/)

</p>

<style>
.home-count {
  font-size: 0.8em;
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin-left: 0.5em;
}
</style>
