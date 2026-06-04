<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

interface Middleware {
  name: string;
  color: string;
  enabled: boolean;
}

const middlewares = ref<Middleware[]>([
  { name: 'Auth', color: 'var(--viz-primary)', enabled: true },
  { name: 'Logger', color: 'var(--viz-success)', enabled: true },
  { name: 'RateLimit', color: 'var(--viz-warning)', enabled: true },
  { name: 'Handler', color: 'var(--viz-danger)', enabled: true },
]);

const activeIdx = ref(-1);
const phase = ref<'idle' | 'forward' | 'backward'>('idle');
const running = ref(false);
const message = ref(t('Click "Send Request" to see the middleware chain in action', '点击"发送请求"查看 Middleware 链的运行过程'));
const rejected = ref(false);
const rejectAt = ref(-1);

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendRequest() {
  if (running.value) return;
  running.value = true;
  rejected.value = false;
  rejectAt.value = -1;
  phase.value = 'forward';
  message.value = t('Request entering middleware chain...', '请求正在进入 Middleware 链...');

  const enabled = middlewares.value.filter(m => m.enabled);
  const shouldReject = Math.random() < 0.3 && enabled.length > 2;
  const rejectIdx = shouldReject ? Math.floor(Math.random() * (enabled.length - 1)) : -1;

  for (let i = 0; i < middlewares.value.length; i++) {
    if (!middlewares.value[i].enabled) continue;
    activeIdx.value = i;
    message.value = t(`→ ${middlewares.value[i].name}: processing request...`, `→ ${middlewares.value[i].name}: 正在处理请求...`);
    await delay(500);

    if (shouldReject && i === rejectIdx) {
      rejected.value = true;
      rejectAt.value = i;
      message.value = t(`✗ ${middlewares.value[i].name}: REJECTED (e.g., auth failed)`, `✗ ${middlewares.value[i].name}: 已拒绝（如认证失败）`);
      await delay(600);
      break;
    }
  }

  phase.value = 'backward';
  if (!rejected.value) {
    message.value = t('Response flowing back through chain...', '响应正在沿链路返回...');
    await delay(300);
  }

  const startFrom = rejected.value ? rejectAt.value : middlewares.value.length - 1;
  for (let i = startFrom; i >= 0; i--) {
    if (!middlewares.value[i].enabled) continue;
    activeIdx.value = i;
    message.value = t(
      `← ${middlewares.value[i].name}: ${rejected.value ? 'error response' : 'adding response headers'}...`,
      `← ${middlewares.value[i].name}: ${rejected.value ? '错误响应' : '添加响应头'}...`
    );
    await delay(400);
  }

  activeIdx.value = -1;
  phase.value = 'idle';
  message.value = rejected.value
    ? t('Request rejected — error response sent', '请求被拒绝 — 已发送错误响应')
    : t('Request completed successfully through all middleware', '请求已成功通过所有 Middleware');
  running.value = false;
}

function toggleMiddleware(idx: number) {
  if (running.value) return;
  if (idx === middlewares.value.length - 1) {
    message.value = t('Handler cannot be disabled', 'Handler 不能被禁用');
    return;
  }
  middlewares.value[idx].enabled = !middlewares.value[idx].enabled;
  const m = middlewares.value[idx];
  message.value = t(`${m.name} ${m.enabled ? 'enabled' : 'disabled'}`, `${m.name} ${m.enabled ? '已启用' : '已禁用'}`);
}

function reset() {
  activeIdx.value = -1;
  phase.value = 'idle';
  running.value = false;
  rejected.value = false;
  rejectAt.value = -1;
  middlewares.value.forEach(m => { m.enabled = true; });
  message.value = t('Reset — click "Send Request" to start', '已重置 — 点击"发送请求"开始');
}
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive Middleware Chain', '交互式 Middleware 链') }}</div>

    <div class="mw-chain">
      <div class="mw-request" :class="{ 'mw-active': phase === 'forward' }">REQ</div>

      <template v-for="(m, i) in middlewares" :key="m.name">
        <div class="mw-arrow" :class="{ 'mw-arrow-active': activeIdx === i }">
          {{ phase === 'backward' && activeIdx <= i ? '←' : '→' }}
        </div>
        <div
          class="mw-node"
          :class="{
            'mw-node-active': activeIdx === i,
            'mw-node-disabled': !m.enabled,
            'mw-node-rejected': rejected && rejectAt === i,
          }"
          :style="{ borderColor: m.enabled ? m.color : 'var(--viz-border)' }"
          @click="toggleMiddleware(i)"
        >
          <div class="mw-node-name" :style="{ color: m.enabled ? m.color : 'var(--viz-muted)' }">
            {{ m.name }}
          </div>
          <div v-if="!m.enabled" class="mw-node-skip">{{ t('skip', '跳过') }}</div>
        </div>
      </template>

      <div class="mw-arrow" :class="{ 'mw-arrow-active': phase === 'backward' }">←</div>
      <div class="mw-response" :class="{ 'mw-active': phase === 'backward' }">
        {{ rejected ? 'ERR' : 'RES' }}
      </div>
    </div>

    <div class="mw-hint">{{ t('Click middleware names to enable/disable', '点击 Middleware 名称启用/禁用') }}</div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="sendRequest" :disabled="running">{{ t('Send Request', '发送请求') }}</button>
      <button class="viz-btn viz-btn--danger" @click="reset">{{ t('Reset', '重置') }}</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.mw-chain {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1rem 0;
  overflow-x: auto;
  justify-content: center;
}

@media (max-width: 640px) {
  .mw-chain {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.mw-request,
.mw-response {
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  border: 2px solid var(--viz-border);
  background: var(--vp-c-bg);
  color: var(--viz-text);
  transition: all 0.2s;
}

.mw-active {
  border-color: var(--viz-primary);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

.mw-arrow {
  font-size: 1rem;
  color: var(--viz-muted);
  transition: color 0.2s;
  min-width: 16px;
  text-align: center;
}

.mw-arrow-active {
  color: var(--viz-warning);
}

.mw-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.5rem 0.7rem;
  border: 2px solid;
  border-radius: 8px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.mw-node:hover {
  opacity: 0.8;
}

.mw-node-active {
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
  transform: scale(1.05);
}

.mw-node-disabled {
  opacity: 0.4;
}

.mw-node-rejected {
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.4) !important;
}

.mw-node-name {
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
}

.mw-node-skip {
  font-size: 0.55rem;
  color: var(--viz-muted);
  font-style: italic;
}

.mw-hint {
  font-size: 0.65rem;
  color: var(--viz-muted);
  text-align: center;
  margin-top: -0.5rem;
}
</style>
