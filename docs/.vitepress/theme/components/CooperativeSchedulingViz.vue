<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

const TOTAL_UNITS = 20;
const CHUNK_SIZE = 4;
const TICK_MS = 150;

const cooperative = ref(false);
const running = ref(false);
const progress = ref(0);
const blocked = ref(false);
const yieldGap = ref(false);
const ballY = ref(0);
const ballDir = ref(1);
const ballAnimating = ref(true);
const timeline = ref<Array<{ type: 'work' | 'yield' | 'idle'; chunk: number }>>([]);
const message = ref(t('Toggle mode and click "Start Long Task" to compare blocking vs cooperative', '切换模式并点击"启动长任务"来对比阻塞与协作调度'));

let workTimer: ReturnType<typeof setTimeout> | null = null;
let ballTimer: ReturnType<typeof setInterval> | null = null;

function startBallAnimation() {
  if (ballTimer) return;
  ballTimer = setInterval(() => {
    if (!ballAnimating.value) return;
    ballY.value += ballDir.value * 3;
    if (ballY.value >= 40) { ballY.value = 40; ballDir.value = -1; }
    if (ballY.value <= 0) { ballY.value = 0; ballDir.value = 1; }
  }, 30);
}

startBallAnimation();

function stopBallAnimation() {
  if (ballTimer) {
    clearInterval(ballTimer);
    ballTimer = null;
  }
}

onUnmounted(() => {
  stopBallAnimation();
  if (workTimer) clearTimeout(workTimer);
});

function startTask() {
  if (running.value) return;
  running.value = true;
  progress.value = 0;
  timeline.value = [];
  blocked.value = false;
  yieldGap.value = false;

  if (cooperative.value) {
    runCooperative(0);
  } else {
    runBlocking();
  }
}

function runBlocking() {
  blocked.value = true;
  ballAnimating.value = false;
  message.value = t('BLOCKING: Main thread is frozen! UI cannot update (ball stops)', '阻塞中：主线程被冻结！UI 无法更新（球停止）');

  let done = 0;
  function tick() {
    if (done >= TOTAL_UNITS) {
      blocked.value = false;
      ballAnimating.value = true;
      running.value = false;
      message.value = t(`Done! All ${TOTAL_UNITS} units processed in one blocking run. UI was frozen the entire time.`, `完成！所有 ${TOTAL_UNITS} 个单元在一次阻塞运行中处理完毕。UI 全程冻结。`);
      return;
    }
    done++;
    progress.value = done;
    timeline.value = [...timeline.value, { type: 'work', chunk: 0 }];
    workTimer = setTimeout(tick, TICK_MS);
  }
  tick();
}

function runCooperative(startUnit: number) {
  const chunkNum = Math.floor(startUnit / CHUNK_SIZE);
  blocked.value = false;
  ballAnimating.value = true;
  yieldGap.value = false;

  let done = startUnit;
  const chunkEnd = Math.min(startUnit + CHUNK_SIZE, TOTAL_UNITS);

  message.value = t(`Chunk ${chunkNum + 1}: processing units ${startUnit + 1}-${chunkEnd} of ${TOTAL_UNITS}`, `分块 ${chunkNum + 1}：正在处理第 ${startUnit + 1}-${chunkEnd} 个单元（共 ${TOTAL_UNITS} 个）`);

  function tick() {
    if (done >= chunkEnd) {
      // Chunk done, yield
      if (done >= TOTAL_UNITS) {
        running.value = false;
        ballAnimating.value = true;
        message.value = t(`Done! ${TOTAL_UNITS} units in ${Math.ceil(TOTAL_UNITS / CHUNK_SIZE)} chunks. UI stayed responsive throughout!`, `完成！${TOTAL_UNITS} 个单元分 ${Math.ceil(TOTAL_UNITS / CHUNK_SIZE)} 块处理。UI 全程保持响应！`);
        return;
      }
      // Yield gap
      yieldGap.value = true;
      ballAnimating.value = true;
      timeline.value = [...timeline.value, { type: 'yield', chunk: chunkNum }];
      message.value = t('Yielding... UI can update (ball bounces). Next chunk starts shortly.', '让出中...UI 可以更新（球在跳动）。下一块即将开始。');
      workTimer = setTimeout(() => {
        yieldGap.value = false;
        runCooperative(done);
      }, TICK_MS * 3);
      return;
    }
    done++;
    progress.value = done;
    timeline.value = [...timeline.value, { type: 'work', chunk: chunkNum }];
    workTimer = setTimeout(tick, TICK_MS);
  }
  tick();
}

function reset() {
  if (workTimer) { clearTimeout(workTimer); workTimer = null; }
  running.value = false;
  progress.value = 0;
  blocked.value = false;
  yieldGap.value = false;
  ballAnimating.value = true;
  timeline.value = [];
  message.value = t('Reset. Toggle mode and start again.', '已重置。切换模式并重新开始。');
}

watch(cooperative, () => {
  if (!running.value) {
    message.value = cooperative.value
      ? t('Cooperative mode: work split into chunks of 4, yielding between each', '协作模式：工作分为 4 个一组，每组间让出控制权')
      : t('Blocking mode: all 20 units run without yielding', '阻塞模式：20 个单元不间断运行');
  }
});

const chunkColors = [
  'var(--viz-primary)',
  'var(--viz-success)',
  'var(--viz-warning)',
  '#8b5cf6',
  '#ec4899',
];
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive Cooperative Scheduling', '交互式 Cooperative Scheduling') }}</div>

    <div class="cs-top-row">
      <!-- Mode toggle -->
      <div class="cs-toggle-wrap">
        <button
          class="cs-toggle"
          :class="{ 'cs-toggle--on': cooperative }"
          @click="cooperative = !cooperative"
          :disabled="running"
        >
          <span class="cs-toggle-knob"></span>
        </button>
        <span class="cs-toggle-label">{{ cooperative ? t('Cooperative', '协作') : t('Blocking', '阻塞') }}</span>
      </div>

      <!-- Bouncing ball -->
      <div class="cs-ball-area">
        <div class="cs-ball-label">{{ t('UI Responsiveness', 'UI 响应性') }}</div>
        <div class="cs-ball-track">
          <div
            class="cs-ball"
            :class="{ 'cs-ball--frozen': blocked && !cooperative }"
            :style="{ transform: `translateY(${ballY}px)` }"
          ></div>
        </div>
        <div class="cs-ball-status" :class="blocked && !cooperative ? 'cs-ball-status--blocked' : 'cs-ball-status--ok'">
          {{ blocked && !cooperative ? t('FROZEN', '冻结') : t('SMOOTH', '流畅') }}
        </div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="cs-progress-section">
      <div class="cs-progress-header">
        <span class="cs-section-label">{{ t('Main Thread', '主线程') }}</span>
        <span class="cs-progress-count">{{ progress }} / {{ TOTAL_UNITS }}</span>
      </div>
      <div class="cs-progress-track">
        <div
          class="cs-progress-fill"
          :class="{
            'cs-progress-fill--blocked': blocked && !cooperative,
            'cs-progress-fill--cooperative': cooperative,
          }"
          :style="{ width: (progress / TOTAL_UNITS * 100) + '%' }"
        ></div>
      </div>
    </div>

    <!-- Timeline visualization -->
    <div class="cs-timeline">
      <div class="cs-section-label">{{ t('Timeline', '时间线') }}</div>
      <div class="cs-timeline-bar">
        <div
          v-for="(entry, i) in timeline"
          :key="i"
          class="cs-timeline-unit"
          :class="{
            'cs-timeline-unit--work': entry.type === 'work',
            'cs-timeline-unit--yield': entry.type === 'yield',
          }"
          :style="entry.type === 'work' ? {
            background: cooperative ? chunkColors[entry.chunk % chunkColors.length] : 'var(--viz-danger)',
          } : {}"
        >
          <span v-if="entry.type === 'yield'" class="cs-yield-label">UI</span>
        </div>
        <div v-if="timeline.length === 0" class="cs-timeline-empty">{{ t('waiting...', '等待中...') }}</div>
      </div>
      <div class="cs-timeline-legend">
        <span v-if="!cooperative" class="cs-legend-item">
          <span class="cs-legend-dot" style="background: var(--viz-danger)"></span> {{ t('Blocking work', '阻塞工作') }}
        </span>
        <template v-else>
          <span class="cs-legend-item">
            <span class="cs-legend-dot" style="background: var(--viz-primary)"></span> {{ t('Work chunk', '工作块') }}
          </span>
          <span class="cs-legend-item">
            <span class="cs-legend-dot cs-legend-dot--yield"></span> {{ t('Yield (UI runs)', '让出（UI 运行）') }}
          </span>
        </template>
      </div>
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="startTask" :disabled="running">{{ t('Start Long Task', '启动长任务') }}</button>
      <button class="viz-btn viz-btn--danger" @click="reset">{{ t('Reset', '重置') }}</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.cs-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.cs-toggle-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cs-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  border: none;
  border-radius: 12px;
  background: var(--viz-border);
  cursor: pointer;
  transition: background 0.2s ease;
  padding: 0;
}

.cs-toggle--on {
  background: var(--viz-success);
}

.cs-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cs-toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.cs-toggle--on .cs-toggle-knob {
  transform: translateX(20px);
}

.cs-toggle-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--viz-text);
}

/* Bouncing ball */
.cs-ball-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.cs-ball-label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--viz-muted);
}

.cs-ball-track {
  width: 28px;
  height: 52px;
  border: 1px solid var(--viz-border);
  border-radius: 14px;
  position: relative;
  background: var(--vp-c-bg);
  overflow: hidden;
}

.cs-ball {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--viz-success);
  position: absolute;
  left: 50%;
  top: 0;
  margin-left: -6px;
  transition: background 0.2s ease;
}

.cs-ball--frozen {
  background: var(--viz-danger);
}

.cs-ball-status {
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cs-ball-status--ok { color: var(--viz-success); }
.cs-ball-status--blocked { color: var(--viz-danger); }

/* Progress */
.cs-progress-section {
  margin-bottom: 0.75rem;
}

.cs-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.cs-section-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--viz-muted);
  letter-spacing: 0.03em;
}

.cs-progress-count {
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-text);
}

.cs-progress-track {
  height: 12px;
  border-radius: 6px;
  background: var(--viz-cell-empty);
  overflow: hidden;
}

.cs-progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.15s ease;
  background: var(--viz-primary);
}

.cs-progress-fill--blocked {
  background: var(--viz-danger);
}

.cs-progress-fill--cooperative {
  background: var(--viz-success);
}

/* Timeline */
.cs-timeline {
  margin: 0.5rem 0;
}

.cs-timeline-bar {
  display: flex;
  gap: 1px;
  min-height: 28px;
  padding: 4px;
  border: 1px solid var(--viz-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  overflow-x: auto;
  align-items: stretch;
  margin-top: 0.25rem;
}

.cs-timeline-unit {
  flex: 0 0 14px;
  min-height: 20px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: cs-unit-appear 0.15s ease;
}

.cs-timeline-unit--work {
  background: var(--viz-danger);
}

.cs-timeline-unit--yield {
  background: rgba(16, 185, 129, 0.15);
  border: 1px dashed var(--viz-success);
  flex: 0 0 28px;
}

.cs-yield-label {
  font-size: 0.5rem;
  font-weight: 700;
  color: var(--viz-success);
}

.cs-timeline-empty {
  font-size: 0.75rem;
  color: var(--viz-muted);
  font-style: italic;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
}

.cs-timeline-legend {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.375rem;
}

.cs-legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  color: var(--viz-muted);
}

.cs-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.cs-legend-dot--yield {
  background: rgba(16, 185, 129, 0.15);
  border: 1px dashed var(--viz-success);
}

.viz-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@keyframes cs-unit-appear {
  from { opacity: 0; transform: scaleY(0.5); }
  to { opacity: 1; transform: scaleY(1); }
}

@media (max-width: 640px) {
  .cs-top-row {
    flex-direction: column;
    align-items: stretch;
  }
  .cs-ball-area {
    flex-direction: row;
    gap: 0.5rem;
  }
  .cs-ball-track {
    width: 52px;
    height: 28px;
  }
  .cs-ball {
    top: 50%;
    left: 0;
    margin-top: -6px;
    margin-left: 0;
  }
  .cs-timeline-unit {
    flex: 0 0 10px;
  }
  .cs-timeline-unit--yield {
    flex: 0 0 20px;
  }
}
</style>
