<script setup lang="ts">
import { ref } from 'vue';

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

const message = ref('Perform local events and send messages between processes');
const pendingMessages = ref<{ from: number; clock: number }[]>([]);

function localEvent(idx: number) {
  const p = processes.value[idx];
  p.clock++;
  p.events = [...p.events, { type: 'local', clock: p.clock, label: 'local' }];
  message.value = `${p.name}: local event → clock = ${p.clock}`;
}

function sendMessage(fromIdx: number) {
  const from = processes.value[fromIdx];
  from.clock++;
  from.events = [...from.events, { type: 'send', clock: from.clock, label: 'send' }];
  pendingMessages.value = [...pendingMessages.value, { from: fromIdx, clock: from.clock }];
  message.value = `${from.name}: sent message (clock=${from.clock}) — click "Receive" on another process`;
}

function receiveMessage(toIdx: number) {
  if (pendingMessages.value.length === 0) {
    message.value = 'No pending messages — send one first';
    return;
  }
  const msg = pendingMessages.value[0];
  if (msg.from === toIdx) {
    message.value = 'Cannot receive your own message — pick a different process';
    return;
  }
  pendingMessages.value = pendingMessages.value.slice(1);

  const to = processes.value[toIdx];
  to.clock = Math.max(to.clock, msg.clock) + 1;
  to.events = [...to.events, { type: 'recv', clock: to.clock, label: `recv(${msg.clock})` }];
  message.value = `${to.name}: received (sender clock=${msg.clock}) → max(${to.clock - 1}, ${msg.clock}) + 1 = ${to.clock}`;
}

function reset() {
  processes.value = [
    { name: 'P1', color: 'var(--viz-primary)', clock: 0, events: [] },
    { name: 'P2', color: 'var(--viz-success)', clock: 0, events: [] },
    { name: 'P3', color: 'var(--viz-warning)', clock: 0, events: [] },
  ];
  pendingMessages.value = [];
  message.value = 'Reset — perform events to see Lamport clocks';
}
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">Interactive Lamport Clock</div>

    <div class="lc-processes">
      <div
        v-for="(p, i) in processes"
        :key="p.name"
        class="lc-process"
        :style="{ borderColor: p.color }"
      >
        <div class="lc-header">
          <span class="lc-name" :style="{ color: p.color }">{{ p.name }}</span>
          <span class="lc-clock">clock: {{ p.clock }}</span>
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
          <button class="viz-btn lc-btn" @click="localEvent(i)">Local</button>
          <button class="viz-btn lc-btn" @click="sendMessage(i)">Send</button>
          <button class="viz-btn lc-btn" @click="receiveMessage(i)">Receive</button>
        </div>
      </div>
    </div>

    <div v-if="pendingMessages.length > 0" class="lc-pending">
      Pending messages: {{ pendingMessages.map(m => `from ${processes[m.from].name}(${m.clock})`).join(', ') }}
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--danger" @click="reset">Reset</button>
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
