<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

interface Attempt {
  number: number;
  delay: number;
  jitter: number;
  totalDelay: number;
  result: 'pending' | 'waiting' | 'success' | 'fail';
}

const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

const failureRate = ref(70);
const running = ref(false);
const attempts = ref<Attempt[]>([]);
const message = ref('Configure failure rate and click "Send Request" to begin');
const finalOutcome = ref<'idle' | 'success' | 'exhausted'>('idle');
const activeTimers = ref<ReturnType<typeof setTimeout>[]>([]);

const maxPossibleDelay = computed(() => {
  let total = 0;
  for (let i = 0; i < MAX_RETRIES; i++) {
    total += BASE_DELAY * Math.pow(2, i);
  }
  return total;
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    activeTimers.value.push(id);
  });
}

function addJitter(baseDelay: number): { jitter: number; total: number } {
  const maxJitter = baseDelay * 0.3;
  const jitter = Math.round((Math.random() * 2 - 1) * maxJitter);
  return { jitter, total: Math.max(50, baseDelay + jitter) };
}

function simulateCall(): boolean {
  return Math.random() * 100 >= failureRate.value;
}

async function startRequest() {
  if (running.value) return;

  running.value = true;
  attempts.value = [];
  finalOutcome.value = 'idle';
  message.value = 'Sending initial request...';

  for (let i = 0; i < MAX_RETRIES; i++) {
    const attemptDelay = i === 0 ? 0 : BASE_DELAY * Math.pow(2, i - 1);
    const { jitter, total: totalDelay } = i === 0
      ? { jitter: 0, total: 0 }
      : addJitter(attemptDelay);

    const attempt: Attempt = {
      number: i + 1,
      delay: attemptDelay,
      jitter,
      totalDelay,
      result: i === 0 ? 'pending' : 'waiting',
    };
    attempts.value.push(attempt);

    if (i > 0) {
      message.value = `Waiting ${totalDelay}ms before attempt #${i + 1} (${attemptDelay}ms + ${jitter >= 0 ? '+' : ''}${jitter}ms jitter)...`;
      const scaledDelay = Math.min(totalDelay / 2, 1500);
      await delay(scaledDelay);
      if (!running.value) return;
    }

    attempts.value[i].result = 'pending';
    message.value = `Attempt #${i + 1} — sending request...`;
    await delay(300);
    if (!running.value) return;

    const success = simulateCall();

    if (success) {
      attempts.value[i].result = 'success';
      finalOutcome.value = 'success';
      message.value = `Success on attempt #${i + 1}!${i > 0 ? ` (after ${i} ${i === 1 ? 'retry' : 'retries'})` : ' (first try)'}`;
      running.value = false;
      return;
    }

    attempts.value[i].result = 'fail';
    if (i === MAX_RETRIES - 1) {
      finalOutcome.value = 'exhausted';
      message.value = `All ${MAX_RETRIES} attempts failed — retries exhausted!`;
    }
  }

  running.value = false;
}

function reset() {
  running.value = false;
  activeTimers.value.forEach(clearTimeout);
  activeTimers.value = [];
  attempts.value = [];
  finalOutcome.value = 'idle';
  message.value = 'Configure failure rate and click "Send Request" to begin';
}

const timelineTotalMs = computed(() => {
  if (attempts.value.length === 0) return 0;
  let sum = 0;
  for (const a of attempts.value) {
    sum += a.totalDelay;
  }
  return sum;
});

function barWidth(attempt: Attempt): string {
  if (attempt.totalDelay === 0 || maxPossibleDelay.value === 0) return '2%';
  const pct = (attempt.totalDelay / maxPossibleDelay.value) * 100;
  return `${Math.max(2, Math.min(pct, 100))}%`;
}

function barColor(result: Attempt['result']): string {
  switch (result) {
    case 'success': return 'var(--viz-success)';
    case 'fail': return 'var(--viz-danger)';
    case 'waiting': return 'var(--viz-warning)';
    case 'pending': return 'var(--viz-primary)';
  }
}

function resultLabel(result: Attempt['result']): string {
  switch (result) {
    case 'success': return 'OK';
    case 'fail': return 'FAIL';
    case 'waiting': return 'WAIT';
    case 'pending': return '...';
  }
}

const statusBorderColor = computed(() => {
  switch (finalOutcome.value) {
    case 'success': return 'var(--viz-success)';
    case 'exhausted': return 'var(--viz-danger)';
    default: return running.value ? 'var(--viz-warning)' : 'var(--viz-border)';
  }
});

onUnmounted(() => {
  activeTimers.value.forEach(clearTimeout);
});
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">Interactive Retry with Backoff</div>

    <!-- Failure rate slider -->
    <div class="rb-config">
      <label class="rb-slider-label">
        <span class="viz-label">Failure Rate:</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          v-model.number="failureRate"
          :disabled="running"
          class="rb-slider"
        />
        <span class="rb-slider-value">{{ failureRate }}%</span>
      </label>
      <div class="rb-config-info">
        <span class="viz-label">Base delay: {{ BASE_DELAY / 1000 }}s</span>
        <span class="viz-label">Max retries: {{ MAX_RETRIES }}</span>
      </div>
    </div>

    <!-- Formula display -->
    <div class="rb-formula">
      delay = min(base &times; 2<sup>attempt</sup>, cap) &plusmn; random jitter
    </div>

    <!-- Attempt timeline -->
    <div v-if="attempts.length" class="rb-timeline">
      <div
        v-for="attempt in attempts"
        :key="attempt.number"
        class="rb-attempt"
        :class="{
          'rb-attempt--success': attempt.result === 'success',
          'rb-attempt--fail': attempt.result === 'fail',
          'rb-attempt--waiting': attempt.result === 'waiting',
          'rb-attempt--pending': attempt.result === 'pending',
        }"
      >
        <div class="rb-attempt-header">
          <span class="rb-attempt-num">#{{ attempt.number }}</span>
          <span
            class="rb-attempt-badge"
            :style="{ background: barColor(attempt.result) }"
          >{{ resultLabel(attempt.result) }}</span>
        </div>

        <!-- Delay bar -->
        <div class="rb-bar-track">
          <div
            class="rb-bar-fill"
            :style="{
              width: barWidth(attempt),
              background: barColor(attempt.result),
            }"
          ></div>
        </div>

        <div class="rb-attempt-detail">
          <span v-if="attempt.number === 1" class="viz-label">No delay (first attempt)</span>
          <span v-else class="viz-label">
            {{ attempt.delay }}ms
            <span class="rb-jitter">{{ attempt.jitter >= 0 ? '+' : '' }}{{ attempt.jitter }}ms jitter</span>
            = {{ attempt.totalDelay }}ms
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="rb-empty">
      <svg viewBox="0 0 200 80" class="rb-empty-svg">
        <text x="100" y="20" text-anchor="middle" fill="var(--viz-muted)" font-size="11">Retry timeline will appear here</text>
        <g v-for="i in 5" :key="i">
          <rect
            :x="10 + (i - 1) * 38"
            y="35"
            width="32"
            height="8"
            rx="3"
            fill="var(--viz-cell-empty)"
            opacity="0.5"
          />
          <text
            :x="26 + (i - 1) * 38"
            y="58"
            text-anchor="middle"
            fill="var(--viz-muted)"
            font-size="8"
          >#{{ i }}</text>
        </g>
      </svg>
    </div>

    <!-- Summary -->
    <div v-if="attempts.length && !running" class="rb-summary">
      <span class="viz-label">
        Total attempts: {{ attempts.length }} |
        Total wait: {{ timelineTotalMs }}ms |
        Outcome:
        <strong :style="{ color: finalOutcome === 'success' ? 'var(--viz-success)' : 'var(--viz-danger)' }">
          {{ finalOutcome === 'success' ? 'Succeeded' : 'Exhausted' }}
        </strong>
      </span>
    </div>

    <!-- Controls -->
    <div class="viz-controls">
      <button
        class="viz-btn viz-btn--primary"
        @click="startRequest"
        :disabled="running"
      >
        {{ running ? 'Running...' : 'Send Request' }}
      </button>
      <button class="viz-btn viz-btn--danger" @click="reset">Reset</button>
    </div>

    <div class="viz-status" :style="{ borderLeft: `3px solid ${statusBorderColor}` }">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.rb-config {
  margin-bottom: 0.75rem;
}

.rb-slider-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rb-slider {
  flex: 1;
  max-width: 200px;
  height: 4px;
  accent-color: var(--viz-primary);
  cursor: pointer;
}

.rb-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rb-slider-value {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--viz-text);
  min-width: 3rem;
}

.rb-config-info {
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
}

.rb-formula {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  color: var(--viz-muted);
  background: var(--vp-c-bg);
  border: 1px solid var(--viz-border);
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
}

.rb-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.rb-attempt {
  border: 1px solid var(--viz-border);
  border-radius: 6px;
  padding: 0.5rem 0.625rem;
  background: var(--vp-c-bg);
  animation: rb-slide-in 0.3s ease;
}

.rb-attempt--success {
  border-color: var(--viz-success);
}

.rb-attempt--fail {
  border-color: var(--viz-danger);
}

.rb-attempt--waiting {
  border-color: var(--viz-warning);
  animation: rb-pulse 1s ease infinite;
}

.rb-attempt--pending {
  border-color: var(--viz-primary);
  animation: rb-pulse 0.6s ease infinite;
}

.rb-attempt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.375rem;
}

.rb-attempt-num {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--viz-text);
}

.rb-attempt-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #fff;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  letter-spacing: 0.03em;
}

.rb-bar-track {
  height: 6px;
  background: var(--viz-cell-empty);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.rb-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.rb-attempt-detail {
  display: flex;
  align-items: center;
}

.rb-jitter {
  color: var(--viz-warning);
  font-weight: 600;
}

.rb-empty {
  text-align: center;
  padding: 0.5rem 0;
}

.rb-empty-svg {
  width: 100%;
  max-width: 280px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.rb-summary {
  padding: 0.375rem 0;
  border-top: 1px solid var(--viz-border);
  margin-top: 0.25rem;
}

@keyframes rb-slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rb-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
