# React 中的模式

React 源码是生产验证模式的宝库。以下是我们提取的模式：

| 模式 | React 中的位置 | 作用 |
|------|---------------|------|
| [位掩码](/zh/patterns/bitmask/) | `ReactFiberFlags.js` | Fiber 节点上的副作用标志 |
| [双缓冲](/zh/patterns/double-buffering/) | Fiber `current` / `alternate` | 协调过程中的原子树切换 |
| [协作调度](/zh/patterns/cooperative-scheduling/) | `workLoopConcurrent` | 每 5ms 让出以保持 UI 响应 |
| [最小堆](/zh/patterns/min-heap/) | `SchedulerMinHeap.js` | 调度任务的优先队列 |
| [差异/补丁](/zh/patterns/diff-patch/) | `ReactChildFiber.js` | 协调新旧子节点列表 |

## 延伸阅读

- [React 源码 (GitHub)](https://github.com/facebook/react)
- [React Fiber 架构](https://github.com/acdlite/react-fiber-architecture)
