---
title: "Patterns from Node.js Ecosystem"
description: "Node.js ecosystem patterns: observer (EventEmitter), backpressure (Streams), state machine (XState), and middleware chain (Koa)."
---

# Patterns from Node.js Ecosystem

Node.js, Redux, and XState demonstrate event-driven and state management patterns at scale.

| Pattern | Project | Where | What It Does |
|---------|---------|-------|--------------|
| [Observer / Pub-Sub](/patterns/observer/) | Node.js | [`lib/events.js`](https://github.com/nodejs/node/blob/19c46abbefdb8711b913d7237b3c1299367f87d7/lib/events.js#L456-L520) | `EventEmitter` — foundation of Node's event-driven architecture |
| [Observer / Pub-Sub](/patterns/observer/) | Redux | [`createStore.ts`](https://github.com/reduxjs/redux/blob/1d761f471cf58faabe88c50ea16645212d986cd0/src/createStore.ts#L211-L280) | `subscribe()` + `dispatch()` — state change notification |
| [State Machine](/patterns/state-machine/) | XState | [`StateMachine.ts`](https://github.com/statelyai/xstate/blob/9d9b9f1439b773979c5120a793215f5aa4568d8f/packages/core/src/StateMachine.ts#L58-L120) | Industry-standard finite state machine library |
| [Backpressure](/patterns/backpressure/) | Node.js | [`writable.js`](https://github.com/nodejs/node/blob/19c46abbefdb8711b913d7237b3c1299367f87d7/lib/internal/streams/writable.js#L548-L585) | `writeOrBuffer()` — `highWaterMark` + `drain` event flow control |
| [Iterator / Lazy Eval](/patterns/iterator/) | Node.js | [`lib/internal/streams/`](https://github.com/nodejs/node/tree/19c46abbefdb8711b913d7237b3c1299367f87d7/lib/internal/streams) | Async iterators for streams — `for await (const chunk of stream)` |
| [Retry Backoff](/patterns/retry-backoff/) | Node.js | [`dns`](https://github.com/nodejs/node/blob/19c46abbefdb8711b913d7237b3c1299367f87d7/lib/dns.js), [`http`](https://github.com/nodejs/node/blob/19c46abbefdb8711b913d7237b3c1299367f87d7/lib/http.js) | DNS resolution retry with exponential backoff |
| [Dependency Graph](/patterns/dependency-graph/) | pnpm | [`graph-sequencer`](https://github.com/pnpm/pnpm/blob/46fd26afc9926b4391636a851ae32493f9b2c9ff/deps/graph-sequencer/src/index.ts#L22-L125) | Topological sort of workspace packages for build order |
| [Rate Limiter](/patterns/rate-limiter/) | Express | [`express-rate-limit`](https://github.com/express-rate-limit/express-rate-limit) | Token bucket middleware for API rate limiting |
| [Circuit Breaker](/patterns/circuit-breaker/) | opossum | [`lib/circuit.js`](https://github.com/nodeshift/opossum/blob/506c3c056781c2cc5a6c175f46259172edc29859/lib/circuit.js) | Node.js circuit breaker for microservice resilience |
| [Event Loop](/patterns/event-loop/) | Node.js (libuv) | [`deps/uv/src/unix/core.c`](https://github.com/nodejs/node/blob/19c46abbefdb8711b913d7237b3c1299367f87d7/deps/uv/src/unix/core.c) | `uv_run()` — single-threaded I/O multiplexing via epoll/kqueue |
| [Middleware Chain](/patterns/middleware-chain/) | Koa.js | [`koa-compose`](https://github.com/koajs/compose/blob/9a2a426b32c614835b812ecb8de5af06c6c87f6f/index.js) | Compose middleware into an onion-model pipeline with `async/await` |

## How They Compose: An HTTP Request

When an Express/Koa server handles a request, patterns compose from the network layer through to the response:

<CompositionFlow variant="nodejs-request" />

The event loop is the foundation: everything runs on a single thread, and I/O never blocks. This is why Node.js can handle thousands of concurrent connections — each request uses patterns (middleware, observers, backpressure) rather than spawning threads.

## Further Reading

- [Node.js (GitHub)](https://github.com/nodejs/node) · [Redux (GitHub)](https://github.com/reduxjs/redux) · [XState (GitHub)](https://github.com/statelyai/xstate)
- [pnpm (GitHub)](https://github.com/pnpm/pnpm)
