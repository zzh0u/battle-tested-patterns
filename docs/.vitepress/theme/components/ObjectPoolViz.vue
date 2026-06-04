<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

interface PoolObject {
  id: number;
  state: 'available' | 'in-use' | 'creating';
  remaining: number;
}

const POOL_SIZE = 5;
const USE_DURATION = 3000; // ms
const TICK = 100; // ms

const pool = ref<PoolObject[]>(createPool());
const waitQueue = ref(0);
const totalAcquisitions = ref(0);
const message = ref(t('Pool ready — click "Acquire" to check out a connection', 'Object Pool 就绪 — 点击"获取"来签出连接'));
const timers = new Set<ReturnType<typeof setInterval>>();

function createPool(): PoolObject[] {
  return Array.from({ length: POOL_SIZE }, (_, i) => ({
    id: i + 1,
    state: 'available' as const,
    remaining: 0,
  }));
}

const inUseCount = computed(() =>
  pool.value.filter((o) => o.state === 'in-use').length,
);
const availableCount = computed(() =>
  pool.value.filter((o) => o.state === 'available').length,
);

function acquire() {
  const obj = pool.value.find((o) => o.state === 'available');
  if (!obj) {
    waitQueue.value++;
    message.value = t(`Pool exhausted — waiting... (${waitQueue.value} queued)`, `池已耗尽 — 等待中... (${waitQueue.value} 个排队)`);
    return;
  }
  checkOut(obj);
}

function checkOut(obj: PoolObject) {
  totalAcquisitions.value++;
  obj.state = 'in-use';
  obj.remaining = USE_DURATION;
  message.value = t(`Conn #${obj.id} acquired (returns in ${(USE_DURATION / 1000).toFixed(1)}s)`, `连接 #${obj.id} 已获取（${(USE_DURATION / 1000).toFixed(1)}s 后归还）`);

  const timer = setInterval(() => {
    obj.remaining -= TICK;
    if (obj.remaining <= 0) {
      obj.remaining = 0;
      clearInterval(timer);
      timers.delete(timer);
      returnObject(obj);
    }
  }, TICK);
  timers.add(timer);
}

function returnObject(obj: PoolObject) {
  obj.state = 'available';
  obj.remaining = 0;

  if (waitQueue.value > 0) {
    waitQueue.value--;
    message.value = t(`Conn #${obj.id} returned — immediately handed to waiting request`, `连接 #${obj.id} 已归还 — 立即分配给等待中的请求`);
    checkOut(obj);
  } else {
    message.value = t(`Conn #${obj.id} returned to pool`, `连接 #${obj.id} 已归还到池`);
  }
}

function reset() {
  for (const t of timers) clearInterval(t);
  timers.clear();
  pool.value = createPool();
  waitQueue.value = 0;
  totalAcquisitions.value = 0;
  message.value = t('Pool reset — all connections available', '池已重置 — 所有连接可用');
}

function stateColor(s: PoolObject['state']): string {
  switch (s) {
    case 'available':
      return 'var(--viz-success)';
    case 'in-use':
      return 'var(--viz-primary)';
    case 'creating':
      return 'var(--viz-warning)';
  }
}

function remainingLabel(obj: PoolObject): string {
  if (obj.state !== 'in-use') return '';
  return `${(obj.remaining / 1000).toFixed(1)}s`;
}

onUnmounted(() => {
  for (const t of timers) clearInterval(t);
  timers.clear();
});
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive Object Pool', '交互式 Object Pool') }}</div>

    <!-- Stats bar -->
    <div class="op-stats">
      <div class="op-stat">
        <span class="op-stat-value">{{ POOL_SIZE }}</span>
        <span class="viz-label">{{ t('Total', '总计') }}</span>
      </div>
      <div class="op-stat">
        <span class="op-stat-value op-stat--primary">{{ inUseCount }}</span>
        <span class="viz-label">{{ t('In Use', '使用中') }}</span>
      </div>
      <div class="op-stat">
        <span class="op-stat-value op-stat--success">{{ availableCount }}</span>
        <span class="viz-label">{{ t('Available', '可用') }}</span>
      </div>
      <div class="op-stat">
        <span class="op-stat-value">{{ totalAcquisitions }}</span>
        <span class="viz-label">{{ t('Acquisitions', '获取次数') }}</span>
      </div>
    </div>

    <!-- Pool visualization -->
    <div class="op-pool">
      <div
        v-for="obj in pool"
        :key="obj.id"
        class="op-slot"
        :class="{
          'op-slot--available': obj.state === 'available',
          'op-slot--in-use': obj.state === 'in-use',
          'op-slot--creating': obj.state === 'creating',
        }"
      >
        <div
          class="op-circle"
          :style="{ borderColor: stateColor(obj.state), background: obj.state === 'available' ? stateColor(obj.state) : 'transparent' }"
        >
          <span v-if="obj.state === 'in-use'" class="op-timer">{{ remainingLabel(obj) }}</span>
          <span v-else class="op-check">&#10003;</span>
        </div>
        <div class="op-label">Conn #{{ obj.id }}</div>
        <div class="op-state-tag" :style="{ color: stateColor(obj.state) }">
          {{ obj.state === 'in-use' ? t('in use', '使用中') : obj.state === 'available' ? t('available', '可用') : t('creating', '创建中') }}
        </div>
      </div>
    </div>

    <!-- Wait queue indicator -->
    <div v-if="waitQueue > 0" class="op-queue">
      <span class="op-queue-icon">&#9203;</span>
      {{ t(`${waitQueue} request${waitQueue > 1 ? 's' : ''} waiting for a connection...`, `${waitQueue} 个请求等待连接中...`) }}
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="acquire">{{ t('Acquire', '获取') }}</button>
      <button class="viz-btn viz-btn--danger" @click="reset">{{ t('Reset', '重置') }}</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.op-stats {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.op-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  min-width: 56px;
}

.op-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-text);
}

.op-stat--primary {
  color: var(--viz-primary);
}

.op-stat--success {
  color: var(--viz-success);
}

.op-pool {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 1rem 0;
}

.op-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: transform 0.2s ease;
}

.op-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.op-slot--available .op-circle {
  animation: op-return 0.4s ease;
}

.op-slot--in-use .op-circle {
  animation: op-acquire 0.3s ease;
}

.op-check {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
}

.op-timer {
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-primary);
}

.op-label {
  font-size: 0.7rem;
  font-weight: 600;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-text);
}

.op-state-tag {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.op-queue {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border-radius: 6px;
  background: var(--viz-warning);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  animation: op-pulse 1.5s ease-in-out infinite;
}

.op-queue-icon {
  font-size: 1rem;
}

@keyframes op-acquire {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes op-return {
  0% {
    transform: scale(0.85);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes op-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.75;
  }
}
</style>
