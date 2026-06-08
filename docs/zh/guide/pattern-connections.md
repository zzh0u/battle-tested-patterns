---
title: "模式如何协作"
description: "46 个模式如何关联：组合链路、共享构建块和真实系统中的模式组合。"
---

# 模式如何协作

这些模式不是孤立存在的。最有价值的洞察是生产系统如何将它们**组合**在一起。

**交互式探索** — 点击任意系统查看它使用了哪些模式及其原因：

<PatternConnectionsViz />

## 组合链路

最有价值的洞察不是有哪些模式存在 — 而是它们在真实系统中如何**链式组合**。

### React Reconciler：从标志位到帧

```text
Bitmask          → 标志位编码需要做什么工作
    ↓
Dirty Flag       → 跳过未变更的子树
    ↓
Min Heap         → 先挑最高优先级的工作
    ↓
Cooperative Scheduling → 每 5ms 让出避免卡顿
    ↓
Diff / Patch     → 计算最小树变更
    ↓
Double Buffering → 构建 workInProgress 树，原子交换
    ↓
Batch Processing → 一次提交刷新所有状态更新
```

### PostgreSQL：从写入到恢复

```text
Write-Ahead Log  → 每次修改先写日志再应用
    ↓
Checkpointing    → 定期快照限制崩溃恢复时的重放量
    ↓
B+ Tree          → 磁盘优化索引支持范围查询
    ↓
MVCC             → 读者看到一致快照，永不阻塞写者
    ↓
LRU Cache        → 缓冲池将热页面保持在内存中
    ↓
Bloom Filter     → 跳过对不存在键的索引查找
```

### Kafka Broker：从生产者到消费者

```text
Batch Processing → 累积消息，批量 fsync
    ↓
Write-Ahead Log  → 磁盘上的追加日志段
    ↓
Ring Buffer      → 固定大小 I/O 事件队列
    ↓
Backpressure     → 慢消费者信号生产者节流
    ↓
Consistent Hashing → 跨 broker 分区分配
    ↓
Tombstone        → 日志压缩移除过期记录
```

### Go Runtime：调度 + 内存

```text
Work Stealing    → 空闲 P 从忙碌 P 的队列偷取 goroutine
    ↓
Semaphore        → GOMAXPROCS 限制并发 OS 线程
    ↓
Object Pool      → sync.Pool 回收频繁分配的对象
    ↓
Free List        → mspan 追踪 size class 中的空闲槽位
    ↓
Arena Allocator  → 栈帧以 bump pointer 方式分配
    ↓
Copy-on-Write    → slice append 容量不足时才复制
```

## 全局视角

理解单个模式有用。理解它们如何**组合**才是区分高级工程师和初级工程师的关键。

当你遇到性能问题时，你不会想"我需要一个 bitmask"。你会想"我需要低成本追踪多个状态（bitmask）、跳过未变更的部分（subtree flags）、增量处理工作（cooperative scheduling）、优先处理紧急任务（min heap）、在热路径上避免分配（double buffering）。"

这就是 React 团队构建的。这就是 Redis、Go、Linux、PostgreSQL 和 Kafka 都在展示的。相同的模式以不同的配置重新组合，解决不同的问题。

## 总结：跨系统的模式分布

| 模式 | React | Redis | Go Runtime | Linux | PostgreSQL | Kafka |
|------|:-----:|:-----:|:----------:|:-----:|:----------:|:-----:|
| [**位掩码**](/zh/patterns/bitmask/) | ✅ | | ✅ | ✅ | | |
| [**最小堆**](/zh/patterns/min-heap/) | ✅ | | ✅ | ✅ | | |
| [**协作调度**](/zh/patterns/cooperative-scheduling/) | ✅ | | ✅ | | | |
| [**差异/补丁**](/zh/patterns/diff-patch/) | ✅ | | | | | |
| [**双缓冲**](/zh/patterns/double-buffering/) | ✅ | | | | | |
| [**批处理**](/zh/patterns/batch-processing/) | ✅ | ✅ | | ✅ | | ✅ |
| [**脏标记**](/zh/patterns/dirty-flag/) | ✅ | | | | | |
| [**观察者**](/zh/patterns/observer/) | ✅ | | | | | |
| [**跳表**](/zh/patterns/skip-list/) | | ✅ | | | | |
| [**LRU 缓存**](/zh/patterns/lru-cache/) | | ✅ | ✅ | | ✅ | |
| [**Trie 前缀树**](/zh/patterns/trie/) | | ✅ | | ✅ | | |
| [**布隆过滤器**](/zh/patterns/bloom-filter/) | | | | | ✅ | |
| [**工作窃取**](/zh/patterns/work-stealing/) | | | ✅ | | | |
| [**空闲链表**](/zh/patterns/free-list/) | | | ✅ | ✅ | | |
| [**信号量**](/zh/patterns/semaphore/) | | | ✅ | ✅ | | |
| [**对象池**](/zh/patterns/object-pool/) | | | ✅ | | | |
| [**享元**](/zh/patterns/flyweight/) | | | ✅ | | | |
| [**限流器**](/zh/patterns/rate-limiter/) | | | ✅ | ✅ | | |
| [**Arena 分配器**](/zh/patterns/arena-allocator/) | | | ✅ | | | |
| [**状态机**](/zh/patterns/state-machine/) | | | | ✅ | | |
| [**环形缓冲区**](/zh/patterns/ring-buffer/) | | | | ✅ | | ✅ |
| [**背压**](/zh/patterns/backpressure/) | | | | ✅ | | ✅ |
| [**虚函数表**](/zh/patterns/vtable/) | | | | ✅ | | |
| [**引用计数**](/zh/patterns/reference-counting/) | | | | ✅ | | |
| [**写时复制**](/zh/patterns/copy-on-write/) | | ✅ | ✅ | ✅ | | |
| [**墓碑**](/zh/patterns/tombstone/) | | | | | | ✅ |
| [**MVCC**](/zh/patterns/mvcc/) | | | | | ✅ | |
| [**预写日志**](/zh/patterns/write-ahead-log/) | | | | | ✅ | ✅ |
| [**B+ 树**](/zh/patterns/b-plus-tree/) | | | | ✅ | ✅ | |
| [**检查点**](/zh/patterns/checkpointing/) | | ✅ | | | ✅ | |
| [**事件循环**](/zh/patterns/event-loop/) | | ✅ | ✅ | ✅ | | |
| [**迭代器**](/zh/patterns/iterator/) | ✅ | | ✅ | | | |
| [**标签联合体**](/zh/patterns/tagged-union/) | ✅ | | ✅ | | | |
| [**指数退避重试**](/zh/patterns/retry-backoff/) | | | | | | ✅ |
| [**一致性哈希**](/zh/patterns/consistent-hashing/) | | | ✅ | | | ✅ |

### 其他系统中的锚点模式

剩余 11 个模式主要存在于上述六大系统之外：

| 模式 | 主要系统 |
|------|----------|
| [**LSM 树**](/zh/patterns/lsm-tree/) | LevelDB、RocksDB — 现代 KV 存储的核心写入引擎 |
| [**合并迭代器**](/zh/patterns/merge-iterator/) | LevelDB、RocksDB — 压缩时的 K 路归并 |
| [**逻辑时钟**](/zh/patterns/logical-clock/) | etcd（Raft term/index）、LevelDB（序列号） |
| [**Merkle 树**](/zh/patterns/merkle-tree/) | Git（对象完整性校验）、ZFS（块校验和） |
| [**Actor 模型**](/zh/patterns/actor-model/) | Erlang/OTP、Akka — 消息传递并发 |
| [**熔断器**](/zh/patterns/circuit-breaker/) | Netflix Hystrix、gobreaker — 微服务弹性 |
| [**中间件链**](/zh/patterns/middleware-chain/) | gRPC-Go 拦截器、Koa.js 洋葱模型 |
| [**注册表**](/zh/patterns/registry/) | TensorFlow（算子注册）、gRPC-Go（服务注册） |
| [**依赖图**](/zh/patterns/dependency-graph/) | Cargo（构建解析）、pnpm（工作区调度） |
| [**访问者**](/zh/patterns/visitor/) | LLVM（InstVisitor）、Vue 编译器（AST 转换） |
| [**驻留**](/zh/patterns/interning/) | rustc（符号驻留）、CPython（字符串/整数缓存） |
