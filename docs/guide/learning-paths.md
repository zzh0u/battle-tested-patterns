---
description: "Four curated learning tracks to guide you through the 46 patterns — from beginner-friendly data structures to advanced distributed systems."
---

# Learning Paths

Not sure where to start? Pick a track that matches your goal. Each track is ordered so that earlier patterns build foundations for later ones.

## How Difficulty Works

Every pattern is tagged with a difficulty level:

- **Beginner** — single core mechanism, minimal prerequisites
- **Intermediate** — combines 2-3 concepts, requires some background
- **Advanced** — complex multi-component systems, strong prerequisites

## Track 1: Data Structures Fundamentals

Build your way up from simple fixed-size containers to self-balancing trees.

| # | Pattern | Difficulty | Key Takeaway |
|---|---------|-----------|--------------|
| 1 | [Bitmask](/patterns/bitmask/) | Beginner | Pack N flags into one integer |
| 2 | [Ring Buffer](/patterns/ring-buffer/) | Beginner | Fixed-size FIFO with zero allocation |
| 3 | [Tagged Union](/patterns/tagged-union/) | Beginner | Type tag for safe dispatch |
| 4 | [Min Heap](/patterns/min-heap/) | Intermediate | O(1) access to highest-priority item |
| 5 | [Trie](/patterns/trie/) | Intermediate | O(k) lookup by key length |
| 6 | [Bloom Filter](/patterns/bloom-filter/) | Intermediate | Probabilistic membership testing |
| 7 | [LRU Cache](/patterns/lru-cache/) | Intermediate | Hash map + linked list combo |
| 8 | [Skip List](/patterns/skip-list/) | Advanced | Probabilistic sorted structure |
| 9 | [B+ Tree](/patterns/b-plus-tree/) | Advanced | Disk-optimized balanced tree |
| 10 | [Merkle Tree](/patterns/merkle-tree/) | Advanced | Hash chain for integrity proofs |

**After this track** you'll understand the core data structures behind databases (B+ Tree), caches (LRU), and blockchains (Merkle Tree).

## Track 2: Concurrency & Scheduling

From basic locking primitives to production-grade work distribution.

| # | Pattern | Difficulty | Key Takeaway |
|---|---------|-----------|--------------|
| 1 | [Semaphore](/patterns/semaphore/) | Beginner | Counter-based concurrency limit |
| 2 | [Double Buffering](/patterns/double-buffering/) | Beginner | Atomic swap of two buffers |
| 3 | [Observer](/patterns/observer/) | Beginner | Subscribe/notify decoupling |
| 4 | [Event Loop](/patterns/event-loop/) | Intermediate | Single-threaded I/O multiplexing |
| 5 | [Backpressure](/patterns/backpressure/) | Intermediate | Flow control between producer/consumer |
| 6 | [Copy-on-Write](/patterns/copy-on-write/) | Intermediate | Share until mutation |
| 7 | [Cooperative Scheduling](/patterns/cooperative-scheduling/) | Advanced | Yield points for responsiveness |
| 8 | [MVCC](/patterns/mvcc/) | Advanced | Versioned reads never block writers |
| 9 | [Work Stealing](/patterns/work-stealing/) | Advanced | Idle threads steal from busy queues |
| 10 | [Actor Model](/patterns/actor-model/) | Advanced | Isolated state + message passing |

**After this track** you'll understand how React stays responsive (Cooperative Scheduling), how databases handle concurrent transactions (MVCC), and how Go/Tokio schedule goroutines (Work Stealing).

## Track 3: System Reliability

Build resilient services that handle failures gracefully.

| # | Pattern | Difficulty | Key Takeaway |
|---|---------|-----------|--------------|
| 1 | [Retry with Backoff](/patterns/retry-backoff/) | Beginner | Exponential delay + jitter |
| 2 | [Batch Processing](/patterns/batch-processing/) | Beginner | Amortize per-operation overhead |
| 3 | [State Machine](/patterns/state-machine/) | Beginner | Explicit states, impossible transitions blocked |
| 4 | [Circuit Breaker](/patterns/circuit-breaker/) | Intermediate | Fail fast when service is down |
| 5 | [Rate Limiter](/patterns/rate-limiter/) | Intermediate | Token bucket controls throughput |
| 6 | [Middleware Chain](/patterns/middleware-chain/) | Intermediate | Composable request handlers |
| 7 | [Dependency Graph](/patterns/dependency-graph/) | Intermediate | DAG + topological sort |
| 8 | [Consistent Hashing](/patterns/consistent-hashing/) | Advanced | Minimal remapping on node change |
| 9 | [Logical Clock](/patterns/logical-clock/) | Advanced | Causal ordering without wall clocks |

**After this track** you'll be able to design resilient API gateways, service meshes, and distributed task schedulers.

## Track 4: Storage Engine Internals

Understand how databases and storage engines work under the hood.

| # | Pattern | Difficulty | Key Takeaway |
|---|---------|-----------|--------------|
| 1 | [Tombstone](/patterns/tombstone/) | Beginner | Mark deleted, compact later |
| 2 | [Dirty Flag](/patterns/dirty-flag/) | Beginner | Skip recomputation if unchanged |
| 3 | [Iterator](/patterns/iterator/) | Beginner | Lazy pull-based traversal |
| 4 | [Write-Ahead Log](/patterns/write-ahead-log/) | Intermediate | Log before apply for crash safety |
| 5 | [Checkpointing](/patterns/checkpointing/) | Intermediate | Periodic state snapshots |
| 6 | [Diff / Patch](/patterns/diff-patch/) | Intermediate | Minimal change computation |
| 7 | [LSM Tree](/patterns/lsm-tree/) | Advanced | Write-optimized on-disk storage |
| 8 | [Merge Iterator](/patterns/merge-iterator/) | Advanced | K-way merge of sorted streams |

**After this track** you'll understand the architecture of LevelDB/RocksDB (LSM Tree + WAL + Checkpointing) and how Git tracks changes (Diff/Patch + Merkle Tree).

## Memory Management Track (Bonus)

For systems programmers who want to understand allocators and GC alternatives.

| # | Pattern | Difficulty | Key Takeaway |
|---|---------|-----------|--------------|
| 1 | [Reference Counting](/patterns/reference-counting/) | Beginner | Deterministic cleanup at rc=0 |
| 2 | [Object Pool](/patterns/object-pool/) | Beginner | Pre-allocate and reuse |
| 3 | [Flyweight](/patterns/flyweight/) | Beginner | Share identical instances |
| 4 | [Interning](/patterns/interning/) | Intermediate | Hash-based deduplication |
| 5 | [Free List](/patterns/free-list/) | Intermediate | O(1) alloc from freed slots |
| 6 | [Arena Allocator](/patterns/arena-allocator/) | Intermediate | Bump-allocate, bulk-free |

**After this track** you'll understand how Go's `sync.Pool`, Rust's `bumpalo`, and CPython's small object allocator work.

## Suggested Study Schedule

| Pace | Daily Time | Full Completion |
|------|-----------|-----------------|
| Relaxed | 30 min/day | ~8 weeks |
| Moderate | 1 hr/day | ~4 weeks |
| Intensive | 2 hr/day | ~2 weeks |

For each pattern: read the doc (10 min) → run the visualization (5 min) → complete the exercise in one language (15-30 min) → try the challenge questions (5 min).

> **Tip**: Fork the repo and use the [Study Plan](https://github.com/Totoro-jam/battle-tested-patterns/blob/main/STUDY_PLAN.md) to track your progress with checkboxes.
