# 模式：背压 / 流控 (Backpressure)

## 一句话

当消费者跟不上时减慢生产者——用有界缓冲区和需求信号防止资源耗尽。

## 核心思想

背压是一种流控机制，消费者通知生产者减速或停止。没有背压时，快速生产者会压垮慢速消费者，导致无限内存增长、消息丢失或系统崩溃。关键：**有界缓冲区** + **满时阻塞/通知**。

```text
  生产者                      有界缓冲区                  消费者
  ─────────                  ──────────────              ─────────
  emit(data) ──────────►  ┌──┬──┬──┬──┬──┐  ──────────►  process(data)
                          │ 5│ 4│ 3│ 2│ 1│
  ◄─ 等待 (缓冲满)        └──┴──┴──┴──┴──┘  request(n) ──►
                            capacity = 5
```

| 策略 | 工作方式 |
|------|---------|
| **阻塞** | 生产者等待直到缓冲区有空间（Go channel、Node.js streams） |
| **丢弃** | 缓冲满时丢弃最新/最旧项（有损，适用于指标） |
| **信号** | 消费者发送 `request(n)` 精确拉取 n 项（Reactive Streams） |
| **限流** | 限制生产者速率（令牌桶/漏桶） |

## 生产验证

| 项目 | 源码 | 用途 |
|------|------|------|
| Node.js Streams | [writable.js#L548-L585](https://github.com/nodejs/node/blob/main/lib/internal/streams/writable.js#L548-L585) | `writeOrBuffer()` — L576 检查 `state.length < state.highWaterMark`；缓冲区超过阈值时，L579 设置 `kNeedDrain` 标志，L585 返回 `false`，通知生产者暂停直到 `drain` 事件触发。 |
| Reactive Streams | [Subscription.java#L14-L37](https://github.com/reactive-streams/reactive-streams-jvm/blob/master/api/src/main/java/org/reactivestreams/Subscription.java#L14-L37) | `request(long n)`（L29）— 消费者显式从生产者请求 `n` 项。"在通过此方法发出需求信号之前，Publisher 不会发送任何事件。" 是 RxJava Flowable、Project Reactor 和 Akka Streams 的基础。 |

## 实现

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
// Go: 有界 channel 天然提供背压
func producer(ch chan<- int) {
	for i := 0; ; i++ {
		ch <- i // 满时阻塞
	}
}

func consumer(ch <-chan int) {
	for v := range ch {
		fmt.Println(v) // 按消费者速率处理
	}
}

func Run() {
	ch := make(chan int, 10) // 有界缓冲区，容量 10
	go producer(ch)
	consumer(ch)
}
```

```python [Python]
import asyncio

async def producer(queue: asyncio.Queue[int]):
    for i in range(100):
        await queue.put(i)  # 满时阻塞

async def consumer(queue: asyncio.Queue[int]):
    while True:
        item = await queue.get()  # 空时阻塞
        await asyncio.sleep(0.1)  # 模拟慢处理

async def main():
    queue: asyncio.Queue[int] = asyncio.Queue(maxsize=5)  # 有界
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

## 练习

| 难度 | 练习 | 文件 |
|------|------|------|
| 基础 | 实现带流控的有界异步队列 | `exercises/typescript/backpressure/01-basic.test.ts` |

## 何时使用

- **流处理** — 防止快速数据源压垮处理器
- **微服务** — 保护下游服务免受过载
- **I/O 管道** — 磁盘读取快于网络写入（或反之）
- **事件驱动系统** — 生产者触发事件快于处理器能处理的速度

## 何时不用

- **允许丢失** — 如果丢数据可以接受（指标、采样），直接丢弃无需阻塞
- **同速系统** — 如果生产者和消费者以相同速度运行，背压增加不必要的复杂度
- **发射后不管** — 如果生产者不需要等待，使用无界队列加监控
- **实时约束** — 阻塞生产者可能违反延迟 SLA

## 更多生产案例

- [RxJava Flowable](https://github.com/ReactiveX/RxJava) — 背压感知的响应式流
- [Kafka](https://github.com/apache/kafka) — 生产者 `buffer.memory` 和 `max.block.ms` 用于流控
- [Linux TCP](https://github.com/torvalds/linux/blob/master/net/ipv4/tcp_output.c) — 拥塞窗口（`cwnd`）作为背压
- [gRPC](https://github.com/grpc/grpc) — HTTP/2 中的流控窗口
