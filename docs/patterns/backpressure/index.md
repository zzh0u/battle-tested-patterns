# Pattern: Backpressure / Flow Control

## One Liner

Slow down producers when consumers can't keep up — use bounded buffers and demand signals to prevent resource exhaustion.

## Core Idea

Backpressure is a flow control mechanism where the consumer signals the producer to slow down or stop. Without it, a fast producer overwhelms a slow consumer, causing unbounded memory growth, dropped messages, or system crashes. The key: **bounded buffers** + **blocking/signaling when full**.

```text
  Producer                     Bounded Buffer                Consumer
  ─────────                   ──────────────                ─────────
  emit(data) ──────────►  ┌──┬──┬──┬──┬──┐  ──────────►  process(data)
                          │ 5│ 4│ 3│ 2│ 1│
  ◄─ WAIT (buffer full)   └──┴──┴──┴──┴──┘  request(n) ──►
                            capacity = 5
```

| Strategy | How it works |
|----------|-------------|
| **Block** | Producer waits until buffer has space (Go channels, Node.js streams) |
| **Drop** | Discard newest/oldest items when buffer is full (lossy, for metrics) |
| **Signal** | Consumer sends `request(n)` to pull exactly n items (Reactive Streams) |
| **Throttle** | Rate-limit the producer (token bucket / leaky bucket) |

## Production Proof

| Project | Source | Usage |
|---------|--------|-------|
| Node.js Streams | [writable.js#L548-L585](https://github.com/nodejs/node/blob/main/lib/internal/streams/writable.js#L548-L585) | `writeOrBuffer()` — L576 checks `state.length < state.highWaterMark`; when buffer exceeds the threshold, L579 sets `kNeedDrain` flag and L585 returns `false`, signaling the producer to pause until the `drain` event fires. |
| Reactive Streams | [Subscription.java#L14-L37](https://github.com/reactive-streams/reactive-streams-jvm/blob/master/api/src/main/java/org/reactivestreams/Subscription.java#L14-L37) | `request(long n)` (L29) — the consumer explicitly requests `n` items from the producer. "No events will be sent by a Publisher until demand is signaled via this method." Foundation of RxJava Flowable, Project Reactor, and Akka Streams. |

## Implementation

::: code-group

```typescript [TypeScript]
class BoundedQueue<T> {
  private buffer: T[] = [];
  private pushWaiters: Array<() => void> = [];
  private pullWaiters: Array<(value: T) => void> = [];

  constructor(private capacity: number) {}

  async push(item: T): Promise<void> {
    if (this.pullWaiters.length > 0) {
      this.pullWaiters.shift()!(item);
      return;
    }
    if (this.buffer.length >= this.capacity) {
      await new Promise<void>((r) => this.pushWaiters.push(r));
    }
    this.buffer.push(item);
  }

  async pull(): Promise<T> {
    if (this.buffer.length > 0) {
      const item = this.buffer.shift()!;
      if (this.pushWaiters.length > 0) this.pushWaiters.shift()!();
      return item;
    }
    return new Promise<T>((r) => this.pullWaiters.push(r));
  }
}
```

```go [Go]
// Go: bounded channels provide backpressure natively
func producer(ch chan<- int) {
	for i := 0; ; i++ {
		ch <- i // blocks when channel is full
	}
}

func consumer(ch <-chan int) {
	for v := range ch {
		fmt.Println(v) // process at consumer's pace
	}
}

func Run() {
	ch := make(chan int, 10) // bounded buffer of 10
	go producer(ch)
	consumer(ch)
}
```

```python [Python]
import asyncio

async def producer(queue: asyncio.Queue[int]):
    for i in range(100):
        await queue.put(i)  # blocks when queue is full

async def consumer(queue: asyncio.Queue[int]):
    while True:
        item = await queue.get()  # blocks when queue is empty
        await asyncio.sleep(0.1)  # simulate slow processing

async def main():
    queue: asyncio.Queue[int] = asyncio.Queue(maxsize=5)  # bounded
    await asyncio.gather(producer(queue), consumer(queue))
```

```rust [Rust]
use std::sync::{Arc, Mutex, Condvar};

pub struct BoundedQueue<T> {
    data: Mutex<Vec<T>>,
    capacity: usize,
    not_full: Condvar,
    not_empty: Condvar,
}

impl<T> BoundedQueue<T> {
    pub fn new(capacity: usize) -> Self {
        BoundedQueue {
            data: Mutex::new(Vec::new()),
            capacity,
            not_full: Condvar::new(),
            not_empty: Condvar::new(),
        }
    }

    pub fn push(&self, item: T) {
        let mut buf = self.data.lock().unwrap();
        while buf.len() >= self.capacity {
            buf = self.not_full.wait(buf).unwrap();
        }
        buf.push(item);
        self.not_empty.notify_one();
    }

    pub fn pull(&self) -> T {
        let mut buf = self.data.lock().unwrap();
        while buf.is_empty() {
            buf = self.not_empty.wait(buf).unwrap();
        }
        let item = buf.remove(0);
        self.not_full.notify_one();
        item
    }
}
```

:::

## Exercises

| Level | Exercise | File |
|-------|----------|------|
| Basic | Implement a bounded async queue with flow control | `exercises/typescript/backpressure/01-basic.test.ts` |

Run exercises: `pnpm test`

## When to Use

- **Stream processing** — prevent fast data sources from overwhelming processors
- **Microservices** — protect downstream services from overload
- **I/O pipelines** — disk reads faster than network writes (or vice versa)
- **Event-driven systems** — producers fire events faster than handlers can process

## When NOT to Use

- **Lossy is acceptable** — if dropping data is fine (metrics, sampling), just drop without blocking
- **Single-speed systems** — if producer and consumer run at the same speed, backpressure adds unnecessary complexity
- **Fire-and-forget** — if the producer doesn't need to wait, use an unbounded queue with monitoring
- **Real-time constraints** — blocking the producer may violate latency SLAs

## More Production Uses

- [RxJava Flowable](https://github.com/ReactiveX/RxJava) — backpressure-aware reactive streams
- [Kafka](https://github.com/apache/kafka) — producer `buffer.memory` and `max.block.ms` for flow control
- [Linux TCP](https://github.com/torvalds/linux/blob/master/net/ipv4/tcp_output.c) — congestion window (`cwnd`) as backpressure
- [gRPC](https://github.com/grpc/grpc) — flow control windows in HTTP/2
