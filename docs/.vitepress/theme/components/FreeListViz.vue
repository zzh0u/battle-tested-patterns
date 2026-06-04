<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

const BLOCK_COUNT = 8;

interface Block {
  id: number;
  allocated: boolean;
  label: string;
}

const blocks = ref<Block[]>(
  Array.from({ length: BLOCK_COUNT }, (_, i) => ({
    id: i,
    allocated: false,
    label: '',
  }))
);

const message = ref(t('All blocks free — click "Allocate" to claim one', '所有块空闲 — 点击"分配"来占用一个'));
let allocCounter = 0;
const allocLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const freeList = computed(() => {
  return blocks.value.filter(b => !b.allocated).map(b => b.id);
});

const freeHead = computed(() => {
  return freeList.value.length > 0 ? freeList.value[0] : null;
});

const allocatedCount = computed(() => blocks.value.filter(b => b.allocated).length);
const freeCount = computed(() => blocks.value.filter(b => !b.allocated).length);

function allocate() {
  const freeIdx = blocks.value.findIndex(b => !b.allocated);
  if (freeIdx < 0) {
    message.value = t('No free blocks — free one first!', '没有空闲块 — 请先释放一个！');
    return;
  }
  const label = allocLabels[allocCounter % allocLabels.length];
  allocCounter++;
  blocks.value[freeIdx].allocated = true;
  blocks.value[freeIdx].label = label;
  message.value = t(
    `Allocated block ${freeIdx} as "${label}" — head moved to ${freeHead.value ?? 'null'}`,
    `已分配块 ${freeIdx} 为 "${label}" — head 移至 ${freeHead.value ?? 'null'}`
  );
}

function freeBlock(id: number) {
  const block = blocks.value[id];
  if (!block.allocated) {
    message.value = t(`Block ${id} is already free`, `块 ${id} 已经是空闲的`);
    return;
  }
  const oldLabel = block.label;
  block.allocated = false;
  block.label = '';
  message.value = t(
    `Freed block ${id} ("${oldLabel}") — returned to free list, head is ${freeHead.value}`,
    `已释放块 ${id}（"${oldLabel}"）— 已归还到 Free List，head 为 ${freeHead.value}`
  );
}

function reset() {
  blocks.value = Array.from({ length: BLOCK_COUNT }, (_, i) => ({
    id: i,
    allocated: false,
    label: '',
  }));
  allocCounter = 0;
  message.value = t('All blocks freed', '所有块已释放');
}

function freeListArrowTarget(idx: number): number | null {
  const fl = freeList.value;
  const pos = fl.indexOf(idx);
  if (pos >= 0 && pos < fl.length - 1) {
    return fl[pos + 1];
  }
  return null;
}
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive Free List', '交互式 Free List') }}</div>

    <div class="fl-info">
      <span class="fl-tag fl-tag--head">
        head &rarr; {{ freeHead !== null ? `${t('block', '块')} ${freeHead}` : 'null' }}
      </span>
      <span class="fl-tag">{{ t('allocated', '已分配') }}: {{ allocatedCount }}</span>
      <span class="fl-tag">{{ t('free', '空闲') }}: {{ freeCount }}</span>
    </div>

    <div class="fl-memory">
      <div
        v-for="block in blocks"
        :key="block.id"
        class="fl-block"
        :class="{
          'fl-block--allocated': block.allocated,
          'fl-block--head': freeHead === block.id,
        }"
        @click="block.allocated ? freeBlock(block.id) : undefined"
        :title="block.allocated ? t('Click to free', '点击释放') : t('Free block', '空闲块')"
      >
        <div class="fl-block-id">{{ block.id }}</div>
        <div class="fl-block-content">
          <template v-if="block.allocated">{{ block.label }}</template>
          <template v-else>{{ t('free', '空闲') }}</template>
        </div>
      </div>
    </div>

    <div class="fl-chain">
      <span class="fl-chain-label">{{ t('Free list:', 'Free List:') }}</span>
      <template v-if="freeList.length > 0">
        <span class="fl-chain-item fl-chain-head">head</span>
        <template v-for="(id, i) in freeList" :key="'fl-' + id">
          <svg class="fl-chain-arrow" viewBox="0 0 20 12" width="20" height="12">
            <path d="M0 6 L14 6 M10 2 L14 6 L10 10" stroke="var(--viz-primary)" stroke-width="1.5" fill="none"/>
          </svg>
          <span class="fl-chain-item">{{ id }}</span>
        </template>
        <svg class="fl-chain-arrow" viewBox="0 0 20 12" width="20" height="12">
          <path d="M0 6 L14 6 M10 2 L14 6 L10 10" stroke="var(--viz-muted)" stroke-width="1.5" fill="none"/>
        </svg>
        <span class="fl-chain-item fl-chain-null">null</span>
      </template>
      <template v-else>
        <span class="fl-chain-item fl-chain-null">{{ t('empty (all allocated)', '空（全部已分配）') }}</span>
      </template>
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="allocate">{{ t('Allocate', '分配') }}</button>
      <button class="viz-btn viz-btn--danger" @click="reset">{{ t('Reset', '重置') }}</button>
    </div>

    <div class="viz-status">{{ message }}</div>
  </div>
</template>

<style scoped>
.fl-info {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.fl-tag {
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-text);
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--viz-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
}

.fl-tag--head {
  border-color: var(--viz-primary);
  color: var(--viz-primary);
  font-weight: 600;
}

.fl-memory {
  display: flex;
  gap: 2px;
  padding: 0.75rem 0;
  overflow-x: auto;
}

.fl-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 52px;
  flex: 1;
  border: 2px solid var(--viz-border);
  border-radius: 6px;
  padding: 0.375rem 0.25rem;
  background: var(--vp-c-bg);
  transition: all 0.2s ease;
  cursor: default;
}

.fl-block--allocated {
  border-color: var(--viz-cell-filled);
  background: var(--viz-cell-filled);
  cursor: pointer;
}

.fl-block--allocated:hover {
  opacity: 0.85;
}

.fl-block--head {
  border-color: var(--viz-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.fl-block-id {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--viz-muted);
  font-family: var(--vp-font-family-mono);
  margin-bottom: 2px;
}

.fl-block--allocated .fl-block-id {
  color: rgba(255, 255, 255, 0.7);
}

.fl-block-content {
  font-size: 0.8125rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  color: var(--viz-text);
}

.fl-block--allocated .fl-block-content {
  color: #fff;
}

.fl-chain {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0;
  overflow-x: auto;
  flex-wrap: nowrap;
}

.fl-chain-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--viz-muted);
  margin-right: 0.25rem;
  white-space: nowrap;
}

.fl-chain-item {
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--vp-font-family-mono);
  padding: 0.15rem 0.4rem;
  border: 1px solid var(--viz-primary);
  border-radius: 4px;
  color: var(--viz-primary);
  background: var(--vp-c-bg);
  white-space: nowrap;
}

.fl-chain-head {
  background: var(--viz-primary);
  color: #fff;
}

.fl-chain-null {
  border-color: var(--viz-muted);
  color: var(--viz-muted);
  font-style: italic;
}

.fl-chain-arrow {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .fl-block {
    min-width: 40px;
    padding: 0.25rem 0.15rem;
  }
  .fl-block-content {
    font-size: 0.6875rem;
  }
}
</style>
