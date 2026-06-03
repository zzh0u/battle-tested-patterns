# Rust 标准库中的模式

| 模式 | 位置 | 作用 |
|------|------|------|
| [迭代器](/zh/patterns/iterator/) | [`core/iter/traits/iterator.rs`](https://github.com/rust-lang/rust/blob/main/library/core/src/iter/traits/iterator.rs#L68-L112) | `Iterator` trait — 零成本抽象的可组合序列处理 |
| [写时复制](/zh/patterns/copy-on-write/) | [`alloc/src/borrow.rs`](https://github.com/rust-lang/rust/blob/main/library/alloc/src/borrow.rs#L169-L220) | `Cow<'a, B>` — 写时克隆智能指针 |
| [Arena 分配器](/zh/patterns/arena-allocator/) | [bumpalo `lib.rs`](https://github.com/fitzgen/bumpalo/blob/main/src/lib.rs#L378-L383) | `Bump` — Rust 经典 arena 分配器，被 wasm-bindgen 和 Deno 使用 |
| [工作窃取](/zh/patterns/work-stealing/) | [Tokio `worker.rs`](https://github.com/tokio-rs/tokio/blob/master/tokio/src/runtime/scheduler/multi_thread/worker.rs#L1136-L1175) | `Core::steal_work` — 多线程异步运行时的工作窃取 |
| [依赖图](/zh/patterns/dependency-graph/) | [Cargo `resolver/`](https://github.com/rust-lang/cargo/blob/master/src/cargo/core/resolver/dep_cache.rs#L1-L50) | 基于 DAG 的依赖解析，确定 crate 编译顺序 |
