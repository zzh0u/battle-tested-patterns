---
description: "46 个模式如何关联：组合链路、共享构建块和真实系统中的模式组合。"
---

# 模式如何协作

这些模式不是孤立存在的。最有价值的洞察是生产系统如何将它们**组合**在一起。

**交互式探索** — 点击任意系统查看它使用了哪些模式及其原因：

<PatternConnectionsViz />

## 全局视角

理解单个模式有用。理解它们如何**组合**才是区分高级工程师和初级工程师的关键。

当你遇到性能问题时，你不会想"我需要一个 bitmask"。你会想"我需要低成本追踪多个状态（bitmask）、跳过未变更的部分（subtree flags）、增量处理工作（cooperative scheduling）、优先处理紧急任务（min heap）、在热路径上避免分配（double buffering）。"

这就是 React 团队构建的。这就是 Redis、Go、Linux、PostgreSQL 和 Kafka 都在展示的。相同的模式以不同的配置重新组合，解决不同的问题。

## 总结：跨系统的模式分布

| 模式 | React | Redis | Go Runtime | Linux | PostgreSQL | Kafka |
|------|:-----:|:-----:|:----------:|:-----:|:----------:|:-----:|
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
