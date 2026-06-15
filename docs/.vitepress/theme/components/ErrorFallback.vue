<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n';

const props = defineProps<{
  hasError: boolean;
  errorMsg?: string;
  name?: string;
  variant?: 'generic' | 'viz';
}>();

const emit = defineEmits<{
  retry: [];
}>();

const { isZh } = useI18n();
const isViz = computed(() => props.variant === 'viz');
const showDetails = ref(false);

function toggleDetails() {
  showDetails.value = !showDetails.value;
}

const issueTitle = computed(() => {
  const label = isViz.value ? 'Viz' : props.name || 'Component';
  return encodeURIComponent(`[Bug] ${label} render error: ${(props.errorMsg || '').slice(0, 60)}`);
});

const issueBody = computed(() =>
  encodeURIComponent(
    `## Component\n${props.name || 'Unknown'}\n\n## Error\n\`\`\`\n${props.errorMsg || ''}\n\`\`\`\n\n## Steps to reproduce\n1. Open the page containing ${props.name || 'this component'}\n2. (describe what you did)\n\n## Environment\n- Browser: \n- OS: \n`,
  ),
);

const issueUrl = computed(() => {
  const labels = isViz.value ? 'bug,viz' : 'bug';
  return `https://github.com/nicepkg/battle-tested-patterns/issues/new?title=${issueTitle.value}&body=${issueBody.value}&labels=${labels}`;
});
</script>

<template>
  <!-- Generic error boundary fallback -->
  <div v-if="!isViz" class="error-boundary" role="alert" aria-atomic="true">
    <p class="error-boundary-title">
      {{ isZh ? '⚠ 组件加载失败' : '⚠ Component failed to render' }}
    </p>
    <p class="error-boundary-hint">
      {{
        isZh
          ? '这不会影响页面其他内容。你可以尝试重试，或反馈此问题帮助我们改进。'
          : "This won't affect the rest of the page. You can retry or report this issue to help us improve."
      }}
    </p>
    <div class="error-boundary-actions">
      <button class="error-boundary-btn" @click="emit('retry')">
        {{ isZh ? '重试' : 'Retry' }}
      </button>
      <a
        class="error-boundary-btn error-boundary-btn--outline"
        :href="issueUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ isZh ? '反馈问题' : 'Report Issue' }}
      </a>
    </div>
    <details v-if="errorMsg" class="error-boundary-details">
      <summary>{{ isZh ? '查看详情' : 'Show Details' }}</summary>
      <pre>[{{ name || 'Unknown' }}] {{ errorMsg }}</pre>
    </details>
  </div>

  <!-- Viz error boundary fallback -->
  <div v-else class="viz-container viz-error-boundary" role="alert" aria-atomic="true">
    <p class="viz-error-title">
      {{ isZh ? '⚠ 可视化组件渲染失败' : '⚠ Visualization failed to render' }}
    </p>
    <p class="viz-error-hint">
      {{
        isZh
          ? '这不会影响页面其他内容。你可以尝试重试，或反馈此问题帮助我们改进。'
          : "This won't affect the rest of the page. You can retry or report this issue to help us improve."
      }}
    </p>
    <div class="viz-error-actions">
      <button class="viz-btn" @click="emit('retry')">
        {{ isZh ? '重试' : 'Retry' }}
      </button>
      <a
        class="viz-btn viz-btn--outline"
        :href="issueUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ isZh ? '反馈问题' : 'Report Issue' }}
      </a>
      <button class="viz-btn viz-btn--ghost" @click="toggleDetails">
        {{
          showDetails ? (isZh ? '收起详情' : 'Hide Details') : isZh ? '查看详情' : 'Show Details'
        }}
      </button>
    </div>
    <pre v-if="showDetails" class="viz-error-details">[{{ name || 'Unknown' }}] {{ errorMsg }}</pre>
  </div>
</template>
