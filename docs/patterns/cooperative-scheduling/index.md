# Pattern: Cooperative Scheduling

## One Liner

Break long-running work into small chunks, yielding control back to the host between each chunk to keep the system responsive.

## Core Idea

In cooperative scheduling, a task voluntarily checks whether it should pause and let other work run. Unlike preemptive scheduling (where the OS forcibly interrupts), cooperative scheduling relies on the task itself to yield at safe points.

```mermaid
sequenceDiagram
    participant W as Work Loop
    participant H as Host (Browser)
    W->>W: Process chunk 1
    W->>H: Yield (setTimeout)
    H->>H: Handle user input & repaint
    H->>W: Resume
    W->>W: Process chunk 2
    W->>H: Yield (setTimeout)
    H->>H: Handle animations & other tasks
    H->>W: Resume
    W->>W: Process chunk 3 (done)
```

**Without yielding**: one long task blocks everything. **With yielding**: small chunks interleave with UI updates.

The pattern: run a loop, check a deadline after each unit of work, and `yield` if time is up.

## Production Proof

| Project | Source | Usage |
|---------|--------|-------|
| React | [Scheduler.js](https://github.com/facebook/react/blob/main/packages/scheduler/src/forks/Scheduler.js#L1) | React's scheduler uses `shouldYieldToHost()` to check if the 5ms time slice has elapsed. The `workLoop` function processes tasks from a min-heap, yielding between each task when the deadline is reached. |
| Go Runtime | [proc.go](https://github.com/golang/go/blob/master/src/runtime/proc.go#L1) | Go's goroutine scheduler uses cooperative preemption points. Goroutines check `stackguard0` at function prologues — when the runtime sets it to `stackPreempt`, the goroutine yields at the next safe point. |

## Implementation

::: code-group

```typescript [TypeScript]
type Task = () => boolean; // returns true if more work remains

interface Scheduler {
  scheduleTask(task: Task): void;
  flush(): void;
}

function createScheduler(yieldInterval: number = 5): Scheduler {
  const queue: Task[] = [];
  let isRunning = false;

  function shouldYield(startTime: number): boolean {
    return performance.now() - startTime >= yieldInterval;
  }

  function workLoop(): void {
    const startTime = performance.now();

    while (queue.length > 0) {
      if (shouldYield(startTime)) {
        // Yield to the host — schedule continuation
        setTimeout(workLoop, 0);
        return;
      }

      const task = queue[0]!;
      const hasMoreWork = task();

      if (!hasMoreWork) {
        queue.shift();
      }
    }

    isRunning = false;
  }

  return {
    scheduleTask(task: Task) {
      queue.push(task);
      if (!isRunning) {
        isRunning = true;
        setTimeout(workLoop, 0);
      }
    },
    flush() {
      while (queue.length > 0) {
        const task = queue[0]!;
        if (!task()) queue.shift();
      }
      isRunning = false;
    },
  };
}
```

```rust [Rust]
use std::time::{Duration, Instant};

pub struct CooperativeScheduler {
    yield_interval: Duration,
}

impl CooperativeScheduler {
    pub fn new(yield_ms: u64) -> Self {
        CooperativeScheduler {
            yield_interval: Duration::from_millis(yield_ms),
        }
    }

    pub fn run<F>(&self, mut work_units: Vec<F>) -> Vec<F>
    where
        F: FnMut() -> bool,
    {
        let start = Instant::now();

        while !work_units.is_empty() {
            if start.elapsed() >= self.yield_interval {
                // Yield: return remaining work to caller
                return work_units;
            }

            let done = (work_units[0])();
            if done {
                work_units.remove(0);
            }
        }

        work_units // empty = all done
    }
}
```

```go [Go]
package scheduling

import "time"

type Task func() bool // returns true when done

type Scheduler struct {
	YieldInterval time.Duration
	queue         []Task
}

func New(yieldInterval time.Duration) *Scheduler {
	return &Scheduler{YieldInterval: yieldInterval}
}

func (s *Scheduler) Schedule(task Task) {
	s.queue = append(s.queue, task)
}

// WorkLoop processes tasks, yielding when the time slice expires.
// Returns true if all work is done, false if yielded.
func (s *Scheduler) WorkLoop() bool {
	start := time.Now()

	for len(s.queue) > 0 {
		if time.Since(start) >= s.YieldInterval {
			return false // yield
		}

		done := s.queue[0]()
		if done {
			s.queue = s.queue[1:]
		}
	}

	return true // all done
}
```

```python [Python]
import time

def work_loop(items, process_item, yield_ms=5):
    """Process items, yielding when time budget exceeded."""
    start = time.monotonic()
    completed = 0

    while completed < len(items):
        elapsed_ms = (time.monotonic() - start) * 1000
        if elapsed_ms >= yield_ms:
            return items[completed:]  # return remaining work

        process_item(items[completed])
        completed += 1

    return []  # all done

# Usage
results = []
remaining = work_loop(
    list(range(100)),
    lambda x: results.append(x * 2),
    yield_ms=5
)
# remaining contains items not yet processed (if any)
```

:::

## Exercises

| Level | Exercise | File |
|-------|----------|------|
| Basic | Implement a time-sliced work loop with yield check | `exercises/typescript/cooperative-scheduling/01-basic.test.ts` |
| Intermediate | Build a priority scheduler that yields between tasks | `exercises/typescript/cooperative-scheduling/02-priority-scheduler.test.ts` |

Run exercises: `pnpm test`

## When to Use

- **UI thread work** — keep animations and input responsive while processing large datasets
- **Batch processing** — process items in chunks with pauses for other system work
- **Long computations** — break recursive tree traversals or list operations into resumable chunks
- **Concurrent runtimes** — implement green threads or coroutine scheduling

## When NOT to Use

- **Short tasks** — if the work finishes in < 1ms, the yield overhead isn't worth it
- **Real-time guarantees** — cooperative scheduling can't guarantee deadlines; use preemptive scheduling
- **CPU-bound with no interaction** — if nothing else needs the thread, yielding wastes time
- **When `requestIdleCallback` suffices** — for non-urgent work, the browser's built-in API may be enough

## Try It

<script setup>
const csLangs = {
  typescript: `// Cooperative Scheduling: process items, yield when budget exceeded
function workLoop(items, processItem, shouldYield) {
  var completed = 0;
  while (completed < items.length) {
    if (shouldYield()) {
      return { completed: completed, yielded: true };
    }
    processItem(items[completed]);
    completed++;
  }
  return { completed: completed, yielded: false };
}

// Test 1: process all when no yield
var processed = [];
var r1 = workLoop([1,2,3,4,5], function(x) { processed.push(x); }, function() { return false; });
assertEquals(r1.completed, 5, "completed all 5 items");
assertEquals(r1.yielded, false, "did not yield");

// Test 2: yield after 3 items
processed = [];
var count = 0;
var r2 = workLoop([10,20,30,40,50], function(x) { processed.push(x); }, function() { count++; return count > 3; });
assertEquals(r2.completed, 3, "completed 3 before yield");
assertEquals(r2.yielded, true, "yielded");

// Test 3: resume with remaining
var remaining = [40, 50];
count = 0;
var r3 = workLoop(remaining, function(x) { processed.push(x); }, function() { return false; });
assertEquals(r3.completed, 2, "completed remaining 2");

console.log("All assertions passed!");`,
  python: `# Cooperative Scheduling: process items, yield when budget exceeded
def work_loop(items, process_item, should_yield):
    completed = 0
    while completed < len(items):
        if should_yield():
            return {"completed": completed, "yielded": True}
        process_item(items[completed])
        completed += 1
    return {"completed": completed, "yielded": False}

# Test: process all when no yield
processed = []
r1 = work_loop([1,2,3,4,5], lambda x: processed.append(x), lambda: False)
assert r1["completed"] == 5, "completed all"
assert not r1["yielded"], "did not yield"

# Test: yield after 3
count = [0]
def should_yield():
    count[0] += 1
    return count[0] > 3
processed = []
r2 = work_loop([10,20,30,40,50], lambda x: processed.append(x), should_yield)
assert r2["completed"] == 3, "yielded after 3"

print("All assertions passed!")`
};
</script>

<CodePlayground title="Cooperative Scheduling Playground" :languages="csLangs" />
