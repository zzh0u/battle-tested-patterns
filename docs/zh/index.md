---
layout: home
description: "46 个经过生产验证的编程模式，源自 React、Linux、Go、Chromium — 交互式可视化、精确源码链接、多语言实现、可运行练习。"

hero:
  name: Battle-Tested Patterns
  text: 生产验证的编程模式
  tagline: 从 React 调度器到 Linux 内核——46 个模式，可交互探索、可溯源真实代码、可用 4 种语言实现。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/what-is-this
    - theme: alt
      text: 浏览模式
      link: /zh/patterns/
    - theme: alt
      text: 面试指南
      link: /zh/guide/interview

features:
  - icon:
      src: /images/interactive_visualizations.png
      width: 100
      height: 100
    title: 交互式可视化
    details: 每个模式都配有动手操作的 SVG 可视化。点击、拖拽、实验——通过亲身操作建立直觉，而非只是阅读。
  - icon:
      src: /images/production_proof.png
      width: 100
      height: 100
    title: 生产验证
    details: 每个模式附带精确到行号的 GitHub 源码链接，证明它在真实项目中被使用。
  - icon:
      src: /images/multi-language.png
      width: 100
      height: 100
    title: 多语言实现
    details: TypeScript、Rust、Go、Python 的地道实现——不是机械翻译，而是每种语言的原生表达。
  - icon:
      src: /images/runnable_exercises.png
      width: 100
      height: 100
    title: 可运行练习
    details: 渐进式练习（基础 → 进阶 → 高级），配套测试用例，本地即可运行。
  - icon:
      src: /images/challengequestions.png
      width: 100
      height: 100
    title: 挑战题
    details: 每个模式包含 3-4 个场景化"你猜会怎样"题目，验证真正理解而非泛泛浏览。
  - icon:
      src: /images/real_system_case.png
      width: 100
      height: 100
    title: 真实系统案例
    details: 看 React、Redis、Go runtime、Linux、PostgreSQL、Kafka 如何在生产中组合使用多个模式。
---

## 试试看——交互式最小堆

每个模式页面都有类似的动手可视化。点击 **插入随机值** 观看堆算法运行，或试试 **React 调度器** 场景：

<MinHeapViz />

## 模式精选

> [浏览全部 46 个模式 →](/zh/patterns/) · [模式时间线 →](/zh/guide/timeline)

### 数据结构 <span class="home-count">11 个模式</span>

| 模式 | 核心洞察 | 来源项目 |
|------|---------|---------|
| [布隆过滤器 (Bloom Filter)](/zh/patterns/bloom-filter/) | 概率成员测试——零漏判 | LevelDB, Chromium |
| [B+ 树](/zh/patterns/b-plus-tree/) | 叶链平衡树，支持范围扫描 | PostgreSQL, SQLite |
| [最小堆 (Min Heap)](/zh/patterns/min-heap/) | O(1) 访问最高优先级元素 | React Scheduler, Linux CFS |

### 并发 <span class="home-count">9 个模式</span>

| 模式 | 核心洞察 | 来源项目 |
|------|---------|---------|
| [事件循环 (Event Loop)](/zh/patterns/event-loop/) | 单线程 I/O 多路复用 | libuv, Redis |
| [MVCC](/zh/patterns/mvcc/) | 版本化读永不阻塞写 | PostgreSQL, etcd |
| [工作窃取 (Work Stealing)](/zh/patterns/work-stealing/) | 空闲线程从繁忙队列窃取 | Go runtime, Tokio |

### 系统 <span class="home-count">12 个模式</span>

| 模式 | 核心洞察 | 来源项目 |
|------|---------|---------|
| [熔断器 (Circuit Breaker)](/zh/patterns/circuit-breaker/) | 停止调用故障服务，快速失败 | Netflix Hystrix, gobreaker |
| [预写日志 (WAL)](/zh/patterns/write-ahead-log/) | 先记录再应用，崩溃可恢复 | etcd, PostgreSQL |
| [一致性哈希](/zh/patterns/consistent-hashing/) | 增删节点只重映射 ~1/n 的键 | Go groupcache, HAProxy |

### 内存 <span class="home-count">8 个模式</span>

| 模式 | 核心洞察 | 来源项目 |
|------|---------|---------|
| [写时复制 (Copy-on-Write)](/zh/patterns/copy-on-write/) | 引用共享，修改时才复制 | Git, Rust Cow |
| [Arena 分配器](/zh/patterns/arena-allocator/) | 区域内推进指针，一次性释放 | Rust bumpalo, Go |
| [引用计数 (Reference Counting)](/zh/patterns/reference-counting/) | 零引用自动清理 | CPython, Rust Arc |

### 行为型 <span class="home-count">6 个模式</span>

| 模式 | 核心洞察 | 来源项目 |
|------|---------|---------|
| [状态机 (State Machine)](/zh/patterns/state-machine/) | 显式状态，不可能转换不可表达 | XState, Linux TCP |
| [差异/补丁 (Diff/Patch)](/zh/patterns/diff-patch/) | 计算两个状态间最小变更 | React Reconciler, Git |
| [迭代器 (Iterator)](/zh/patterns/iterator/) | 惰性序列，零中间分配 | Rust Iterator, Python |

<p style="text-align: center; margin-top: 2rem;">

[浏览全部 46 个模式 →](/zh/patterns/)

</p>

<style>
.home-count {
  font-size: 0.8em;
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin-left: 0.5em;
}
</style>
