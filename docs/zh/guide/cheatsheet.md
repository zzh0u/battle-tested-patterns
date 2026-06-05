---
description: "46 个实战模式速查表 — 复杂度、适用场景、按问题选模式指南。"
---

# 速查表

全部 46 个模式的单页参考卡。收藏、打印、或 Ctrl-F 查找。

## 按问题选模式

不确定用哪个模式？从这里开始。

| 我需要... | 选择 | 为什么 |
|---|---|---|
| 限制并发访问 | [信号量](/zh/patterns/semaphore/) | 基于计数器，OS 内核验证 |
| 处理慢消费者 | [背压](/zh/patterns/backpressure/) | 不丢弃 — 向上游施压 |
| 带淘汰的缓存 | [LRU 缓存](/zh/patterns/lru-cache/) | O(1) 读写，自动淘汰最冷数据 |
| 快速前缀查找 | [Trie 前缀树](/zh/patterns/trie/) | O(k) 按键长，与集合大小无关 |
| 概率性集合检测 | [布隆过滤器](/zh/patterns/bloom-filter/) | 零假阴性，极小内存 |
| 有序范围查询 | [B+ 树](/zh/patterns/b-plus-tree/) 或 [跳表](/zh/patterns/skip-list/) | B+ 树适合磁盘，跳表适合内存 |
| 崩溃安全写入 | [预写日志](/zh/patterns/write-ahead-log/) + [检查点](/zh/patterns/checkpointing/) | 先写日志 + 定期快照 |
| 阻止级联故障 | [熔断器](/zh/patterns/circuit-breaker/) | 快速失败，渐进恢复 |
| 重试失败调用 | [指数退避重试](/zh/patterns/retry-backoff/) | 指数退避 + 抖动 |
| 控制吞吐量 | [限流器](/zh/patterns/rate-limiter/) | 令牌桶，恒定补充 |
| 验证数据完整性 | [默克尔树](/zh/patterns/merkle-tree/) | O(log n) 哈希链证明 |
| 共享减少内存 | [享元](/zh/patterns/flyweight/) 或 [驻留](/zh/patterns/interning/) | 共享不可变值 |
| 避免 GC 压力 | [对象池](/zh/patterns/object-pool/) 或 [Arena 分配器](/zh/patterns/arena-allocator/) | 复用或批量释放 |
| 低成本变更检测 | [脏标记](/zh/patterns/dirty-flag/) | 干净时跳过重计算 |
| 分布式事件排序 | [逻辑时钟](/zh/patterns/logical-clock/) | Lamport 或向量时钟 |
| 惰性求值 | [迭代器](/zh/patterns/iterator/) | 拉取式，零中间分配 |
| 处理多种类型 | [标签联合体](/zh/patterns/tagged-union/) 或 [虚函数表](/zh/patterns/vtable/) | 封闭集用 tag，开放集用 vtable |
| 写密集型负载 | [LSM 树](/zh/patterns/lsm-tree/) | 缓冲 → 刷盘 → 合并 |
| 组合中间件 | [中间件链](/zh/patterns/middleware-chain/) | 洋葱模型，逐层包裹 |
| 跨线程负载均衡 | [工作窃取](/zh/patterns/work-stealing/) | 空闲线程从忙碌队列偷取 |
| 追踪多个标志 | [位掩码](/zh/patterns/bitmask/) | N 个标志装进一个整数 |
| 按优先级调度 | [最小堆](/zh/patterns/min-heap/) | O(1) peek，O(log n) push/pop |
| 固定大小 FIFO | [环形缓冲区](/zh/patterns/ring-buffer/) | 环形绕回，零分配 |
| 最小差异计算 | [差异/补丁](/zh/patterns/diff-patch/) | 计算 + 应用变更 |
| 解耦生产者/消费者 | [观察者](/zh/patterns/observer/) | 订阅模型 |
| 分布式键分配 | [一致性哈希](/zh/patterns/consistent-hashing/) | 增减节点仅重映射 ~1/n |
| 依赖构建顺序 | [依赖图](/zh/patterns/dependency-graph/) | DAG + 拓扑排序 |
| 原子状态转换 | [状态机](/zh/patterns/state-machine/) | 显式状态，不可能的转换不可表示 |
| 延迟删除后清理 | [墓碑](/zh/patterns/tombstone/) | 标记删除，稍后压缩 |
| 写时复制共享 | [写时复制](/zh/patterns/copy-on-write/) | 写入前共享 |
| 确定性清理 | [引用计数](/zh/patterns/reference-counting/) | rc=0 即释放，无 GC 暂停 |
| 注册/发现服务 | [注册表](/zh/patterns/registry/) | 名称 → 处理器映射 |
| 原子状态交换 | [双缓冲](/zh/patterns/double-buffering/) | 写后缓冲，交换到前端 |
| 无阻塞读取 | [MVCC](/zh/patterns/mvcc/) | 版本化快照 |
| 保持主线程响应 | [协作调度](/zh/patterns/cooperative-scheduling/) | 分片让出 |
| 单线程 I/O | [事件循环](/zh/patterns/event-loop/) | 无线程的多路复用 |
| 累积后刷新 | [批处理](/zh/patterns/batch-processing/) | 摊销单次操作开销 |
| Actor 风格隔离 | [Actor 模型](/zh/patterns/actor-model/) | 私有状态 + 消息传递 |
| 树遍历分发 | [访问者](/zh/patterns/visitor/) | 类型特定回调 |
| O(1) 空闲槽分配 | [空闲链表](/zh/patterns/free-list/) | 空闲块链表 |
| 合并有序流 | [合并迭代器](/zh/patterns/merge-iterator/) | 基于最小堆的 K 路归并 |

## 复杂度参考

### 数据结构

| 模式 | 插入 | 查找 | 删除 | 空间 | 关键权衡 |
|---|---|---|---|---|---|
| [位掩码](/zh/patterns/bitmask/) | O(1) | O(1) | O(1) | O(1) | 受限于字长 |
| [最小堆](/zh/patterns/min-heap/) | O(log n) | O(1) peek | O(log n) | O(n) | 只有 peek-min 快 |
| [环形缓冲区](/zh/patterns/ring-buffer/) | O(1) | O(1) | O(1) | O(n) 固定 | 固定容量 |
| [Trie 前缀树](/zh/patterns/trie/) | O(k) | O(k) | O(k) | O(SIGMA * n) | 稀疏键时内存大 |
| [跳表](/zh/patterns/skip-list/) | O(log n) 均摊 | O(log n) 均摊 | O(log n) 均摊 | O(n) 均摊 | 概率性，比树简单 |
| [布隆过滤器](/zh/patterns/bloom-filter/) | O(k) | O(k) | N/A | O(m) bits | 可能有假阳性 |
| [LRU 缓存](/zh/patterns/lru-cache/) | O(1) | O(1) | O(1) | O(n) | 容量满时淘汰 |
| [B+ 树](/zh/patterns/b-plus-tree/) | O(log n) | O(log n) | O(log n) | O(n) | 磁盘优化，高扇出 |
| [标签联合体](/zh/patterns/tagged-union/) | N/A | O(1) dispatch | N/A | O(最大变体) | 封闭类型集 |
| [默克尔树](/zh/patterns/merkle-tree/) | O(log n) | O(log n) | O(log n) | O(n) | 用于验证，非搜索 |
| [合并迭代器](/zh/patterns/merge-iterator/) | N/A | O(log k) next | N/A | O(k) | k = 流的数量 |

### 系统模式

| 模式 | 吞吐量 | 延迟 | 故障模式 |
|---|---|---|---|
| [熔断器](/zh/patterns/circuit-breaker/) | 关闭时正常 | 关闭时 +0，打开时快速失败 | 打开时阻断所有调用 |
| [限流器](/zh/patterns/rate-limiter/) | 受限于令牌速率 | 有令牌时 +0 | 拒绝超额 (429) |
| [指数退避重试](/zh/patterns/retry-backoff/) | 重试期间降低 | 指数增长 | 无抖动时放大 |
| [预写日志](/zh/patterns/write-ahead-log/) | 顺序写速度 | +1 次写入（先写日志） | 安全 — 从日志重放 |
| [批处理](/zh/patterns/batch-processing/) | 更高（摊销） | 更高（等待批次） | 崩溃丢失整批 |
| [一致性哈希](/zh/patterns/consistent-hashing/) | 与底层相同 | +哈希计算 | 节点变更时 ~1/n 键重映射 |

### 内存模式

| 模式 | 分配 | 释放 | 开销 | 最适合 |
|---|---|---|---|---|
| [对象池](/zh/patterns/object-pool/) | O(1) 均摊 | O(1) 归还 | 池大小 | 高频同类型对象 |
| [Arena 分配器](/zh/patterns/arena-allocator/) | O(1) bump | O(1) 批量释放 | 对齐浪费 | 阶段性生命周期 |
| [空闲链表](/zh/patterns/free-list/) | O(1) | O(1) | 每槽 next 指针 | 固定大小块 |
| [享元](/zh/patterns/flyweight/) | O(1) 查找 | 共享不释放 | 查找表 | 大量相同小对象 |
| [写时复制](/zh/patterns/copy-on-write/) | O(1) 共享 | O(n) 首次写入 | 每页引用计数 | 读多写少的共享数据 |
| [引用计数](/zh/patterns/reference-counting/) | O(1) clone | O(1) rc=0 时 | 每对象计数器 | 确定性清理 |
| [驻留](/zh/patterns/interning/) | O(k) 首次，O(1) 后续 | 池化管理 | 哈希表 | 字符串/符号去重 |

## 模式组合

模式很少单独出现。这些是最常见的生产组合：

| 组合 | 用于 | 为什么一起用 |
|---|---|---|
| 预写日志 + 检查点 | PostgreSQL, etcd | WAL 保安全，检查点限制重放 |
| 布隆过滤器 + LSM 树 | LevelDB, RocksDB | 跳过不必要的磁盘读取 |
| 最小堆 + 合并迭代器 | LevelDB compaction | 高效合并 K 个有序 run |
| 熔断器 + 重试 | gRPC, Hystrix | 重试瞬时故障，熔断持久故障 |
| 限流器 + 背压 | API 网关 | 限制入口，信号过载 |
| 环形缓冲区 + 事件循环 | libuv, io_uring | 固定大小 I/O 事件队列 |
| 对象池 + 空闲链表 | Go runtime | 池管理 slab，空闲链表追踪槽 |
| MVCC + B+ 树 | PostgreSQL | 磁盘优化索引中的版本化行 |
| 脏标记 + 双缓冲 | React Fiber | 标记脏，批量到下一帧 |
| 位掩码 + 状态机 | React reconciler | 标志编码状态，位运算转换 |
| 一致性哈希 + 注册表 | 服务网格 | 哈希定位，注册表发现 |
| Trie 前缀树 + 驻留 | 编译器 | 驻留字符串，前缀查找 |

## 决策树

### "选哪种缓存？"

<DecisionTree variant="which-cache" />

### "选哪种内存策略？"

<DecisionTree variant="which-memory" />

### "选哪种并发模型？"

<DecisionTree variant="which-concurrency" />
