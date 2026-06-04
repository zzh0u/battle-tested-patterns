<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

interface Flyweight {
  glyph: string;
  font: string;
  style: string;
}

interface CharInstance {
  id: number;
  glyphKey: string;
  x: number;
  y: number;
  color: string;
}

const GLYPH_POOL: Record<string, Flyweight> = {
  A: { glyph: 'A', font: 'serif', style: 'bold' },
  B: { glyph: 'B', font: 'sans-serif', style: 'italic' },
  C: { glyph: 'C', font: 'monospace', style: 'bold' },
  D: { glyph: 'D', font: 'serif', style: 'normal' },
};

const GLYPH_KEYS = Object.keys(GLYPH_POOL);

const COLORS = [
  'var(--viz-primary)',
  'var(--viz-success)',
  'var(--viz-warning)',
  'var(--viz-danger)',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

let nextId = 0;

const instances = ref<CharInstance[]>([
  { id: nextId++, glyphKey: 'A', x: 20, y: 30, color: COLORS[0] },
  { id: nextId++, glyphKey: 'B', x: 60, y: 50, color: COLORS[1] },
  { id: nextId++, glyphKey: 'A', x: 40, y: 70, color: COLORS[2] },
]);

const message = ref(t('3 character instances share 2 flyweight objects. Add more to see reuse.', '3 个字符实例共享 2 个 Flyweight 对象。添加更多以查看复用。'));
const lastAddedId = ref(-1);

const usageCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const key of GLYPH_KEYS) {
    counts[key] = 0;
  }
  for (const inst of instances.value) {
    counts[inst.glyphKey]++;
  }
  return counts;
});

const activeFlyweights = computed(() => {
  return GLYPH_KEYS.filter(key => usageCounts.value[key] > 0);
});

const totalInstances = computed(() => instances.value.length);

const flyweightCount = computed(() => activeFlyweights.value.length);

const memorySaved = computed(() => {
  const total = totalInstances.value;
  const shared = flyweightCount.value;
  if (total === 0) return 0;
  return Math.round((1 - shared / total) * 100);
});

function randomInRange(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function addCharacter() {
  const glyphKey = GLYPH_KEYS[Math.floor(Math.random() * GLYPH_KEYS.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const x = randomInRange(5, 90);
  const y = randomInRange(10, 85);
  const id = nextId++;

  instances.value.push({ id, glyphKey, x, y, color });
  lastAddedId.value = id;

  const isReuse = usageCounts.value[glyphKey] > 1;
  if (isReuse) {
    message.value = t(
      `Added "${glyphKey}" at (${x}, ${y}) — reused existing flyweight. No new glyph object created.`,
      `已添加 "${glyphKey}" 在 (${x}, ${y}) — 复用已有 Flyweight，未创建新字形对象。`
    );
  } else {
    message.value = t(
      `Added "${glyphKey}" at (${x}, ${y}) — first use of this glyph flyweight.`,
      `已添加 "${glyphKey}" 在 (${x}, ${y}) — 首次使用此字形 Flyweight。`
    );
  }
}

function reset() {
  nextId = 0;
  instances.value = [
    { id: nextId++, glyphKey: 'A', x: 20, y: 30, color: COLORS[0] },
    { id: nextId++, glyphKey: 'B', x: 60, y: 50, color: COLORS[1] },
    { id: nextId++, glyphKey: 'A', x: 40, y: 70, color: COLORS[2] },
  ];
  lastAddedId.value = -1;
  message.value = t('Reset — 3 instances sharing 2 flyweight objects.', '已重置 — 3 个实例共享 2 个 Flyweight 对象。');
}

function getFlyweight(key: string): Flyweight {
  return GLYPH_POOL[key];
}
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive Flyweight', '交互式 Flyweight') }}</div>

    <!-- Memory comparison -->
    <div class="fw-stats">
      <div class="fw-stat">
        <span class="fw-stat-label">{{ t('Without sharing:', '不共享:') }}</span>
        <span class="fw-stat-value fw-stat-wasteful">{{ totalInstances }} {{ t('objects', '个对象') }}</span>
      </div>
      <div class="fw-stat">
        <span class="fw-stat-label">{{ t('With flyweight:', '使用 Flyweight:') }}</span>
        <span class="fw-stat-value fw-stat-efficient">{{ flyweightCount }} {{ t('objects', '个对象') }}</span>
      </div>
      <div class="fw-stat fw-stat-highlight">
        <span class="fw-stat-label">{{ t('Memory saved:', '节省内存:') }}</span>
        <span class="fw-stat-value fw-stat-saved">{{ memorySaved }}%</span>
      </div>
    </div>

    <div class="fw-layout">
      <!-- Flyweight pool -->
      <div class="fw-pool">
        <div class="fw-section-label">{{ t('Flyweight Pool (intrinsic state)', 'Flyweight 池（内在状态）') }}</div>
        <div class="fw-pool-items">
          <div
            v-for="key in GLYPH_KEYS"
            :key="key"
            class="fw-pool-item"
            :class="{ 'fw-pool-item--active': usageCounts[key] > 0 }"
          >
            <div
              class="fw-glyph"
              :style="{
                fontFamily: getFlyweight(key).font,
                fontStyle: getFlyweight(key).style === 'italic' ? 'italic' : 'normal',
                fontWeight: getFlyweight(key).style === 'bold' ? 700 : 400,
              }"
            >{{ key }}</div>
            <div class="fw-pool-meta">
              <div class="fw-pool-font">{{ getFlyweight(key).font }}</div>
              <div class="fw-pool-style">{{ getFlyweight(key).style }}</div>
            </div>
            <div class="fw-pool-count" :class="{ 'fw-pool-count--zero': usageCounts[key] === 0 }">
              {{ usageCounts[key] }}x
            </div>
          </div>
        </div>
      </div>

      <!-- Canvas showing instances -->
      <div class="fw-canvas-section">
        <div class="fw-section-label">{{ t(`Canvas — ${totalInstances} instances (extrinsic state)`, `画布 — ${totalInstances} 个实例（外在状态）`) }}</div>
        <div class="fw-canvas">
          <div
            v-for="inst in instances"
            :key="inst.id"
            class="fw-char"
            :class="{ 'fw-char-new': inst.id === lastAddedId }"
            :style="{
              left: inst.x + '%',
              top: inst.y + '%',
              color: inst.color,
              fontFamily: getFlyweight(inst.glyphKey).font,
              fontStyle: getFlyweight(inst.glyphKey).style === 'italic' ? 'italic' : 'normal',
              fontWeight: getFlyweight(inst.glyphKey).style === 'bold' ? 700 : 400,
            }"
            :title="`'${inst.glyphKey}' at (${inst.x}, ${inst.y})`"
          >{{ inst.glyphKey }}</div>
          <div v-if="instances.length === 0" class="fw-canvas-empty">
            {{ t('Canvas is empty. Add characters to see the flyweight pattern.', '画布为空。添加字符以查看 Flyweight 模式。') }}
          </div>
        </div>
      </div>
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="addCharacter">{{ t('Add Character', '添加字符') }}</button>
      <button class="viz-btn viz-btn--danger" @click="reset">{{ t('Reset', '重置') }}</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.fw-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.fw-stat {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--viz-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 0.8rem;
}

.fw-stat-label {
  color: var(--viz-muted);
  font-size: 0.75rem;
}

.fw-stat-value {
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
}

.fw-stat-wasteful {
  color: var(--viz-danger);
  text-decoration: line-through;
  opacity: 0.7;
}

.fw-stat-efficient {
  color: var(--viz-success);
}

.fw-stat-highlight {
  border-color: var(--viz-success);
}

.fw-stat-saved {
  color: var(--viz-success);
}

.fw-layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

@media (max-width: 640px) {
  .fw-layout {
    flex-direction: column;
    align-items: stretch;
  }
}

.fw-section-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--viz-muted);
  margin-bottom: 0.5rem;
}

/* Flyweight Pool */
.fw-pool {
  flex: 0 0 auto;
  min-width: 160px;
}

.fw-pool-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fw-pool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.4rem 0.6rem;
  border: 2px solid var(--viz-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  opacity: 0.45;
  transition: all 0.2s ease;
}

.fw-pool-item--active {
  opacity: 1;
  border-color: var(--viz-primary);
}

.fw-glyph {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: var(--viz-text);
  background: var(--viz-bg);
  border: 1px solid var(--viz-border);
  border-radius: 4px;
}

.fw-pool-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.fw-pool-font {
  font-size: 0.65rem;
  color: var(--viz-text);
  font-family: var(--vp-font-family-mono);
}

.fw-pool-style {
  font-size: 0.6rem;
  color: var(--viz-muted);
}

.fw-pool-count {
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-primary);
  min-width: 24px;
  text-align: right;
}

.fw-pool-count--zero {
  color: var(--viz-muted);
}

/* Canvas */
.fw-canvas-section {
  flex: 1;
  min-width: 0;
}

.fw-canvas {
  position: relative;
  width: 100%;
  height: 220px;
  border: 1px solid var(--viz-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  overflow: hidden;
}

.fw-char {
  position: absolute;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
  cursor: default;
  transition: transform 0.15s ease;
  transform: translate(-50%, -50%);
}

.fw-char:hover {
  transform: translate(-50%, -50%) scale(1.4);
}

.fw-char-new {
  animation: fw-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fw-canvas-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--viz-muted);
  font-size: 0.8rem;
}

@keyframes fw-pop-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.3);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
