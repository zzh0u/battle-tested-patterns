# Patterns from React

React's reconciler is a masterclass in combining low-level patterns. Five of our ten patterns appear in a single render cycle.

| Pattern | Where in React | What It Does |
|---------|---------------|--------------|
| [Bitmask](/patterns/bitmask/) | [`ReactFiberFlags.js`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberFlags.js#L14-L36) | Side-effect flags on fiber nodes |
| [Double Buffering](/patterns/double-buffering/) | [Fiber `current` / `alternate`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiber.js#L327-L355) | Atomic tree swap during reconciliation |
| [Cooperative Scheduling](/patterns/cooperative-scheduling/) | [`workLoopConcurrent`](https://github.com/facebook/react/blob/main/packages/scheduler/src/forks/Scheduler.js#L188-L258) | Yield every 5ms to keep UI responsive |
| [Min Heap](/patterns/min-heap/) | [`SchedulerMinHeap.js`](https://github.com/facebook/react/blob/main/packages/scheduler/src/SchedulerMinHeap.js#L17-L90) | Priority queue for scheduled tasks |
| [Diff / Patch](/patterns/diff-patch/) | [`ReactChildFiber.js`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactChildFiber.js#L1169-L1340) | Reconcile old and new children lists |

See [Pattern Connections](/guide/pattern-connections) for how these five compose in a single render cycle.

## Further Reading

- [React Source Code (GitHub)](https://github.com/facebook/react)
- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
