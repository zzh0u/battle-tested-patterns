import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import RingBufferViz from './components/RingBufferViz.vue';
import LRUCacheViz from './components/LRUCacheViz.vue';
import BloomFilterViz from './components/BloomFilterViz.vue';
import CircuitBreakerViz from './components/CircuitBreakerViz.vue';
import ConsistentHashViz from './components/ConsistentHashViz.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RingBufferViz', RingBufferViz);
    app.component('LRUCacheViz', LRUCacheViz);
    app.component('BloomFilterViz', BloomFilterViz);
    app.component('CircuitBreakerViz', CircuitBreakerViz);
    app.component('ConsistentHashViz', ConsistentHashViz);
  },
} satisfies Theme;
