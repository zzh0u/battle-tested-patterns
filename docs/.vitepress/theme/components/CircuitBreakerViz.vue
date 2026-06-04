<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

const state = ref<State>('CLOSED');
const failureCount = ref(0);
const successCount = ref(0);
const threshold = 3;
const halfOpenMax = 2;
const message = ref(t('Circuit is CLOSED — all requests pass through. Try sending some failures!', '熔断器已关闭 — 所有请求正常通过。试试发送一些失败请求！'));
const lastResult = ref<'success' | 'failure' | ''>('');
const requestLog = ref<{ type: 'success' | 'failure' | 'rejected'; id: number }[]>([]);
let reqId = 0;

const stateColor = computed(() => {
  switch (state.value) {
    case 'CLOSED': return 'var(--viz-success)';
    case 'OPEN': return 'var(--viz-danger)';
    case 'HALF_OPEN': return 'var(--viz-warning)';
  }
});

const stateLabel = computed(() => state.value.replace('_', '-'));

function sendSuccess() {
  if (state.value === 'OPEN') {
    requestLog.value.unshift({ type: 'rejected', id: ++reqId });
    message.value = t('REJECTED — circuit is OPEN, request not sent', '已拒绝 — 熔断器已打开，请求未发送');
    lastResult.value = 'failure';
    cleanLog();
    return;
  }

  lastResult.value = 'success';
  requestLog.value.unshift({ type: 'success', id: ++reqId });

  if (state.value === 'HALF_OPEN') {
    successCount.value++;
    if (successCount.value >= halfOpenMax) {
      state.value = 'CLOSED';
      failureCount.value = 0;
      successCount.value = 0;
      message.value = t(`${halfOpenMax} successes in HALF-OPEN → circuit CLOSED again!`, `HALF-OPEN 中 ${halfOpenMax} 次成功 → 熔断器重新关闭！`);
    } else {
      message.value = t(`Success in HALF-OPEN (${successCount.value}/${halfOpenMax} needed to close)`, `HALF-OPEN 中成功（需 ${successCount.value}/${halfOpenMax} 次关闭）`);
    }
  } else {
    message.value = t('Request succeeded — circuit stays CLOSED', '请求成功 — 熔断器保持关闭');
  }
  cleanLog();
}

function sendFailure() {
  if (state.value === 'OPEN') {
    requestLog.value.unshift({ type: 'rejected', id: ++reqId });
    message.value = t('REJECTED — circuit is OPEN, request not sent', '已拒绝 — 熔断器已打开，请求未发送');
    lastResult.value = 'failure';
    cleanLog();
    return;
  }

  lastResult.value = 'failure';
  requestLog.value.unshift({ type: 'failure', id: ++reqId });

  if (state.value === 'HALF_OPEN') {
    state.value = 'OPEN';
    successCount.value = 0;
    message.value = t('Failure in HALF-OPEN → circuit OPEN again!', 'HALF-OPEN 中失败 → 熔断器重新打开！');
  } else {
    failureCount.value++;
    if (failureCount.value >= threshold) {
      state.value = 'OPEN';
      message.value = t(`${threshold} failures reached — circuit OPEN! Requests will be rejected.`, `已达 ${threshold} 次失败 — 熔断器打开！请求将被拒绝。`);
    } else {
      message.value = t(`Failure ${failureCount.value}/${threshold} — circuit still CLOSED`, `失败 ${failureCount.value}/${threshold} — 熔断器仍然关闭`);
    }
  }
  cleanLog();
}

function tryReset() {
  if (state.value !== 'OPEN') {
    message.value = t('Circuit is not OPEN — no timeout needed', '熔断器未打开 — 无需超时重置');
    return;
  }
  state.value = 'HALF_OPEN';
  successCount.value = 0;
  message.value = t('Timeout expired → HALF-OPEN — next request is a probe', '超时到期 → HALF-OPEN — 下一个请求将作为探测');
}

function reset() {
  state.value = 'CLOSED';
  failureCount.value = 0;
  successCount.value = 0;
  requestLog.value = [];
  lastResult.value = '';
  message.value = t('Reset! Circuit is CLOSED.', '已重置！熔断器已关闭。');
}

function cleanLog() {
  if (requestLog.value.length > 12) requestLog.value = requestLog.value.slice(0, 12);
}

const states: { key: State; label: string; x: number; y: number }[] = [
  { key: 'CLOSED', label: 'Closed', x: 60, y: 60 },
  { key: 'OPEN', label: 'Open', x: 240, y: 60 },
  { key: 'HALF_OPEN', label: 'Half-Open', x: 150, y: 160 },
];
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive Circuit Breaker', '交互式 Circuit Breaker') }} · {{ t('threshold', '阈值') }}={{ threshold }}</div>

    <!-- State machine diagram -->
    <svg viewBox="0 0 300 200" class="cb-svg">
      <!-- Transition arrows -->
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="var(--viz-muted)" />
        </marker>
      </defs>

      <!-- CLOSED → OPEN -->
      <line x1="95" y1="55" x2="200" y2="55" stroke="var(--viz-muted)" stroke-width="1.5" marker-end="url(#arrow)" stroke-dasharray="4,3" />
      <text x="148" y="46" text-anchor="middle" fill="var(--viz-muted)" font-size="8">{{ threshold }} {{ t('failures', '次失败') }}</text>

      <!-- OPEN → HALF_OPEN -->
      <line x1="225" y1="85" x2="175" y2="140" stroke="var(--viz-muted)" stroke-width="1.5" marker-end="url(#arrow)" stroke-dasharray="4,3" />
      <text x="210" y="118" text-anchor="middle" fill="var(--viz-muted)" font-size="8">{{ t('timeout', '超时') }}</text>

      <!-- HALF_OPEN → CLOSED -->
      <line x1="120" y1="148" x2="72" y2="90" stroke="var(--viz-muted)" stroke-width="1.5" marker-end="url(#arrow)" stroke-dasharray="4,3" />
      <text x="82" y="126" text-anchor="middle" fill="var(--viz-muted)" font-size="8">{{ t('success', '成功') }}</text>

      <!-- HALF_OPEN → OPEN -->
      <line x1="180" y1="148" x2="228" y2="90" stroke="var(--viz-muted)" stroke-width="1.5" marker-end="url(#arrow)" stroke-dasharray="4,3" />
      <text x="218" y="130" text-anchor="middle" fill="var(--viz-muted)" font-size="8">{{ t('failure', '失败') }}</text>

      <!-- State circles -->
      <g v-for="s in states" :key="s.key">
        <circle
          :cx="s.x"
          :cy="s.y"
          r="30"
          :fill="state === s.key ? stateColor : 'var(--vp-c-bg)'"
          :stroke="state === s.key ? stateColor : 'var(--viz-border)'"
          stroke-width="2"
          :class="{ 'cb-active': state === s.key }"
        />
        <text
          :x="s.x"
          :y="s.y + 1"
          text-anchor="middle"
          dominant-baseline="central"
          :fill="state === s.key ? '#fff' : 'var(--viz-text)'"
          font-size="10"
          font-weight="600"
        >
          {{ s.label }}
        </text>
      </g>
    </svg>

    <!-- Request log -->
    <div v-if="requestLog.length" class="cb-log">
      <span
        v-for="entry in requestLog"
        :key="entry.id"
        class="cb-log-dot"
        :class="{
          'cb-log-dot--success': entry.type === 'success',
          'cb-log-dot--failure': entry.type === 'failure',
          'cb-log-dot--rejected': entry.type === 'rejected',
        }"
        :title="entry.type"
      ></span>
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="sendSuccess">{{ t('Send Success', '发送成功') }}</button>
      <button class="viz-btn viz-btn--danger" @click="sendFailure">{{ t('Send Failure', '发送失败') }}</button>
      <button class="viz-btn" @click="tryReset" :disabled="state !== 'OPEN'">{{ t('Timeout Reset', '超时重置') }}</button>
      <button class="viz-btn" @click="reset">{{ t('Reset All', '全部重置') }}</button>
    </div>

    <div class="viz-status" :style="{ borderLeft: `3px solid ${stateColor}` }">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.cb-svg {
  width: 100%;
  max-width: 320px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.cb-active {
  animation: state-glow 0.5s ease;
}

.cb-log {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  padding: 0.5rem 0;
}

.cb-log-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.cb-log-dot--success { background: var(--viz-success); }
.cb-log-dot--failure { background: var(--viz-danger); }
.cb-log-dot--rejected { background: var(--viz-muted); border: 1px dashed var(--viz-danger); }

@keyframes state-glow {
  0%, 100% { filter: none; }
  50% { filter: brightness(1.2); }
}
</style>
