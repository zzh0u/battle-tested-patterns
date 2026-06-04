<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../composables/useI18n';
const { t } = useI18n();

interface LogEntry {
  lsn: number;
  op: string;
  data: string;
  flushed: boolean;
}

interface TableRow {
  key: string;
  value: string;
}

let nextLSN = 1;

const log = ref<LogEntry[]>([]);
const table = ref<TableRow[]>([]);
const message = ref(t('Write operations go to WAL first, then to the table', '写入操作先进入 WAL，然后再写入表'));
const crashed = ref(false);
const lastAction = ref('');

function writeOp(key: string, value: string) {
  if (crashed.value) {
    message.value = t('System crashed! Click "Recover" to replay the WAL', '系统已崩溃！点击"恢复"重放 WAL');
    return;
  }
  const entry: LogEntry = {
    lsn: nextLSN++,
    op: 'SET',
    data: `${key}=${value}`,
    flushed: false,
  };
  log.value = [...log.value, entry];
  lastAction.value = `write-${entry.lsn}`;
  message.value = t(`WAL: logged SET ${key}=${value} (LSN ${entry.lsn}) — not yet applied`, `WAL：已记录 SET ${key}=${value} (LSN ${entry.lsn}) — 尚未应用`);
}

function flush() {
  if (crashed.value) {
    message.value = t('System crashed! Recover first', '系统已崩溃！请先恢复');
    return;
  }
  const unflushed = log.value.filter(e => !e.flushed);
  if (unflushed.length === 0) {
    message.value = t('Nothing to flush — WAL is clean', '无需刷写 — WAL 已是最新');
    return;
  }

  for (const entry of unflushed) {
    const [key, value] = entry.data.split('=');
    const existing = table.value.find(r => r.key === key);
    if (existing) {
      existing.value = value;
    } else {
      table.value = [...table.value, { key, value }];
    }
    entry.flushed = true;
  }
  lastAction.value = 'flush';
  message.value = t(`Flushed ${unflushed.length} entries to table`, `已刷写 ${unflushed.length} 条记录到表`);
}

function simulateCrash() {
  const unflushed = log.value.filter(e => !e.flushed);
  table.value = table.value.filter(r => {
    return !unflushed.some(e => e.data.startsWith(r.key + '='));
  });
  crashed.value = true;
  lastAction.value = 'crash';
  message.value = t(`CRASH! ${unflushed.length} unflushed entries in WAL — data lost from table`, `崩溃！WAL 中有 ${unflushed.length} 条未刷写记录 — 数据从表中丢失`);
}

function recover() {
  if (!crashed.value) return;
  const unflushed = log.value.filter(e => !e.flushed);
  for (const entry of unflushed) {
    const [key, value] = entry.data.split('=');
    const existing = table.value.find(r => r.key === key);
    if (existing) {
      existing.value = value;
    } else {
      table.value = [...table.value, { key, value }];
    }
    entry.flushed = true;
  }
  crashed.value = false;
  lastAction.value = 'recover';
  message.value = t(`Recovered! Replayed ${unflushed.length} WAL entries — data restored`, `已恢复！重放了 ${unflushed.length} 条 WAL 记录 — 数据已还原`);
}

function reset() {
  nextLSN = 1;
  log.value = [];
  table.value = [];
  crashed.value = false;
  lastAction.value = '';
  message.value = t('Reset — start writing operations', '已重置 — 开始写入操作');
}

const presets = [
  { key: 'name', value: 'Alice' },
  { key: 'age', value: '30' },
  { key: 'city', value: 'NYC' },
  { key: 'name', value: 'Bob' },
];
let presetIdx = 0;

function autoWrite() {
  const p = presets[presetIdx % presets.length];
  presetIdx++;
  writeOp(p.key, p.value);
}
</script>

<template>
  <div class="viz-container">
    <div class="viz-title">{{ t('Interactive Write-Ahead Log', '交互式 Write-Ahead Log') }}</div>

    <div class="wal-layout">
      <!-- WAL -->
      <div class="wal-section">
        <div class="wal-section-title">{{ t('WAL (on disk)', 'WAL（磁盘）') }}</div>
        <div class="wal-entries">
          <div
            v-for="entry in log"
            :key="entry.lsn"
            class="wal-entry"
            :class="{
              'wal-entry-flushed': entry.flushed,
              'wal-entry-new': lastAction === 'write-' + entry.lsn,
            }"
          >
            <span class="wal-lsn">{{ entry.lsn }}</span>
            <span class="wal-op">{{ entry.op }}</span>
            <span class="wal-data">{{ entry.data }}</span>
            <span class="wal-flush-badge" :class="entry.flushed ? 'wal-yes' : 'wal-no'">
              {{ entry.flushed ? '✓' : '○' }}
            </span>
          </div>
          <div v-if="log.length === 0" class="wal-empty">{{ t('empty', '空') }}</div>
        </div>
      </div>

      <!-- Arrow -->
      <div class="wal-arrow">
        <span v-if="!crashed">{{ t('flush →', '刷写 →') }}</span>
        <span v-else class="wal-crash-label">{{ t('CRASH ✗', '崩溃 ✗') }}</span>
      </div>

      <!-- Table -->
      <div class="wal-section">
        <div class="wal-section-title">{{ t('Table (in memory)', '表（内存）') }}</div>
        <div class="wal-table">
          <div v-for="row in table" :key="row.key" class="wal-row">
            <span class="wal-key">{{ row.key }}</span>
            <span class="wal-value">{{ row.value }}</span>
          </div>
          <div v-if="table.length === 0" class="wal-empty">{{ t('empty', '空') }}</div>
        </div>
      </div>
    </div>

    <div class="viz-controls">
      <button class="viz-btn viz-btn--primary" @click="autoWrite" :disabled="crashed">{{ t('Write', '写入') }}</button>
      <button class="viz-btn" @click="flush" :disabled="crashed">{{ t('Flush to Table', '刷写到表') }}</button>
      <button class="viz-btn viz-btn--danger" @click="simulateCrash" :disabled="crashed || log.length === 0">{{ t('Crash!', '崩溃！') }}</button>
      <button v-if="crashed" class="viz-btn viz-btn--primary" @click="recover">{{ t('Recover', '恢复') }}</button>
      <button class="viz-btn viz-btn--danger" @click="reset">{{ t('Reset', '重置') }}</button>
    </div>

    <div class="viz-status" :class="{ 'wal-crash-status': crashed }">{{ message }}</div>
  </div>
</template>

<style scoped>
.wal-layout {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 0;
}

@media (max-width: 640px) {
  .wal-layout { flex-direction: column; align-items: stretch; }
}

.wal-section {
  flex: 1;
  border: 1px solid var(--viz-border);
  border-radius: 8px;
  padding: 0.5rem;
  background: var(--vp-c-bg);
}

.wal-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--viz-muted);
  margin-bottom: 6px;
}

.wal-entries {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 60px;
}

.wal-entry {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid transparent;
}

.wal-entry-flushed {
  opacity: 0.5;
  background: rgba(16, 185, 129, 0.08);
}

.wal-entry-new {
  animation: wal-appear 0.3s ease;
  border-color: var(--viz-primary);
}

.wal-lsn {
  color: var(--viz-muted);
  min-width: 16px;
}

.wal-op {
  font-weight: 700;
  color: var(--viz-primary);
}

.wal-data {
  color: var(--viz-text);
  flex: 1;
}

.wal-flush-badge {
  font-size: 0.75rem;
}

.wal-yes { color: var(--viz-success); }
.wal-no { color: var(--viz-warning); }

.wal-arrow {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  color: var(--viz-muted);
  padding-top: 2rem;
  white-space: nowrap;
}

.wal-crash-label {
  color: var(--viz-danger);
  font-weight: 700;
}

.wal-table {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 60px;
}

.wal-row {
  display: flex;
  gap: 8px;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: var(--vp-font-family-mono);
  background: rgba(16, 185, 129, 0.08);
}

.wal-key {
  font-weight: 700;
  color: var(--viz-text);
  min-width: 40px;
}

.wal-value {
  color: var(--viz-success);
}

.wal-empty {
  font-size: 0.7rem;
  color: var(--viz-muted);
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.wal-crash-status {
  color: var(--viz-danger) !important;
  font-weight: 700;
}

@keyframes wal-appear {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
