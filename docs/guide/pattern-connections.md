---
description: "How the 46 patterns connect: composition chains, shared building blocks, and real-world pattern combinations."
---

# How Patterns Connect

These patterns don't exist in isolation. The most interesting insight is how production systems **compose** them together.

**Explore interactively** — click any system to see which patterns it uses and why:

<PatternConnectionsViz />

## The Bigger Picture

Understanding individual patterns is useful. Understanding how they **compose** is what separates a senior engineer from a junior one.

When you see a performance problem, you don't think "I need a bitmask." You think "I need to track multiple states cheaply (bitmask), skip work that hasn't changed (subtree flags), process work incrementally (cooperative scheduling), prioritize urgent work (min heap), and avoid allocation on the hot path (double buffering)."

That's what React's team built. That's what Redis, Go, Linux, PostgreSQL, and Kafka all demonstrate. The same patterns recombine in different configurations to solve different problems.

## Summary: Patterns Across Systems

| Pattern | React | Redis | Go Runtime | Linux | PostgreSQL | Kafka |
|---------|:-----:|:-----:|:----------:|:-----:|:----------:|:-----:|
| **Bitmask** | ✅ | | ✅ | ✅ | | |
| **Min Heap** | ✅ | | ✅ | ✅ | | |
| **Cooperative Scheduling** | ✅ | | ✅ | | | |
| **Diff / Patch** | ✅ | | | | | |
| **Double Buffering** | ✅ | | | | | |
| **Batch Processing** | ✅ | ✅ | | ✅ | | ✅ |
| **Dirty Flag** | ✅ | | | | | |
| **Observer** | ✅ | | | | | |
| **Skip List** | | ✅ | | | | |
| **LRU Cache** | | ✅ | ✅ | | ✅ | |
| **Trie** | | ✅ | | ✅ | | |
| **Bloom Filter** | | ✅ | | | ✅ | |
| **Work Stealing** | | | ✅ | | | |
| **Free List** | | | ✅ | ✅ | | |
| **Semaphore** | | | ✅ | ✅ | | |
| **Object Pool** | | | ✅ | | | |
| **Rate Limiter** | | | ✅ | ✅ | | |
| **Arena Allocator** | | | ✅ | | | |
| **State Machine** | | | | ✅ | | |
| **Ring Buffer** | | | | ✅ | | ✅ |
| **Backpressure** | | | | ✅ | | ✅ |
| **Vtable** | | | | ✅ | | |
| **Reference Counting** | | | | ✅ | | |
| **MVCC** | | | | | ✅ | |
| **Write-Ahead Log** | | | | | ✅ | |
| **Retry Backoff** | | | | | | ✅ |
| **Consistent Hashing** | | | ✅ | | | ✅ |
