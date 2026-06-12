import { defineComponent, h, ref, onErrorCaptured, type Component, type PropType } from 'vue';
import ErrorFallback from './ErrorFallback.vue';

/**
 * VizErrorBoundary — wraps Viz async components (Mermaid, Flowchart, etc.).
 * Handles synchronous render errors from the loaded component. Loading /
 * skeleton state is supplied by the parent (clientOnly) via the default
 * slot while `component` is null.
 *
 * Implemented as a plain .ts defineComponent (NOT an SFC) because
 * @vitejs/plugin-vue's SFC compilation interferes with onErrorCaptured
 * registration under the vitest/jsdom environment — errors from the child
 * rendered via h(props.component) are not reliably captured when the
 * boundary is compiled as a .vue file. A plain .ts module captures them
 * correctly. The fallback UI is delegated to the ErrorFallback.vue SFC
 * (pure UI, no onErrorCaptured), which is unaffected by this issue.
 *
 * Observability: logs with console.error then returns false to isolate the
 * crash to this single Viz component. It does NOT manually forward to
 * app.config.errorHandler (anti-pattern — see ErrorBoundary.ts). Monitoring
 * services should wrap the global handler at the plugin layer.
 */
export default defineComponent({
  name: 'VizErrorBoundary',
  props: {
    component: { type: [Object, Function] as PropType<Component | null>, default: null },
    name: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const hasError = ref(false);
    const errorMsg = ref('');
    const retryKey = ref(0);

    onErrorCaptured((err: Error, _instance, info) => {
      hasError.value = true;
      errorMsg.value = err?.message || 'Unknown error';
      console.error(`[VizErrorBoundary] ${props.name || 'Viz'} failed (${info}):`, err);
      return false; // isolate the crash to this single Viz component
    });

    function retry() {
      hasError.value = false;
      errorMsg.value = '';
      retryKey.value++;
    }

    return () => {
      if (hasError.value) {
        return h(ErrorFallback, {
          hasError: true,
          errorMsg: errorMsg.value,
          name: props.name,
          variant: 'viz',
          onRetry: retry,
        });
      }

      // No component yet (SSR / pre-mount) — render the loading slot if any.
      if (!props.component) {
        return slots.default?.();
      }

      return h(props.component, { key: retryKey.value });
    };
  },
});
