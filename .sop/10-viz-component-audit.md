# SOP 10: Interactive Viz Component Audit Checklist

## Trigger

- When creating or modifying any `*Viz.vue` component
- When reviewing interactive visualization components
- Before pushing changes that touch component logic

## Background

Full audit of 48 interactive components (June 2026) uncovered 11 bugs across these categories. This SOP codifies the patterns found to prevent recurrence.

## Category 1: Empty/Initial State Rendering

### The Problem

SVG elements or containers render visually even when their data is empty, showing ghost boxes, zero-width rects, or stale placeholder nodes.

### Example (BPlusTreeViz)

Empty root node rect was visible when tree had no keys.

**Fix:** Guard rendering with `v-show` or `v-if`:

```html
<!-- Bad: always renders the rect -->
<g v-for="ln in allLayoutNodes" :key="ln.node.id">
  <rect ... />
</g>

<!-- Good: hide empty nodes -->
<g v-for="ln in allLayoutNodes" v-show="ln.node.keys.length > 0" :key="ln.node.id">
  <rect ... />
</g>
```

### Audit Check

For every SVG/DOM element rendered from data: does it look correct when the data source is empty or at initial state?

## Category 2: Reactive Watchers for Dynamic Parameters

### The Problem

Slider/input values that control timer intervals don't take effect until the next start/stop cycle, because the interval was set once and never updated.

### Example (BackpressureViz)

Producer/consumer rate sliders had no `watch()` — changing rate while running had no effect.

**Fix:** Watch the rate and restart the interval:

```ts
watch(producerRate, () => {
  if (producerActive.value) {
    if (producerTimerId !== null) clearInterval(producerTimerId);
    producerTimerId = safeInterval(producerTick, 1000 / producerRate.value);
  }
});
```

### Audit Check

For every slider/input that controls timing or rate: does changing it while running take effect immediately?

## Category 3: Snapshot-Before-Mutation

### The Problem

Reading a computed value or state AFTER mutating the source it depends on yields stale or incorrect values.

### Example A (BatchProcessingViz)

Buffer was modified in-place during flush, causing an early return before the batch was recorded.

**Fix:** Snapshot the data, then clear the source:

```ts
// Bad: modifying buffer while iterating
function flush() {
  buffer.value.forEach(item => { ... });
  buffer.value = [];
}

// Good: snapshot then clear
function flush() {
  const items = [...buffer.value];
  buffer.value = [];
  // process items snapshot
}
```

### Example B (MergeIteratorViz)

`activeHeadCount` was computed after position was already mutated, showing wrong "remaining streams" count.

**Fix:** Capture derived values before the mutation that changes them:

```ts
const activeHeadCount = computeActiveHeads(); // capture BEFORE
pos[minIdx]++;                                // mutate AFTER
message.value = `... ${activeHeadCount} streams remaining`;
```

### Audit Check

For every message/display that references state: is the value captured before or after the mutation it reports on?

## Category 4: Preset Scenario Logic

### The Problem

Preset/demo scenarios must demonstrate the concept correctly. Logic errors in presets directly mislead users.

### Example A (BackpressureViz)

"Burst" preset started producer but never started consumer — the demo showed a broken scenario.

**Fix:** Use `safeTimeout` to start the consumer after a delay:

```ts
safeTimeout(() => {
  if (!presetRunning) return;
  startConsumer();
}, 2000);
```

### Example B (LogicalClockViz)

Preset clock values were incorrect (e.g., showing clock=3 when the algorithm should yield clock=5).

**Fix:** Manually trace through the algorithm to verify every preset value.

### Audit Check

For every preset scenario: run it mentally step by step. Does each intermediate state match what the algorithm would actually produce?

## Category 5: Message/Formula Accuracy

### The Problem

Status messages display calculated values (ratios, counts, formulas) that don't match the actual state or algorithm.

### Examples Found

| Component | Bug | Fix |
|-----------|-----|-----|
| MiddlewareChainViz | Auth reject message showed wrong text | Corrected message string |
| RetryBackoffViz | Delay formula in message didn't match actual calculation | Aligned formula with code |
| SemaphoreViz | Progress bar used hardcoded duration instead of actual randomized value | Used actual duration variable |
| TrieViz | Character count and compression ratio were wrong | Fixed calculation logic |

### Audit Check

For every status message that includes a number or formula: verify it matches the actual variable/computation in the code, not a hardcoded approximation.

## Category 6: Per-Entity Timer Lifecycle

### The Problem

When entities (pool objects, connections, etc.) have their own timers, the timer ID must be stored per-entity so it can be individually cancelled.

### Example (ObjectPoolViz)

Pool objects had auto-release timers but no `timerId` field — individual objects couldn't cancel their timer on early release.

**Fix:** Add a timer field to the entity:

```ts
interface PoolObject {
  id: number;
  state: 'free' | 'in-use';
  timerId: ReturnType<typeof setTimeout> | null;  // per-object timer
}
```

### Audit Check

If entities have individual timed behaviors (auto-release, expiry, cooldown): is the timer stored per-entity and properly cancelled on state change?

## Category 7: Recovery/Rebuild Logic

### The Problem

Recovery or rebuild operations must use the correct subset of data. Using "all entries" instead of "committed/flushed entries" breaks the semantic correctness.

### Example (WriteAheadLogViz)

Crash recovery rebuilt state from ALL WAL entries instead of only flushed entries. Unflushed entries should be replayed, not treated as committed.

### Audit Check

For any operation that reconstructs state (crash recovery, checkpoint restore, compaction): verify it uses the correct subset of data entries (flushed vs. pending, committed vs. uncommitted).

## Full Component Audit Checklist

When auditing a `*Viz.vue` component, check ALL of the following:

- [ ] **Timer patterns**: Uses `useVizTimers` composable (`safeTimeout`/`safeInterval`/`delay`)
- [ ] **Reset cleanup**: `reset()` calls `clearAll()` and resets all state
- [ ] **Preset guards**: Every preset has `if (presetRunning) return;` guard at entry
- [ ] **Abort checks**: Every `await delay()` is followed by `if (isAborted()) return;`
- [ ] **Preset loops**: Every loop body has `if (!presetRunning || isAborted()) return;`
- [ ] **Empty state**: SVG/DOM renders correctly when data is empty
- [ ] **Reactive controls**: Sliders/inputs that control timing are watched for live updates
- [ ] **Snapshot order**: State is captured before mutations it reports on
- [ ] **Preset correctness**: Each preset's values trace correctly through the algorithm
- [ ] **Message accuracy**: All displayed numbers/formulas match actual code computations
- [ ] **Per-entity timers**: Individual entity timers stored and cancellable
- [ ] **Recovery correctness**: Rebuild operations use correct data subset
