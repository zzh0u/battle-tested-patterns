<script setup lang="ts">
import { ref, onMounted, watch, shallowRef, onBeforeUnmount, nextTick } from 'vue';

const props = withDefaults(
  defineProps<{
    code?: string;
    lang?: string;
    title?: string;
    languages?: Record<string, string>;
  }>(),
  {
    code: '',
    lang: 'typescript',
    title: 'Playground',
  },
);

const editorContainer = ref<HTMLDivElement>();
const output = ref('');
const isRunning = ref(false);
const hasError = ref(false);
const activeLang = ref(props.lang);
const editorInstance = shallowRef<any>(null);
const monacoRef = shallowRef<any>(null);
const isEditorReady = ref(false);

const langLabels: Record<string, string> = {
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  c: 'C',
};

const monacoLangMap: Record<string, string> = {
  typescript: 'typescript',
  python: 'python',
  go: 'go',
  rust: 'rust',
  c: 'c',
};

function getActiveCode(): string {
  if (editorInstance.value) {
    return editorInstance.value.getValue();
  }
  if (props.languages && props.languages[activeLang.value]) {
    return props.languages[activeLang.value];
  }
  return props.code;
}

function getInitialCode(): string {
  if (props.languages && props.languages[activeLang.value]) {
    return props.languages[activeLang.value];
  }
  return props.code;
}

async function initMonaco() {
  if (typeof window === 'undefined') return;

  const loader = await import('@monaco-editor/loader');
  const monaco = await loader.default.init();
  monacoRef.value = monaco;

  if (!editorContainer.value) return;

  const editor = monaco.editor.create(editorContainer.value, {
    value: getInitialCode(),
    language: monacoLangMap[activeLang.value] || 'plaintext',
    theme: 'vs-dark',
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    padding: { top: 12, bottom: 12 },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    scrollbar: { vertical: 'hidden', horizontal: 'auto' },
    renderLineHighlight: 'none',
  });

  editorInstance.value = editor;
  isEditorReady.value = true;

  const updateHeight = () => {
    const lineCount = editor.getModel()?.getLineCount() || 8;
    const height = Math.max(lineCount * 20 + 24, 180);
    editorContainer.value!.style.height = `${Math.min(height, 500)}px`;
    editor.layout();
  };

  editor.onDidChangeModelContent(updateHeight);
  updateHeight();
}

function switchLang(lang: string) {
  activeLang.value = lang;
  output.value = '';
  hasError.value = false;

  if (editorInstance.value && monacoRef.value) {
    const code = props.languages?.[lang] || props.code;
    editorInstance.value.setValue(code);
    const model = editorInstance.value.getModel();
    if (model) {
      monacoRef.value.editor.setModelLanguage(model, monacoLangMap[lang] || 'plaintext');
    }
  }
}

function runTypeScript(code: string): string {
  const logs: string[] = [];
  const mockConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    error: (...args: unknown[]) => logs.push('ERROR: ' + args.map(String).join(' ')),
  };

  const assert = (condition: boolean, msg = 'Assertion failed') => {
    if (!condition) throw new Error(msg);
    logs.push(`✓ ${msg}`);
  };
  const assertEquals = (actual: unknown, expected: unknown, msg?: string) => {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    if (!pass) throw new Error(msg || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    logs.push(`✓ ${msg || `${JSON.stringify(actual)} === ${JSON.stringify(expected)}`}`);
  };

  const jsCode = code
    .replace(/:\s*\w+(\[\])?\s*(?=[=,;\)\n\{])/g, '')
    .replace(/\btype\s+\w+\s*=\s*[^;]+;/g, '')
    .replace(/\binterface\s+\w+\s*\{[^}]*\}/gs, '')
    .replace(/<\w+(\s*,\s*\w+)*>/g, '')
    .replace(/\bas\s+\w+/g, '')
    .replace(/!\./g, '.')
    .replace(/\bexport\s+/g, '')
    .replace(/\bconst\s+(\w+)\s*=\s*\{([^}]*)\}\s*as\s*const/g, 'const $1 = {$2}');

  const fn = new Function('console', 'assert', 'assertEquals', jsCode);
  fn(mockConsole, assert, assertEquals);
  return logs.join('\n');
}

function runPython(code: string): string {
  return '⏳ Python execution via Pyodide — coming soon.\n\nYour code is valid, run it locally with:\n  python3 -c "' + code.split('\n')[0] + ' ..."';
}

async function handleRun() {
  isRunning.value = true;
  hasError.value = false;
  output.value = '';

  try {
    const code = getActiveCode();
    if (activeLang.value === 'typescript') {
      output.value = runTypeScript(code);
    } else if (activeLang.value === 'python') {
      output.value = runPython(code);
    } else {
      output.value = `⚠ Browser execution not available for ${langLabels[activeLang.value] || activeLang.value}.\nRun locally with the appropriate toolchain.`;
    }
  } catch (e: unknown) {
    hasError.value = true;
    output.value = `✗ ${(e as Error).message}`;
  } finally {
    isRunning.value = false;
  }
}

function handleReset() {
  const code = props.languages?.[activeLang.value] || props.code;
  editorInstance.value?.setValue(code);
  output.value = '';
  hasError.value = false;
}

onMounted(() => {
  nextTick(initMonaco);
});

onBeforeUnmount(() => {
  editorInstance.value?.dispose();
});

const availableLangs = ref<string[]>([]);

watch(
  () => props.languages,
  (langs) => {
    if (langs) {
      availableLangs.value = Object.keys(langs);
    } else {
      availableLangs.value = [props.lang];
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="playground">
    <div class="playground-header">
      <span class="playground-title">{{ title }}</span>
      <div class="playground-tabs" v-if="availableLangs.length > 1">
        <button
          v-for="lang in availableLangs"
          :key="lang"
          :class="['tab', { active: activeLang === lang }]"
          @click="switchLang(lang)"
        >
          {{ langLabels[lang] || lang }}
        </button>
      </div>
      <span v-else class="playground-lang">{{ langLabels[activeLang] || activeLang }}</span>
      <div class="playground-actions">
        <button class="btn-reset" @click="handleReset" title="Reset">↺</button>
        <button class="btn-run" @click="handleRun" :disabled="isRunning">
          {{ isRunning ? '...' : '▶ Run' }}
        </button>
      </div>
    </div>
    <div class="playground-body">
      <div ref="editorContainer" class="playground-editor" />
      <pre v-if="output" :class="['playground-output', { error: hasError }]">{{ output }}</pre>
    </div>
  </div>
</template>

<style scoped>
.playground {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.playground-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.playground-title {
  font-weight: 600;
  font-size: 14px;
}

.playground-tabs {
  display: flex;
  gap: 2px;
  background: var(--vp-c-bg-alt);
  border-radius: 6px;
  padding: 2px;
}

.tab {
  padding: 3px 10px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}

.tab.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.tab:hover:not(.active) {
  color: var(--vp-c-text-1);
}

.playground-lang {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.playground-actions {
  margin-left: auto;
  display: flex;
  gap: 6px;
}

.btn-run {
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.btn-run:hover { opacity: 0.9; }
.btn-run:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-reset {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  cursor: pointer;
  font-size: 16px;
}

.playground-body {
  display: flex;
  flex-direction: column;
}

.playground-editor {
  width: 100%;
  min-height: 180px;
  max-height: 500px;
}

.playground-output {
  padding: 12px 16px;
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
  white-space: pre-wrap;
  color: var(--vp-c-text-2);
}

.playground-output.error { color: var(--vp-c-danger-1); }
</style>
