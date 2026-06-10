---
title: "Patterns from Rust"
description: "Rust standard library patterns: iterator, copy-on-write (Cow), reference counting (Arc), interning, and arena allocation."
---

# Patterns from Rust

Rust's standard library embodies zero-cost abstractions through its type system.

| Pattern | Where | What It Does |
|---------|-------|--------------|
| [Iterator / Lazy Eval](/patterns/iterator/) | [`core/iter/traits/iterator.rs`](https://github.com/rust-lang/rust/blob/d56483a91d6cf5041351a3208b8d08f98f0c8b56/library/core/src/iter/traits/iterator.rs#L68-L112) | The `Iterator` trait — `next()` + composable `map`/`filter`/`fold` |
| [Copy-on-Write](/patterns/copy-on-write/) | [`alloc/src/borrow.rs`](https://github.com/rust-lang/rust/blob/d56483a91d6cf5041351a3208b8d08f98f0c8b56/library/alloc/src/borrow.rs#L169-L220) | `Cow<'a, B>` — clone-on-write smart pointer for zero-copy parsing |
| [Arena Allocator](/patterns/arena-allocator/) | [bumpalo `lib.rs`](https://github.com/fitzgen/bumpalo/blob/d2cc4dd0b8830d5b05d44e9decc776823e6a70ea/src/lib.rs#L378-L383) | `Bump` — canonical Rust arena allocator, used in wasm-bindgen and Deno |
| [Work Stealing](/patterns/work-stealing/) | [Tokio `worker.rs`](https://github.com/tokio-rs/tokio/blob/bde89678532a8091d958268c0d36eac9362317d8/tokio/src/runtime/scheduler/multi_thread/worker.rs#L1136-L1175) | `Core::steal_work` — multi-threaded async runtime work stealing |
| [Dependency Graph](/patterns/dependency-graph/) | [Cargo `resolver/`](https://github.com/rust-lang/cargo/blob/b50aa179d3d1099b53548bc8693dd17ddd019ab4/src/cargo/core/resolver/dep_cache.rs#L1-L50) | DAG-based dependency resolution for crate compilation order |
| [Reference Counting](/patterns/reference-counting/) | [`alloc/src/sync.rs`](https://github.com/rust-lang/rust/blob/d56483a91d6cf5041351a3208b8d08f98f0c8b56/library/alloc/src/sync.rs) | `Arc<T>` — atomic reference counting for shared ownership across threads |
| [Interning](/patterns/interning/) | [rustc `symbol.rs`](https://github.com/rust-lang/rust/blob/ab26b175979ee7b2cb3302dce204b99df96f7efb/compiler/rustc_span/src/symbol.rs#L24-L79) | `Symbol` is a `u32` index into global interner — all identifiers interned for O(1) comparison |
| [Semaphore](/patterns/semaphore/) | [Tokio `semaphore.rs`](https://github.com/tokio-rs/tokio/blob/bde89678532a8091d958268c0d36eac9362317d8/tokio/src/sync/semaphore.rs) | `Semaphore` — async-aware bounded concurrency control |

## How They Compose: Compiling a Crate

When `cargo build` compiles a Rust crate, the compiler and runtime use these patterns together:

<CompositionFlow variant="rust-build" />

Rust's zero-cost abstractions philosophy means these patterns have no runtime overhead beyond what a hand-written C implementation would have. The `Iterator` trait compiles down to the same machine code as a manual loop. `Cow<T>` avoids cloning when the data is only read. `Arc<T>` uses atomic operations only when actually shared.

## Further Reading

- [Rust Source Code (GitHub)](https://github.com/rust-lang/rust) · [bumpalo (GitHub)](https://github.com/fitzgen/bumpalo) · [Tokio (GitHub)](https://github.com/tokio-rs/tokio)
