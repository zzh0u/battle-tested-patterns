<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

type State = 'idle' | 'loading' | 'success' | 'error';
type Event = 'FETCH' | 'RESOLVE' | 'REJECT' | 'RETRY' | 'RESET';

const transitions: Record<State, Partial<Record<Event, State>>> = {
  idle: { FETCH: 'loading' },
  loading: { RESOLVE: 'success', REJECT: 'error' },
  success: { RESET: 'idle' },
  error: { RETRY: 'loading' },
};

const currentState = ref<State>('idle');
const history = ref<{ from: State; event: Event; to: State }[]>([]);
const message = ref(t('Click an event button to trigger a state transition', '点击事件按钮触发状态转换'));
const lastTransition = ref<string>('');

const statePositions: Record<State, { x: number; y: number }> = {
  idle: { x: 80, y: 80 },
  loading: { x: 280, y: 80 },
  success: { x: 280, y: 200 },
  error: { x: 80, y: 200 },
};

const stateColors: Record<State, string> = {
  idle: 'var(--viz-muted)',
  loading: 'var(--viz-warning)',
  success: 'var(--viz-success)',
  error: 'var(--viz-danger)',
};

const availableEvents = computed<Event[]>(() => {
  const events = transitions[currentState.value];
  return Object.keys(events) as Event[];
});

const allEvents: Event[] = ['FETCH', 'RESOLVE', 'REJECT', 'RETRY', 'RESET'];

function triggerEvent(event: Event) {
  const nextState = transitions[currentState.value][event];
  if (!nextState) {
    message.value = t(`Cannot trigger ${event} from ${currentState.value.toUpperCase()}`, `无法从 ${currentState.value.toUpperCase()} 触发 ${event}`);
    return;
  }

  const from = currentState.value;
  currentState.value = nextState;
  lastTransition.value = `${from}-${event}-${nextState}`;
  history.value.push({ from, event, to: nextState });
  message.value = t(`${from.toUpperCase()} —[${event}]→ ${nextState.toUpperCase()}`, `${from.toUpperCase()} —[${event}]→ ${nextState.toUpperCase()}`);

  if (history.value.length > 10) {
    history.value = history.value.slice(-10);
  }
}

function reset() {
  currentState.value = 'idle';
  history.value = [];
  lastTransition.value = '';
  message.value = t('State machine reset to IDLE', '状态机已重置为 IDLE');
}

const edgeData = [
  { from: 'idle', to: 'loading', event: 'FETCH', curve: 0 },
  { from: 'loading', to: 'success', event: 'RESOLVE', curve: 0 },
  { from: 'loading', to: 'error', event: 'REJECT', curve: -20 },
  { from: 'error', to: 'loading', event: 'RETRY', curve: 20 },
  { from: 'success', to: 'idle', event: 'RESET', curve: 0 },
] as const;

function edgePath(from: State, to: State, curve: number): string {
  const p1 = statePositions[from];
  const p2 = statePositions[to];
  const mx = (p1.x + p2.x) / 2 + curve;
  const my = (p1.y + p2.y) / 2 + curve;
  return `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;
}

function edgeLabelPos(from: State, to: State, curve: number): { x: number; y: number } {
  const p1 = statePositions[from];
  const p2 = statePositions[to];
  return {
    x: (p1.x + p2.x) / 2 + curve * 0.7,
    y: (p1.y + p2.y) / 2 + curve * 0.7 - 8,
  };
}
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive State Machine', '交互式状态机') }}</div>

    <svg viewBox="0 0 380 280" class="sm-svg">
      <defs>
        <marker id="sm-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--viz-border)" />
        </marker>
        <marker id="sm-arrow-hl" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--viz-warning)" />
        </marker>
      </defs>

      <!-- Edges -->
      <g v-for="edge in edgeData" :key="edge.event">
        <path
          :d="edgePath(edge.from as State, edge.to as State, edge.curve)"
          fill="none"
          :stroke="lastTransition === `${edge.from}-${edge.event}-${edge.to}` ? 'var(--viz-warning)' : 'var(--viz-border)'"
          :stroke-width="lastTransition === `${edge.from}-${edge.event}-${edge.to}` ? 2.5 : 1.5"
          :marker-end="lastTransition === `${edge.from}-${edge.event}-${edge.to}` ? 'url(#sm-arrow-hl)' : 'url(#sm-arrow)'"
        />
        <text
          :x="edgeLabelPos(edge.from as State, edge.to as State, edge.curve).x"
          :y="edgeLabelPos(edge.from as State, edge.to as State, edge.curve).y"
          text-anchor="middle"
          fill="var(--viz-text)"
          font-size="9"
          font-family="var(--vp-font-family-mono)"
          font-weight="600"
        >{{ edge.event }}</text>
      </g>

      <!-- State nodes -->
      <g v-for="(pos, state) in statePositions" :key="state" :transform="`translate(${pos.x}, ${pos.y})`">
        <circle
          r="30"
          :fill="currentState === state ? stateColors[state as State] : 'var(--vp-c-bg)'"
          :stroke="stateColors[state as State]"
          stroke-width="2.5"
          :class="{ 'sm-node-active': currentState === state }"
        />
        <text
          text-anchor="middle"
          dominant-baseline="central"
          :fill="currentState === state ? '#fff' : 'var(--viz-text)'"
          font-size="11"
          font-weight="700"
          font-family="var(--vp-font-family-mono)"
        >{{ (state as string).toUpperCase() }}</text>
      </g>
    </svg>

    <!-- Event history -->
    <div v-if="history.length > 0" class="sm-history">
      <span class="viz-label">{{ t('Log:', '日志：') }}&nbsp;</span>
      <span
        v-for="(h, i) in history.slice(-6)"
        :key="i"
        class="sm-history-item"
      >{{ h.event }}</span>
    </div>

    <div class="viz-controls">
      <button
        v-for="event in allEvents"
        :key="event"
        class="viz-btn"
        :class="{
          'viz-btn--primary': availableEvents.includes(event),
          'viz-btn--disabled': !availableEvents.includes(event),
        }"
        :disabled="!availableEvents.includes(event)"
        @click="triggerEvent(event)"
      >{{ event }}</button>
      <button class="viz-btn viz-btn--danger" @click="reset">{{ t('Reset', '重置') }}</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.sm-svg {
  width: 100%;
  max-width: 400px;
  height: auto;
  display: block;
  margin: 0 auto;
  min-height: 200px;
}

.sm-node-active {
  animation: sm-pulse 0.5s ease;
}

.sm-history {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  padding: 0.5rem 0;
}

.sm-history-item {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
  background: var(--viz-bg);
  color: var(--viz-text);
  border: 1px solid var(--viz-border);
}

.viz-btn--disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@keyframes sm-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
</style>
