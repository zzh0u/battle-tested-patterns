<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

interface Worker {
  id: number;
  state: 'active' | 'waiting' | 'done';
  permitIndex: number;
  remainingMs: number;
}

const MAX_PERMITS = ref(3);
const workers = ref<Worker[]>([]);
const message = ref('Click "Acquire" to spawn a worker that claims a permit');
let nextId = 1;
const timers = ref<ReturnType<typeof setInterval>[]>([]);

const activeWorkers = computed(() =>
  workers.value.filter((w) => w.state === 'active'),
);
const waitingWorkers = computed(() =>
  workers.value.filter((w) => w.state === 'waiting'),
);
const availablePermits = computed(
  () => MAX_PERMITS.value - activeWorkers.value.length,
);

const permits = computed(() => {
  const slots: { taken: boolean; workerId: number | null }[] = [];
  for (let i = 0; i < MAX_PERMITS.value; i++) {
    const occupant = activeWorkers.value.find((w) => w.permitIndex === i);
    slots.push({
      taken: !!occupant,
      workerId: occupant ? occupant.id : null,
    });
  }
  return slots;
});

function findFreePermit(): number {
  for (let i = 0; i < MAX_PERMITS.value; i++) {
    if (!activeWorkers.value.some((w) => w.permitIndex === i)) return i;
  }
  return -1;
}

function tryPromoteWaiting() {
  const slot = findFreePermit();
  if (slot === -1) return;
  const next = waitingWorkers.value[0];
  if (!next) return;
  next.state = 'active';
  next.permitIndex = slot;
  next.remainingMs = randomDuration();
  message.value = `Worker #${next.id} acquired permit ${slot + 1} from queue`;
  startWorkerTimer(next);
}

function randomDuration(): number {
  return Math.floor(Math.random() * 2000) + 1000;
}

function startWorkerTimer(w: Worker) {
  const tick = 100;
  const timer = setInterval(() => {
    const target = workers.value.find((x) => x.id === w.id);
    if (!target || target.state !== 'active') {
      clearInterval(timer);
      return;
    }
    target.remainingMs = Math.max(0, target.remainingMs - tick);
    if (target.remainingMs <= 0) {
      clearInterval(timer);
      releaseWorker(target);
    }
  }, tick);
  timers.value.push(timer);
}

function releaseWorker(w: Worker) {
  message.value = `Worker #${w.id} released permit ${w.permitIndex + 1}`;
  w.state = 'done';
  workers.value = workers.value.filter((x) => x.id !== w.id);
  tryPromoteWaiting();
}

function acquire() {
  const id = nextId++;
  const slot = findFreePermit();
  if (slot !== -1) {
    const w: Worker = {
      id,
      state: 'active',
      permitIndex: slot,
      remainingMs: randomDuration(),
    };
    workers.value.push(w);
    message.value = `Worker #${id} acquired permit ${slot + 1}`;
    startWorkerTimer(w);
  } else {
    const w: Worker = {
      id,
      state: 'waiting',
      permitIndex: -1,
      remainingMs: 0,
    };
    workers.value.push(w);
    message.value = `No permits available — Worker #${id} is waiting in queue`;
  }
}

function reset() {
  timers.value.forEach((t) => clearInterval(t));
  timers.value = [];
  workers.value = [];
  nextId = 1;
  message.value = 'Reset — all workers cleared';
}

function permitColor(taken: boolean): string {
  return taken ? 'var(--viz-danger)' : 'var(--viz-success)';
}

function progressPercent(w: Worker): number {
  const total = 3000;
  return Math.max(0, Math.min(100, ((total - w.remainingMs) / total) * 100));
}

onUnmounted(() => {
  timers.value.forEach((t) => clearInterval(t));
});
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">Interactive Semaphore</div>

    <!-- Stats bar -->
    <div class="sem-stats">
      <span class="sem-stat">
        Active: <strong>{{ activeWorkers.length }}</strong>
      </span>
      <span class="sem-stat">
        Waiting: <strong>{{ waitingWorkers.length }}</strong>
      </span>
      <span class="sem-stat sem-stat--permits">
        Available: <strong>{{ availablePermits }}/{{ MAX_PERMITS }}</strong>
      </span>
    </div>

    <!-- SVG visualization -->
    <div class="sem-canvas">
      <svg
        :viewBox="`0 0 400 ${180 + Math.max(0, waitingWorkers.length - 1) * 34}`"
        class="sem-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Semaphore box -->
        <rect
          x="120" y="10"
          width="160" height="50"
          rx="8"
          fill="var(--vp-c-bg)"
          stroke="var(--viz-border)"
          stroke-width="1.5"
        />
        <text
          x="200" y="28"
          text-anchor="middle"
          class="sem-svg-label"
        >Semaphore ({{ MAX_PERMITS }})</text>

        <!-- Permit circles -->
        <g v-for="(p, i) in permits" :key="'p' + i">
          <circle
            :cx="200 + (i - (MAX_PERMITS - 1) / 2) * 36"
            cy="46"
            r="10"
            :fill="permitColor(p.taken)"
            :stroke="p.taken ? 'var(--viz-danger)' : 'var(--viz-success)'"
            stroke-width="1.5"
            :class="{ 'sem-permit-pulse': p.taken }"
          />
          <text
            v-if="p.workerId"
            :x="200 + (i - (MAX_PERMITS - 1) / 2) * 36"
            cy="50"
            text-anchor="middle"
            class="sem-svg-id"
          >#{{ p.workerId }}</text>
        </g>

        <!-- Active workers area -->
        <text
          x="200" y="86"
          text-anchor="middle"
          class="sem-svg-section"
        >Active Workers</text>

        <g v-for="(w, i) in activeWorkers" :key="'a' + w.id">
          <rect
            :x="200 + (i - (activeWorkers.length - 1) / 2) * 80 - 32"
            y="94"
            width="64" height="36"
            rx="6"
            fill="var(--vp-c-bg)"
            stroke="var(--viz-primary)"
            stroke-width="1.5"
            class="sem-worker-box"
          />
          <text
            :x="200 + (i - (activeWorkers.length - 1) / 2) * 80"
            y="109"
            text-anchor="middle"
            class="sem-svg-worker"
          >#{{ w.id }}</text>
          <!-- progress bar background -->
          <rect
            :x="200 + (i - (activeWorkers.length - 1) / 2) * 80 - 24"
            y="116"
            width="48" height="4"
            rx="2"
            fill="var(--viz-cell-empty)"
          />
          <!-- progress bar fill -->
          <rect
            :x="200 + (i - (activeWorkers.length - 1) / 2) * 80 - 24"
            y="116"
            :width="48 * progressPercent(w) / 100"
            height="4"
            rx="2"
            fill="var(--viz-primary)"
          />
        </g>

        <text
          v-if="activeWorkers.length === 0"
          x="200" y="116"
          text-anchor="middle"
          class="sem-svg-empty"
        >none</text>

        <!-- Waiting queue area -->
        <line
          x1="40" :y1="142"
          x2="360" :y2="142"
          stroke="var(--viz-border)"
          stroke-width="1"
          stroke-dasharray="4 3"
        />
        <text
          x="200" :y="160"
          text-anchor="middle"
          class="sem-svg-section"
        >Waiting Queue</text>

        <g v-for="(w, i) in waitingWorkers" :key="'w' + w.id">
          <rect
            :x="148"
            :y="168 + i * 34"
            width="104" height="28"
            rx="6"
            fill="var(--vp-c-bg)"
            stroke="var(--viz-warning)"
            stroke-width="1.5"
            stroke-dasharray="4 2"
            class="sem-waiting-box"
          />
          <text
            x="200"
            :y="186 + i * 34"
            text-anchor="middle"
            class="sem-svg-worker sem-svg-waiting"
          >#{{ w.id }} waiting...</text>
        </g>

        <text
          v-if="waitingWorkers.length === 0"
          x="200" :y="182"
          text-anchor="middle"
          class="sem-svg-empty"
        >empty</text>
      </svg>
    </div>

    <!-- Controls -->
    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="acquire">
        Acquire
      </button>
      <button class="viz-btn viz-btn--danger" @click="reset">
        Reset
      </button>
      <label class="sem-permit-label">
        <span class="viz-label">Max permits</span>
        <select v-model.number="MAX_PERMITS" class="sem-select" @change="reset">
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
          <option :value="4">4</option>
          <option :value="5">5</option>
        </select>
      </label>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.sem-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.sem-stat {
  font-size: 0.75rem;
  color: var(--viz-text);
  font-family: var(--vp-font-family-mono);
}

.sem-stat--permits {
  color: var(--viz-success);
}

.sem-canvas {
  display: flex;
  justify-content: center;
  padding: 0.25rem 0;
}

.sem-svg {
  width: 100%;
  max-width: 420px;
  height: auto;
}

.sem-svg-label {
  font-size: 11px;
  font-weight: 600;
  fill: var(--viz-text);
  font-family: var(--vp-font-family-mono);
}

.sem-svg-section {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  fill: var(--viz-muted);
}

.sem-svg-id {
  font-size: 8px;
  font-weight: 700;
  fill: #fff;
  font-family: var(--vp-font-family-mono);
}

.sem-svg-worker {
  font-size: 10px;
  font-weight: 600;
  fill: var(--viz-text);
  font-family: var(--vp-font-family-mono);
}

.sem-svg-waiting {
  fill: var(--viz-warning);
}

.sem-svg-empty {
  font-size: 10px;
  fill: var(--viz-muted);
  font-style: italic;
}

.sem-worker-box {
  animation: sem-appear 0.2s ease;
}

.sem-waiting-box {
  animation: sem-appear 0.2s ease;
}

.sem-permit-pulse {
  animation: sem-pulse 1.5s ease-in-out infinite;
}

.sem-permit-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: auto;
}

.sem-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--viz-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--viz-text);
  font-size: 0.8125rem;
  font-family: var(--vp-font-family-mono);
  cursor: pointer;
}

@keyframes sem-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes sem-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@media (max-width: 640px) {
  .sem-stats {
    gap: 0.5rem;
  }

  .sem-stat {
    font-size: 0.7rem;
  }

  .sem-svg {
    max-width: 100%;
  }

  .sem-permit-label {
    margin-left: 0;
    margin-top: 0.25rem;
  }
}
</style>
