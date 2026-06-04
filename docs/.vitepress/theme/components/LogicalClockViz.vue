<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../composables/useI18n';
const { t } = useI18n();

interface Process {
  name: string;
  color: string;
  clock: number;
  events: { type: 'local' | 'send' | 'recv'; clock: number; label: string }[];
}

const processes = ref<Process[]>([
  { name: 'P1', color: 'var(--viz-primary)', clock: 0, events: [] },
  { name: 'P2', color: 'var(--viz-success)', clock: 0, events: [] },
  { name: 'P3', color: 'var(--viz-warning)', clock: 0, events: [] },
]);

const message = ref(t('Perform local events and send messages between processes', '执行本地事件并在进程间发送消息'));
const pendingMessages = ref<{ from: number; clock: number }[]>([]);

function localEvent(idx: number) {
  const p = processes.value[idx];
  p.clock++;
  p.events = [...p.events, { type: 'local', clock: p.clock, label: 'local' }];
  message.value = t(`${p.name}: local event → clock = ${p.clock}`, `${p.name}：本地事件 → 时钟 = ${p.clock}`);
}

function sendMessage(fromIdx: number) {
  const from = processes.value[fromIdx];
  from.clock++;
  from.events = [...from.events, { type: 'send', clock: from.clock, label: 'send' }];
  pendingMessages.value = [...pendingMessages.value, { from: fromIdx, clock: from.clock }];
  message.value = t(`${from.name}: sent message (clock=${from.clock}) — click "Receive" on another process`, `${from.name}：已发送消息 (clock=${from.clock}) — 在其他进程上点击"接收"`);
}

function receiveMessage(toIdx: number) {
  if (pendingMessages.value.length === 0) {
    message.value = t('No pending messages — send one first', '没有待处理消息 — 请先发送一条');
    return;
  }
  const msg = pendingMessages.value[0];
  if (msg.from === toIdx) {
    message.value = t('Cannot receive your own message — pick a different process', '不能接收自己的消息 — 请选择其他进程');
    return;
  }
  pendingMessages.value = pendingMessages.value.slice(1);

  const to = processes.value[toIdx];
  to.clock = Math.max(to.clock, msg.clock) + 1;
  to.events = [...to.events, { type: 'recv', clock: to.clock, label: `recv(${msg.clock})` }];
  message.value = t(`${to.name}: received (sender clock=${msg.clock}) → max(${to.clock - 1}, ${msg.clock}) + 1 = ${to.clock}`, `${to.name}：已接收 (发送方 clock=${msg.clock}) → max(${to.clock - 1}, ${msg.clock}) + 1 = ${to.clock}`);
}

function reset() {
  processes.value = [
    { name: 'P1', color: 'var(--viz-primary)', clock: 0, events: [] },
    { name: 'P2', color: 'var(--viz-success)', clock: 0, events: [] },
    { name: 'P3', color: 'var(--viz-warning)', clock: 0, events: [] },
  ];
  pendingMessages.value = [];
  message.value = t('Reset — perform events to see Lamport clocks', '已重置 — 执行事件以查看 Lamport 时钟');
}
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive Lamport Clock', '交互式 Lamport 时钟') }}</div>

    <div class="lc-processes">
      <div
        v-for="(p, i) in processes"
        :key="p.name"
        class="lc-process"
        :style="{ borderColor: p.color }"
      >
        <div class="lc-header">
          <span class="lc-name" :style="{ color: p.color }">{{ p.name }}</span>
          <span class="lc-clock">{{ t('clock:', '时钟：') }} {{ p.clock }}</span>
        </div>

        <div class="lc-timeline">
          <span
            v-for="(ev, j) in p.events.slice(-6)"
            :key="j"
            class="lc-event"
            :class="'lc-event-' + ev.type"
          >
            <span class="lc-event-clock">{{ ev.clock }}</span>
            <span class="lc-event-label">{{ ev.label }}</span>
          </span>
        </div>

        <div class="lc-actions">
          <button class="viz-btn lc-btn" @click="localEvent(i)">{{ t('Local', '本地') }}</button>
          <button class="viz-btn lc-btn" @click="sendMessage(i)">{{ t('Send', '发送') }}</button>
          <button class="viz-btn lc-btn" @click="receiveMessage(i)">{{ t('Receive', '接收') }}</button>
        </div>
      </div>
    </div>

    <div v-if="pendingMessages.length > 0" class="lc-pending">
      {{ t('Pending messages:', '待处理消息：') }} {{ pendingMessages.map(m => t(`from ${processes[m.from].name}(${m.clock})`, `来自 ${processes[m.from].name}(${m.clock})`)).join(', ') }}
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--danger" @click="reset">{{ t('Reset', '重置') }}</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.lc-processes {
  display: flex;
  gap: 8px;
  padding: 1rem 0;
}

@media (max-width: 640px) {
  .lc-processes { flex-direction: column; }
}

.lc-process {
  flex: 1;
  border: 2px solid;
  border-radius: 8px;
  padding: 0.5rem;
  background: var(--vp-c-bg);
}

.lc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.lc-name {
  font-size: 0.8rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
}

.lc-clock {
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-muted);
}

.lc-timeline {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  min-height: 32px;
  margin-bottom: 6px;
}

.lc-event {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-family: var(--vp-font-family-mono);
  animation: lc-pop 0.2s ease;
}

.lc-event-local {
  background: rgba(59, 130, 246, 0.15);
  color: var(--viz-primary);
}

.lc-event-send {
  background: rgba(245, 158, 11, 0.15);
  color: var(--viz-warning);
}

.lc-event-recv {
  background: rgba(16, 185, 129, 0.15);
  color: var(--viz-success);
}

.lc-event-clock {
  font-weight: 700;
  font-size: 0.75rem;
}

.lc-event-label {
  font-size: 0.5rem;
}

.lc-actions {
  display: flex;
  gap: 3px;
}

.lc-btn {
  flex: 1;
  font-size: 0.6rem;
  padding: 0.2rem 0.3rem;
}

.lc-pending {
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-warning);
  text-align: center;
  padding: 0.3rem;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 4px;
}

@keyframes lc-pop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
