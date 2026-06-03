<script setup lang="ts">
import { ref, computed } from 'vue';

interface Entity {
  id: number;
  name: string;
  x: number;
  y: number;
  dirty: boolean;
  lastComputed: string;
}

let nextId = 1;

const entities = ref<Entity[]>([
  { id: nextId++, name: 'Player', x: 100, y: 80, dirty: false, lastComputed: '(100,80)' },
  { id: nextId++, name: 'Enemy', x: 200, y: 60, dirty: false, lastComputed: '(200,60)' },
  { id: nextId++, name: 'NPC', x: 300, y: 100, dirty: false, lastComputed: '(300,100)' },
]);

const message = ref('Move entities to mark them dirty, then recompute only what changed');
const recomputeCount = ref(0);
const skipCount = ref(0);

function moveEntity(idx: number) {
  const e = entities.value[idx];
  e.x = Math.round(50 + Math.random() * 280);
  e.y = Math.round(30 + Math.random() * 100);
  e.dirty = true;
  message.value = `${e.name} moved to (${e.x},${e.y}) — marked DIRTY`;
}

function recompute() {
  let computed = 0;
  let skipped = 0;

  for (const e of entities.value) {
    if (e.dirty) {
      e.lastComputed = `(${e.x},${e.y})`;
      e.dirty = false;
      computed++;
    } else {
      skipped++;
    }
  }

  recomputeCount.value += computed;
  skipCount.value += skipped;
  message.value = `Recomputed: ${computed} dirty | Skipped: ${skipped} clean — total saved: ${skipCount.value}`;
}

function recomputeAll() {
  for (const e of entities.value) {
    e.lastComputed = `(${e.x},${e.y})`;
    e.dirty = false;
  }
  recomputeCount.value += entities.value.length;
  message.value = `Recomputed ALL ${entities.value.length} entities (no dirty flag optimization)`;
}

function reset() {
  nextId = 1;
  entities.value = [
    { id: nextId++, name: 'Player', x: 100, y: 80, dirty: false, lastComputed: '(100,80)' },
    { id: nextId++, name: 'Enemy', x: 200, y: 60, dirty: false, lastComputed: '(200,60)' },
    { id: nextId++, name: 'NPC', x: 300, y: 100, dirty: false, lastComputed: '(300,100)' },
  ];
  recomputeCount.value = 0;
  skipCount.value = 0;
  message.value = 'Reset — move entities and recompute';
}

const dirtyCount = computed(() => entities.value.filter(e => e.dirty).length);
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">Interactive Dirty Flag</div>

    <svg viewBox="0 0 380 150" class="df-svg">
      <g v-for="(e, i) in entities" :key="e.id">
        <circle
          :cx="e.x"
          :cy="e.y"
          r="20"
          :fill="e.dirty ? 'var(--viz-warning)' : 'var(--viz-success)'"
          stroke="#fff"
          stroke-width="2"
          style="cursor: pointer; transition: all 0.3s"
          @click="moveEntity(i)"
        />
        <text
          :x="e.x"
          :y="e.y - 1"
          text-anchor="middle"
          dominant-baseline="central"
          fill="#fff"
          font-size="10"
          font-weight="700"
          font-family="var(--vp-font-family-mono)"
          style="pointer-events: none"
        >{{ e.name }}</text>
        <text
          v-if="e.dirty"
          :x="e.x + 16"
          :y="e.y - 16"
          fill="var(--viz-danger)"
          font-size="12"
          font-weight="700"
        >*</text>
        <text
          :x="e.x"
          :y="e.y + 30"
          text-anchor="middle"
          fill="var(--viz-muted)"
          font-size="8"
          font-family="var(--vp-font-family-mono)"
        >cached: {{ e.lastComputed }}</text>
      </g>
    </svg>

    <div class="df-stats">
      <span class="df-stat">Dirty: <strong :style="{ color: dirtyCount > 0 ? 'var(--viz-warning)' : 'var(--viz-success)' }">{{ dirtyCount }}</strong></span>
      <span class="df-stat">Recomputed: <strong>{{ recomputeCount }}</strong></span>
      <span class="df-stat">Skipped: <strong style="color: var(--viz-success)">{{ skipCount }}</strong></span>
    </div>

    <div class="df-hint">Click entities to move them (marks dirty)</div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="recompute">Recompute (dirty only)</button>
      <button class="viz-btn" @click="recomputeAll">Recompute ALL (no optimization)</button>
      <button class="viz-btn viz-btn--danger" @click="reset">Reset</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.df-svg {
  width: 100%;
  max-width: 400px;
  height: auto;
  display: block;
  margin: 0 auto;
  min-height: 120px;
  background: var(--viz-cell-empty);
  border-radius: 8px;
}

.df-stats {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  flex-wrap: wrap;
  justify-content: center;
}

.df-stat {
  font-size: 0.75rem;
  color: var(--viz-text);
  font-family: var(--vp-font-family-mono);
}

.df-hint {
  font-size: 0.65rem;
  color: var(--viz-muted);
  text-align: center;
}
</style>
