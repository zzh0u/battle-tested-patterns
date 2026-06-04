<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useI18n } from '../composables/useI18n';
const { t } = useI18n();

interface Task {
  id: number;
  progress: number;
}

interface Worker {
  name: string;
  color: string;
  queue: Task[];
  stolen: number;
}

let nextTaskId = 1;

const workers = ref<Worker[]>([
  { name: 'W1', color: 'var(--viz-primary)', queue: [], stolen: 0 },
  { name: 'W2', color: 'var(--viz-success)', queue: [], stolen: 0 },
  { name: 'W3', color: 'var(--viz-warning)', queue: [], stolen: 0 },
]);

const message = ref(t('Add tasks to workers, then start processing to see work stealing', '向工作线程添加任务，然后开始处理以查看 Work Stealing'));
const running = ref(false);
const timer = ref<ReturnType<typeof setInterval> | null>(null);
const stealHighlight = ref('');

function addTasks(workerIdx: number) {
  const w = workers.value[workerIdx];
  for (let i = 0; i < 4; i++) {
    w.queue.push({ id: nextTaskId++, progress: 0 });
  }
  message.value = t(`Added 4 tasks to ${w.name} (queue: ${w.queue.length})`, `已添加 4 个任务到 ${w.name}（队列：${w.queue.length}）`);
}

function startProcessing() {
  if (running.value) return;
  running.value = true;
  message.value = t('Processing...', '处理中...');
  stealHighlight.value = '';

  timer.value = setInterval(() => {
    let anyWork = false;

    for (const w of workers.value) {
      if (w.queue.length > 0) {
        anyWork = true;
        w.queue[0].progress += 25;
        if (w.queue[0].progress >= 100) {
          w.queue.shift();
        }
      } else {
        const busiest = workers.value
          .filter(other => other.name !== w.name && other.queue.length > 1)
          .sort((a, b) => b.queue.length - a.queue.length)[0];

        if (busiest) {
          const stolen = busiest.queue.pop()!;
          stolen.progress = 0;
          w.queue.push(stolen);
          w.stolen++;
          stealHighlight.value = `${busiest.name}->${w.name}`;
          message.value = t(`${w.name} stole task #${stolen.id} from ${busiest.name}!`, `${w.name} 从 ${busiest.name} 窃取了任务 #${stolen.id}！`);
          anyWork = true;
          setTimeout(() => { stealHighlight.value = ''; }, 400);
        }
      }
    }

    if (!anyWork) {
      stopProcessing();
      message.value = t('All tasks completed!', '所有任务已完成！');
    }
  }, 300);
}

function stopProcessing() {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  running.value = false;
}

function reset() {
  stopProcessing();
  nextTaskId = 1;
  workers.value = [
    { name: 'W1', color: 'var(--viz-primary)', queue: [], stolen: 0 },
    { name: 'W2', color: 'var(--viz-success)', queue: [], stolen: 0 },
    { name: 'W3', color: 'var(--viz-warning)', queue: [], stolen: 0 },
  ];
  stealHighlight.value = '';
  message.value = t('Reset — add tasks and start processing', '已重置 — 添加任务并开始处理');
}

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive Work Stealing', '交互式 Work Stealing') }}</div>

    <div class="ws-workers">
      <div
        v-for="(w, i) in workers"
        :key="w.name"
        class="ws-worker"
        :class="{ 'ws-worker-stealing': stealHighlight.endsWith('->' + w.name) }"
        :style="{ borderColor: w.color }"
      >
        <div class="ws-worker-header">
          <span class="ws-worker-name" :style="{ color: w.color }">{{ w.name }}</span>
          <span class="ws-worker-stats">
            {{ t('queue:', '队列：') }} {{ w.queue.length }} | {{ t('stolen:', '窃取：') }} {{ w.stolen }}
          </span>
        </div>

        <div class="ws-queue">
          <div
            v-for="task in w.queue"
            :key="task.id"
            class="ws-task"
          >
            <div class="ws-task-label">#{{ task.id }}</div>
            <div class="ws-task-bar">
              <div
                class="ws-task-fill"
                :style="{ width: task.progress + '%', background: w.color }"
              ></div>
            </div>
          </div>
          <div v-if="w.queue.length === 0" class="ws-empty">{{ t('idle', '空闲') }}</div>
        </div>

        <button
          class="viz-btn ws-add-btn"
          @click="addTasks(i)"
          :disabled="running"
        >{{ t('+ 4 Tasks', '+ 4 任务') }}</button>
      </div>
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="startProcessing" :disabled="running">{{ t('Start', '开始') }}</button>
      <button class="viz-btn" @click="stopProcessing" :disabled="!running">{{ t('Stop', '停止') }}</button>
      <button class="viz-btn viz-btn--danger" @click="reset">{{ t('Reset', '重置') }}</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.ws-workers {
  display: flex;
  gap: 8px;
  padding: 1rem 0;
}

@media (max-width: 640px) {
  .ws-workers { flex-direction: column; }
}

.ws-worker {
  flex: 1;
  border: 2px solid;
  border-radius: 8px;
  padding: 0.5rem;
  background: var(--vp-c-bg);
  transition: box-shadow 0.3s;
}

.ws-worker-stealing {
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
  animation: ws-steal-flash 0.4s ease;
}

.ws-worker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.ws-worker-name {
  font-size: 0.8rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
}

.ws-worker-stats {
  font-size: 0.6rem;
  color: var(--viz-muted);
  font-family: var(--vp-font-family-mono);
}

.ws-queue {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ws-task {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ws-task-label {
  font-size: 0.65rem;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-text);
  min-width: 24px;
}

.ws-task-bar {
  flex: 1;
  height: 10px;
  background: var(--viz-cell-empty);
  border-radius: 3px;
  overflow: hidden;
}

.ws-task-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.2s;
}

.ws-empty {
  font-size: 0.7rem;
  color: var(--viz-muted);
  font-style: italic;
  text-align: center;
  padding: 1rem 0;
}

.ws-add-btn {
  width: 100%;
  margin-top: 6px;
  font-size: 0.65rem;
  padding: 0.25rem;
}

@keyframes ws-steal-flash {
  0% { background: var(--vp-c-bg); }
  50% { background: rgba(245, 158, 11, 0.1); }
  100% { background: var(--vp-c-bg); }
}
</style>
