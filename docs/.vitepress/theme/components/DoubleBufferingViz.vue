<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const COLS = 4;
const ROWS = 3;
const CELL_COUNT = COLS * ROWS;

const PALETTE = [
  'var(--viz-primary)',
  'var(--viz-success)',
  'var(--viz-warning)',
  'var(--viz-danger)',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

type BufferData = (string | null)[];

function emptyBuffer(): BufferData {
  return Array(CELL_COUNT).fill(null);
}

/** Generate a frame pattern — cycles through simple shapes */
function generateFrame(frame: number): BufferData {
  const buf: BufferData = Array(CELL_COUNT).fill(null);
  const pattern = frame % 5;

  if (pattern === 0) {
    // Diagonal
    for (let i = 0; i < Math.min(ROWS, COLS); i++) {
      buf[i * COLS + i] = PALETTE[frame % PALETTE.length];
    }
  } else if (pattern === 1) {
    // Top and bottom rows
    for (let c = 0; c < COLS; c++) {
      buf[c] = PALETTE[(frame + 1) % PALETTE.length];
      buf[(ROWS - 1) * COLS + c] = PALETTE[(frame + 2) % PALETTE.length];
    }
  } else if (pattern === 2) {
    // Checkerboard
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if ((r + c) % 2 === 0) {
          buf[r * COLS + c] = PALETTE[(frame + r) % PALETTE.length];
        }
      }
    }
  } else if (pattern === 3) {
    // Border
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
          buf[r * COLS + c] = PALETTE[(frame + c) % PALETTE.length];
        }
      }
    }
  } else {
    // Columns sweep
    const col = frame % COLS;
    for (let r = 0; r < ROWS; r++) {
      buf[r * COLS + col] = PALETTE[(frame + r) % PALETTE.length];
    }
  }

  return buf;
}

const frontBuffer = ref<BufferData>(emptyBuffer());
const backBuffer = ref<BufferData>(emptyBuffer());
const frameCount = ref(0);
const nextFrame = ref(1);
const swapping = ref(false);
const autoMode = ref(false);
const message = ref('Draw a frame in the back buffer, then swap to display it');

let autoTimer: ReturnType<typeof setInterval> | null = null;

function drawFrame() {
  const frame = nextFrame.value++;
  backBuffer.value = generateFrame(frame);
  frameCount.value++;
  message.value = `Frame #${frameCount.value} drawn in back buffer`;
}

function swapBuffers() {
  if (swapping.value) return;
  swapping.value = true;

  setTimeout(() => {
    const temp = frontBuffer.value;
    frontBuffer.value = backBuffer.value;
    backBuffer.value = temp;
    swapping.value = false;
    message.value = `Buffers swapped — frame now visible on front buffer`;
  }, 300);
}

function toggleAuto() {
  autoMode.value = !autoMode.value;
  if (autoMode.value) {
    message.value = 'Auto mode: drawing + swapping every 500ms';
    autoTimer = setInterval(() => {
      drawFrame();
      setTimeout(() => swapBuffers(), 200);
    }, 500);
  } else {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    message.value = 'Auto mode stopped';
  }
}

function reset() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  autoMode.value = false;
  frontBuffer.value = emptyBuffer();
  backBuffer.value = emptyBuffer();
  frameCount.value = 0;
  nextFrame.value = 1;
  swapping.value = false;
  message.value = 'Reset! Draw a frame to start.';
}

onUnmounted(() => {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
});
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">Interactive Double Buffering</div>

    <div class="db-layout" :class="{ 'db-swapping': swapping }">
      <!-- Front Buffer -->
      <div class="db-buffer">
        <div class="db-buffer-label">
          <span class="db-dot db-dot--front"></span>
          Front Buffer (Display)
        </div>
        <div class="db-grid">
          <div
            v-for="(color, i) in frontBuffer"
            :key="'f-' + i"
            class="db-cell"
            :class="{ 'db-cell--filled': color }"
            :style="color ? { backgroundColor: color } : {}"
          />
        </div>
        <div class="db-badge db-badge--active">VISIBLE</div>
      </div>

      <!-- Swap Arrow -->
      <div class="db-swap-arrow" :class="{ 'db-swap-arrow--animating': swapping }">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path
            d="M8 18h24l-8-8"
            fill="none"
            stroke="var(--viz-primary)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M40 30H16l8 8"
            fill="none"
            stroke="var(--viz-success)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Back Buffer -->
      <div class="db-buffer">
        <div class="db-buffer-label">
          <span class="db-dot db-dot--back"></span>
          Back Buffer (Drawing)
        </div>
        <div class="db-grid">
          <div
            v-for="(color, i) in backBuffer"
            :key="'b-' + i"
            class="db-cell"
            :class="{ 'db-cell--filled': color }"
            :style="color ? { backgroundColor: color } : {}"
          />
        </div>
        <div class="db-badge db-badge--drawing">DRAWING</div>
      </div>
    </div>

    <div class="db-frame-counter">
      Frame: <span class="db-frame-number">{{ frameCount }}</span>
    </div>

    <div class="viz-controls">
      <button class="viz-btn" :disabled="autoMode" @click="drawFrame">Draw Frame</button>
      <button class="viz-btn viz-btn--primary" :disabled="autoMode || swapping" @click="swapBuffers">Swap</button>
      <button
        class="viz-btn"
        :class="{ 'db-btn--auto-active': autoMode }"
        @click="toggleAuto"
      >
        {{ autoMode ? 'Stop Auto' : 'Auto' }}
      </button>
      <button class="viz-btn viz-btn--danger" @click="reset">Reset</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.db-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  transition: opacity 0.3s ease;
}

.db-buffer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid var(--viz-border);
  border-radius: var(--viz-radius);
  background: var(--vp-c-bg);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.db-swapping .db-buffer {
  animation: db-buffer-flash 0.3s ease;
}

.db-buffer-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--viz-text);
  white-space: nowrap;
}

.db-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.db-dot--front {
  background: var(--viz-success);
}

.db-dot--back {
  background: var(--viz-warning);
}

.db-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
}

.db-cell {
  width: 36px;
  height: 28px;
  border-radius: 4px;
  background: var(--viz-cell-empty);
  transition: background-color 0.25s ease, transform 0.2s ease;
}

.db-cell--filled {
  animation: db-cell-appear 0.3s ease;
}

.db-badge {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.db-badge--active {
  background: var(--viz-success);
  color: #fff;
}

.db-badge--drawing {
  background: var(--viz-warning);
  color: #fff;
}

.db-swap-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.2s ease, transform 0.3s ease;
}

.db-swap-arrow--animating {
  opacity: 1;
  animation: db-arrow-pulse 0.3s ease;
}

.db-frame-counter {
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--viz-muted);
  font-family: var(--vp-font-family-mono);
}

.db-frame-number {
  font-weight: 700;
  color: var(--viz-primary);
  font-size: 1rem;
}

.db-btn--auto-active {
  background: var(--viz-success);
  border-color: var(--viz-success);
  color: #fff;
}

.db-btn--auto-active:hover {
  opacity: 0.9;
  color: #fff;
}

.viz-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.viz-btn:disabled:hover {
  border-color: var(--viz-border);
  color: var(--viz-text);
  transform: none;
}

@keyframes db-cell-appear {
  0% { transform: scale(0.7); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes db-buffer-flash {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); }
}

@keyframes db-arrow-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@media (max-width: 640px) {
  .db-layout {
    flex-direction: column;
  }

  .db-swap-arrow {
    transform: rotate(90deg);
  }

  .db-swap-arrow--animating {
    animation: db-arrow-pulse-mobile 0.3s ease;
  }

  .db-cell {
    width: 32px;
    height: 24px;
  }
}

@keyframes db-arrow-pulse-mobile {
  0%, 100% { transform: rotate(90deg) scale(1); }
  50% { transform: rotate(90deg) scale(1.2); }
}
</style>
