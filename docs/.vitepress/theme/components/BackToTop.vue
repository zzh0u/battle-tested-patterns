<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useData } from 'vitepress';

const { lang } = useData();
const visible = ref(false);

// Show after scrolling roughly half a viewport. NN/g advises revealing the
// control only once the user has scrolled a meaningful distance; uxpatterns.dev
// warns a flat 300px fires on short pages. Half a viewport (clamped to ≥400px)
// balances both: short pages stay uncluttered, long pages reveal it early.
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const threshold = Math.max(window.innerHeight * 0.5, 400);
    visible.value = window.scrollY > threshold;
    ticking = false;
  });
}

function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
onUnmounted(() => window.removeEventListener('scroll', onScroll));

const label = () => (lang.value.startsWith('zh') ? '回到顶部' : 'Back to top');
</script>

<template>
  <Transition name="back-to-top-fade">
    <button
      v-show="visible"
      class="back-to-top"
      type="button"
      :aria-label="label()"
      :title="label()"
      @click="scrollToTop"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  </Transition>
</template>
