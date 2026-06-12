import { defineComponent, h, onMounted } from 'vue';

/** A child component that throws during setup */
export const CrashOnSetup = defineComponent({
  name: 'CrashOnSetup',
  setup() {
    throw new Error('Setup crash');
  },
  render() {
    return h('div', 'unreachable');
  },
});

/** A child component that throws during onMounted */
export const CrashOnMount = defineComponent({
  name: 'CrashOnMount',
  setup() {
    onMounted(() => {
      throw new Error('Mount crash');
    });
    return () => h('div', { class: 'mount-child' }, 'mounted child');
  },
});

/** A healthy child component */
export const HealthyChild = defineComponent({
  name: 'HealthyChild',
  setup() {
    return () => h('div', { class: 'healthy-child' }, 'I am healthy');
  },
});

/** Creates a child that crashes on first render but succeeds on second */
export function createCrashOnce() {
  let renderCount = 0;
  return defineComponent({
    name: 'CrashOnce',
    setup() {
      renderCount++;
      if (renderCount === 1) {
        throw new Error('First render crash');
      }
      return () => h('div', { class: 'recovered' }, 'Recovered!');
    },
  });
}