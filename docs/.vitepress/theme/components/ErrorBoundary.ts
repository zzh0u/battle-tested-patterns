import { defineComponent, h, ref, onErrorCaptured, type Component, type PropType } from 'vue';
import ErrorFallback from './ErrorFallback.vue';

/**
 * Generic ErrorBoundary — wraps non-Viz synchronous components
 * (CompositionFlow, DecisionTree, etc.).
 *
 * Implemented as a plain .ts defineComponent (NOT an SFC) because
 * @vitejs/plugin-vue's SFC compilation interferes with onErrorCaptured
 * registration under the vitest/jsdom environment — errors from the child
 * rendered via h(props.component) are not reliably captured when the
 * boundary is compiled as a .vue file. A plain .ts module captures them
 * correctly. The fallback UI is delegated to the ErrorFallback.vue SFC
 * (pure UI, no onErrorCaptured), which is unaffected by this issue.
 *
 * Observability: the boundary logs the error with console.error and then
 * returns false to isolate the crash. It does NOT manually forward to
 * app.config.errorHandler — that is an anti-pattern (it double-reports and
 * fights test-utils' default handler). Error monitoring services such as
 * Sentry/Flare should be wired at the plugin layer where they wrap
 * app.config.errorHandler globally, capturing every bubbling error. The
 * global handler in index.ts remains the catch-all for errors not
 * intercepted by any boundary (e.g. unguarded Badge components).
 */
export default defineComponent({
  name: 'ErrorBoundary',
  props: {
    component: { type: [Object, Function] as PropType<Component>, required: true },
    name: { type: String, default: undefined },
  },
  setup(props) {
    const hasError = ref(false);
    const errorMsg = ref('');
    const retryKey = ref(0);

    onErrorCaptured((err: Error, _instance, info) => {
      hasError.value = true;
      errorMsg.value = err?.message || 'Unknown error';
      console.error(`[ErrorBoundary] ${props.name || 'Component'} failed (${info}):`, err);
      return false; // isolate the crash to this boundary
    });

    function retry() {
      hasError.value = false;
      errorMsg.value = '';
      // Bump the key so the child is fully remounted (fresh instance), not just
      // re-shown — a crash often leaves the child's internal state corrupted.
      retryKey.value++;
    }

    return () => {
      if (hasError.value) {
        return h(ErrorFallback, {
          hasError: true,
          errorMsg: errorMsg.value,
          name: props.name,
          variant: 'generic',
          onRetry: retry,
        });
      }
      return h(props.component, { key: retryKey.value });
    };
  },
});
