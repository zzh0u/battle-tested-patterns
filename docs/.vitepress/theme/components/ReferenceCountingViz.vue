<script setup lang="ts">
import { ref, computed } from 'vue';

interface RCObject {
  id: number;
  name: string;
  refCount: number;
  freed: boolean;
}

interface Reference {
  from: string;
  toId: number;
  color: string;
}

let nextObjId = 1;

const objects = ref<RCObject[]>([
  { id: nextObjId++, name: 'Obj A', refCount: 2, freed: false },
  { id: nextObjId++, name: 'Obj B', refCount: 1, freed: false },
]);

const references = ref<Reference[]>([
  { from: 'var x', toId: 1, color: 'var(--viz-primary)' },
  { from: 'var y', toId: 1, color: 'var(--viz-success)' },
  { from: 'var z', toId: 2, color: 'var(--viz-warning)' },
]);

const message = ref('Drop references to decrement ref counts. Objects are freed at rc=0');
const lastFreed = ref(-1);

function dropRef(refIdx: number) {
  const r = references.value[refIdx];
  const obj = objects.value.find(o => o.id === r.toId);
  if (!obj || obj.freed) return;

  references.value = references.value.filter((_, i) => i !== refIdx);
  obj.refCount--;

  if (obj.refCount <= 0) {
    obj.freed = true;
    lastFreed.value = obj.id;
    message.value = `Dropped ${r.from} → ${obj.name} — rc=0, FREED!`;
    setTimeout(() => { lastFreed.value = -1; }, 600);
  } else {
    message.value = `Dropped ${r.from} → ${obj.name} — rc=${obj.refCount}`;
  }
}

function addRef() {
  const liveObjs = objects.value.filter(o => !o.freed);
  if (liveObjs.length === 0) {
    message.value = 'No live objects to reference';
    return;
  }
  const target = liveObjs[Math.floor(Math.random() * liveObjs.length)];
  const varName = `var ${String.fromCharCode(97 + references.value.length)}`;
  const colors = ['var(--viz-primary)', 'var(--viz-success)', 'var(--viz-warning)', 'var(--viz-danger)'];
  const color = colors[references.value.length % colors.length];

  references.value = [...references.value, { from: varName, toId: target.id, color }];
  target.refCount++;
  message.value = `Added ${varName} → ${target.name} — rc=${target.refCount}`;
}

function addObject() {
  if (objects.value.filter(o => !o.freed).length >= 5) {
    message.value = 'Maximum 5 live objects';
    return;
  }
  const obj: RCObject = { id: nextObjId++, name: `Obj ${String.fromCharCode(64 + nextObjId - 1)}`, refCount: 0, freed: false };
  objects.value = [...objects.value, obj];
  message.value = `Created ${obj.name} with rc=0 — add a reference or it stays unreachable`;
}

function reset() {
  nextObjId = 1;
  objects.value = [
    { id: nextObjId++, name: 'Obj A', refCount: 2, freed: false },
    { id: nextObjId++, name: 'Obj B', refCount: 1, freed: false },
  ];
  references.value = [
    { from: 'var x', toId: 1, color: 'var(--viz-primary)' },
    { from: 'var y', toId: 1, color: 'var(--viz-success)' },
    { from: 'var z', toId: 2, color: 'var(--viz-warning)' },
  ];
  lastFreed.value = -1;
  message.value = 'Reset — drop references to see ref counting in action';
}

const liveCount = computed(() => objects.value.filter(o => !o.freed).length);
const freedCount = computed(() => objects.value.filter(o => o.freed).length);
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">Interactive Reference Counting</div>

    <div class="rc-layout">
      <!-- References -->
      <div class="rc-refs">
        <div class="rc-section-title">Variables</div>
        <div
          v-for="(r, i) in references"
          :key="i"
          class="rc-ref"
          :style="{ borderColor: r.color }"
          @click="dropRef(i)"
        >
          <span class="rc-ref-name" :style="{ color: r.color }">{{ r.from }}</span>
          <span class="rc-ref-arrow">→</span>
          <span class="rc-ref-target">{{ objects.find(o => o.id === r.toId)?.name }}</span>
        </div>
        <div v-if="references.length === 0" class="rc-empty">no references</div>
        <div class="rc-hint">Click to drop</div>
      </div>

      <!-- Objects -->
      <div class="rc-objects">
        <div class="rc-section-title">Heap Objects</div>
        <div
          v-for="obj in objects"
          :key="obj.id"
          class="rc-object"
          :class="{
            'rc-object-freed': obj.freed,
            'rc-object-freeing': lastFreed === obj.id,
          }"
        >
          <span class="rc-obj-name">{{ obj.name }}</span>
          <span class="rc-obj-rc" :class="{ 'rc-obj-rc-zero': obj.refCount <= 0 }">
            rc={{ obj.refCount }}
          </span>
          <span v-if="obj.freed" class="rc-freed-badge">FREED</span>
        </div>
      </div>
    </div>

    <div class="rc-stats">
      <span class="rc-stat">Live: <strong>{{ liveCount }}</strong></span>
      <span class="rc-stat">Freed: <strong style="color: var(--viz-danger)">{{ freedCount }}</strong></span>
      <span class="rc-stat">Refs: <strong>{{ references.length }}</strong></span>
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="addRef">+ Reference</button>
      <button class="viz-btn" @click="addObject">+ Object</button>
      <button class="viz-btn viz-btn--danger" @click="reset">Reset</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.rc-layout {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
}

@media (max-width: 640px) {
  .rc-layout { flex-direction: column; }
}

.rc-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--viz-muted);
  margin-bottom: 6px;
}

.rc-refs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.rc-ref {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 2px solid;
  border-radius: 6px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  transition: all 0.15s;
}

.rc-ref:hover {
  opacity: 0.7;
  transform: scale(0.97);
}

.rc-ref-name {
  font-weight: 700;
}

.rc-ref-arrow {
  color: var(--viz-muted);
}

.rc-ref-target {
  color: var(--viz-text);
}

.rc-hint {
  font-size: 0.6rem;
  color: var(--viz-muted);
  font-style: italic;
  text-align: center;
}

.rc-objects {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rc-object {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid var(--viz-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  transition: all 0.3s;
}

.rc-object-freed {
  opacity: 0.3;
  background: rgba(239, 68, 68, 0.05);
  text-decoration: line-through;
}

.rc-object-freeing {
  animation: rc-free 0.5s ease;
}

.rc-obj-name {
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-text);
}

.rc-obj-rc {
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-muted);
}

.rc-obj-rc-zero {
  color: var(--viz-danger);
  font-weight: 700;
}

.rc-freed-badge {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--viz-danger);
  margin-left: auto;
}

.rc-empty {
  font-size: 0.7rem;
  color: var(--viz-muted);
  font-style: italic;
}

.rc-stats {
  display: flex;
  gap: 1rem;
  padding: 0.3rem 0;
  justify-content: center;
}

.rc-stat {
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-text);
}

@keyframes rc-free {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.5; background: rgba(239, 68, 68, 0.2); }
  100% { transform: scale(1); opacity: 0.3; }
}
</style>
