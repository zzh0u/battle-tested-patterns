---
title: "学习路径"
description: "四条精选学习路径，引导你系统掌握 46 个模式 — 从入门数据结构到高级分布式系统。"
---

# 学习路径

不确定从哪里开始？选一条匹配你目标的路径。每条路径按顺序编排，前面的模式为后面的打基础。

## 难度说明

每个模式标注了难度等级：

- **入门** — 单一核心机制，前置知识极少
- **进阶** — 组合 2-3 个概念，需要一定背景
- **高级** — 复杂多组件系统，前置知识要求高

## 路径 1：数据结构基础

从简单的固定容器一路学到自平衡树。

| # | 模式 | 难度 | 核心收获 |
|---|------|-----|---------|
| 1 | [Bitmask（位掩码）](/zh/patterns/bitmask/) | 入门 | 用一个整数装 N 个标志位 |
| 2 | [Ring Buffer（环形缓冲区）](/zh/patterns/ring-buffer/) | 入门 | 零分配的固定大小 FIFO |
| 3 | [Tagged Union（标签联合体）](/zh/patterns/tagged-union/) | 入门 | 类型标签实现安全分发 |
| 4 | [Min Heap（最小堆）](/zh/patterns/min-heap/) | 进阶 | O(1) 取最高优先级元素 |
| 5 | [Trie（前缀树）](/zh/patterns/trie/) | 进阶 | O(k) 按键长查找 |
| 6 | [Bloom Filter（布隆过滤器）](/zh/patterns/bloom-filter/) | 进阶 | 概率性成员检测 |
| 7 | [LRU Cache（最近最少使用缓存）](/zh/patterns/lru-cache/) | 进阶 | 哈希表 + 链表组合 |
| 8 | [Skip List（跳表）](/zh/patterns/skip-list/) | 高级 | 概率性有序结构 |
| 9 | [B+ Tree（B+ 树）](/zh/patterns/b-plus-tree/) | 高级 | 磁盘优化的平衡树 |
| 10 | [Merkle Tree（默克尔树）](/zh/patterns/merkle-tree/) | 高级 | 哈希链完整性证明 |
| 11 | [Visitor（访问者）](/zh/patterns/visitor/) | 高级 | 将遍历与操作解耦 |

**学完本路径后**，你将理解数据库（B+ Tree）、缓存（LRU）和区块链（Merkle Tree）背后的核心数据结构。

## 路径 2：并发与调度

从基本锁原语到生产级工作分配。

| # | 模式 | 难度 | 核心收获 |
|---|------|-----|---------|
| 1 | [Semaphore（信号量）](/zh/patterns/semaphore/) | 入门 | 基于计数器的并发限制 |
| 2 | [Double Buffering（双缓冲）](/zh/patterns/double-buffering/) | 入门 | 两个缓冲区的原子交换 |
| 3 | [Observer（观察者）](/zh/patterns/observer/) | 入门 | 订阅/通知解耦 |
| 4 | [Event Loop（事件循环）](/zh/patterns/event-loop/) | 进阶 | 单线程 I/O 多路复用 |
| 5 | [Backpressure（背压）](/zh/patterns/backpressure/) | 进阶 | 生产者/消费者流控 |
| 6 | [Copy-on-Write（写时复制）](/zh/patterns/copy-on-write/) | 进阶 | 共享直到写入 |
| 7 | [Cooperative Scheduling（协作调度）](/zh/patterns/cooperative-scheduling/) | 高级 | 让出执行权保持响应性 |
| 8 | [MVCC（多版本并发控制）](/zh/patterns/mvcc/) | 高级 | 版本化读取永不阻塞写入 |
| 9 | [Work Stealing（工作窃取）](/zh/patterns/work-stealing/) | 高级 | 空闲线程从繁忙队列偷任务 |
| 10 | [Actor Model（Actor 模型）](/zh/patterns/actor-model/) | 高级 | 隔离状态 + 消息传递 |

**学完本路径后**，你将理解 React 如何保持响应性（协作调度）、数据库如何处理并发事务（MVCC）、Go/Tokio 如何调度 goroutine（工作窃取）。

## 路径 3：系统可靠性

构建优雅应对故障的弹性服务。

| # | 模式 | 难度 | 核心收获 |
|---|------|-----|---------|
| 1 | [Retry with Backoff（指数退避重试）](/zh/patterns/retry-backoff/) | 入门 | 指数延迟 + 抖动 |
| 2 | [Batch Processing（批处理）](/zh/patterns/batch-processing/) | 入门 | 摊销单次操作开销 |
| 3 | [State Machine（状态机）](/zh/patterns/state-machine/) | 入门 | 显式状态，不可能的转换被阻止 |
| 4 | [Circuit Breaker（熔断器）](/zh/patterns/circuit-breaker/) | 进阶 | 服务故障时快速失败 |
| 5 | [Rate Limiter（限流器）](/zh/patterns/rate-limiter/) | 进阶 | 令牌桶控制吞吐量 |
| 6 | [Middleware Chain（中间件链）](/zh/patterns/middleware-chain/) | 进阶 | 可组合的请求处理器 |
| 7 | [Dependency Graph（依赖图）](/zh/patterns/dependency-graph/) | 进阶 | DAG + 拓扑排序 |
| 8 | [Registry（注册表）](/zh/patterns/registry/) | 入门 | 插件发现的自注册机制 |
| 9 | [Consistent Hashing（一致性哈希）](/zh/patterns/consistent-hashing/) | 高级 | 节点变更时最小重映射 |
| 10 | [Logical Clock（逻辑时钟）](/zh/patterns/logical-clock/) | 高级 | 无需物理时钟的因果排序 |

**学完本路径后**，你将能够设计弹性 API 网关、服务网格和分布式任务调度器。

## 路径 4：存储引擎内核

理解数据库和存储引擎底层的工作原理。

| # | 模式 | 难度 | 核心收获 |
|---|------|-----|---------|
| 1 | [Tombstone（墓碑标记）](/zh/patterns/tombstone/) | 入门 | 标记删除，稍后压缩 |
| 2 | [Dirty Flag（脏标记）](/zh/patterns/dirty-flag/) | 入门 | 未变更则跳过重算 |
| 3 | [Iterator（迭代器）](/zh/patterns/iterator/) | 入门 | 惰性拉取式遍历 |
| 4 | [Write-Ahead Log（预写日志）](/zh/patterns/write-ahead-log/) | 进阶 | 先写日志再应用，保证崩溃安全 |
| 5 | [Checkpointing（检查点）](/zh/patterns/checkpointing/) | 进阶 | 定期状态快照 |
| 6 | [Diff / Patch（差异/补丁）](/zh/patterns/diff-patch/) | 进阶 | 最小变更计算 |
| 7 | [LSM Tree（日志结构合并树）](/zh/patterns/lsm-tree/) | 高级 | 写优化的磁盘存储 |
| 8 | [Merge Iterator（合并迭代器）](/zh/patterns/merge-iterator/) | 高级 | 有序流的 K 路归并 |

**学完本路径后**，你将理解 LevelDB/RocksDB 的架构（LSM Tree + WAL + Checkpointing）以及 Git 如何追踪变更（Diff/Patch + Merkle Tree）。

## 内存管理路径（附加）

面向系统程序员，理解分配器和 GC 替代方案。

| # | 模式 | 难度 | 核心收获 |
|---|------|-----|---------|
| 1 | [Reference Counting（引用计数）](/zh/patterns/reference-counting/) | 入门 | 计数归零即确定性释放 |
| 2 | [Object Pool（对象池）](/zh/patterns/object-pool/) | 入门 | 预分配并复用 |
| 3 | [Flyweight（享元）](/zh/patterns/flyweight/) | 入门 | 共享相同实例 |
| 4 | [Interning（驻留）](/zh/patterns/interning/) | 进阶 | 基于哈希的去重 |
| 5 | [Free List（空闲链表）](/zh/patterns/free-list/) | 进阶 | 从释放槽位 O(1) 分配 |
| 6 | [Arena Allocator（Arena 分配器）](/zh/patterns/arena-allocator/) | 进阶 | 连续分配，批量释放 |
| 7 | [Vtable（虚函数表）](/zh/patterns/vtable/) | 高级 | 函数指针实现运行时多态 |

**学完本路径后**，你将理解 Go 的 `sync.Pool`、Rust 的 `bumpalo` 和 CPython 的小对象分配器的工作原理。

## 建议学习节奏

| 节奏 | 每天时间 | 全部完成 |
|------|---------|---------|
| 轻松 | 30 分钟/天 | ~8 周 |
| 适中 | 1 小时/天 | ~4 周 |
| 集中 | 2 小时/天 | ~2 周 |

每个模式的建议流程：阅读文档（10 分钟）→ 操作可视化（5 分钟）→ 用一种语言完成练习（15-30 分钟）→ 回答挑战问题（5 分钟）。

> **提示**：Fork 本仓库，使用[学习计划](https://github.com/Totoro-jam/battle-tested-patterns/blob/main/STUDY_PLAN.md)中的 checkbox 追踪你的进度。
