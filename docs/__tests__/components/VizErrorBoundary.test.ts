import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import VizErrorBoundary from '../../.vitepress/theme/components/VizErrorBoundary';
import { CrashOnSetup, CrashOnMount, HealthyChild, createCrashOnce } from '../helpers/error-boundary';

// Mock vitepress useData for useI18n
const mockLang = { value: 'en-US' };
vi.mock('vitepress', () => ({
  useData: () => ({ lang: mockLang }),
}));

/** Mount VizErrorBoundary with a child component via :component prop */
function mountWithChild(child: any, props: { name?: string } = {}) {
  return mount(VizErrorBoundary, { props: { component: child, ...props } });
}

describe('VizErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockLang.value = 'en-US';
  });

  // --- Core functionality ---

  it('renders child component normally when no error', async () => {
    const wrapper = mountWithChild(HealthyChild, { name: 'TestViz' });
    await nextTick();

    expect(wrapper.find('.healthy-child').exists()).toBe(true);
    expect(wrapper.find('.viz-error-boundary').exists()).toBe(false);
  });

  it('catches synchronous setup error and shows error boundary', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestViz' });
    await nextTick();

    expect(wrapper.find('.viz-error-boundary').exists()).toBe(true);
    expect(wrapper.find('.viz-error-title').text()).toContain('failed to render');
  });

  it('catches onMounted error and shows error boundary', async () => {
    const wrapper = mountWithChild(CrashOnMount, { name: 'TestViz' });
    await flushPromises();
    await nextTick();

    expect(wrapper.find('.viz-error-boundary').exists()).toBe(true);
    expect(wrapper.find('.viz-error-hint').text()).toContain('retry');
  });

  // --- Error isolation ---

  it('does not propagate error to parent — page remains intact', async () => {
    const Page = defineComponent({
      setup() {
        return () => h('div', { class: 'page' }, [
          h('h1', 'Page Title'),
          h(VizErrorBoundary, { name: 'TestViz', component: CrashOnSetup }),
          h('footer', 'Footer'),
        ]);
      },
    });

    const wrapper = mount(Page);
    await nextTick();

    expect(wrapper.find('h1').text()).toBe('Page Title');
    expect(wrapper.find('footer').text()).toBe('Footer');
    expect(wrapper.find('.viz-error-boundary').exists()).toBe(true);
  });

  // --- Retry ---

  it('retry button clears error state and re-renders child', async () => {
    const CrashOnce = createCrashOnce();
    const wrapper = mountWithChild(CrashOnce, { name: 'TestViz' });
    await nextTick();

    expect(wrapper.find('.viz-error-boundary').exists()).toBe(true);

    // Click retry — clears hasError, re-renders child (which now succeeds)
    await wrapper.find('.viz-btn').trigger('click');
    await nextTick();

    expect(wrapper.find('.viz-error-boundary').exists()).toBe(false);
    expect(wrapper.find('.recovered').exists()).toBe(true);
    expect(wrapper.find('.recovered').text()).toBe('Recovered!');
  });

  // --- Accessibility ---

  it('displays role="alert" for accessibility', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestViz' });
    await nextTick();

    const boundary = wrapper.find('.viz-error-boundary');
    expect(boundary.attributes('role')).toBe('alert');
  });

  it('displays aria-atomic="true" for accessibility', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestViz' });
    await nextTick();

    const boundary = wrapper.find('.viz-error-boundary');
    expect(boundary.attributes('aria-atomic')).toBe('true');
  });

  // --- i18n ---

  it('shows Chinese text when lang is zh-CN', async () => {
    mockLang.value = 'zh-CN';
    const wrapper = mountWithChild(CrashOnSetup, { name: 'ConsistentHashViz' });
    await nextTick();

    expect(wrapper.find('.viz-error-title').text()).toContain('渲染失败');
    expect(wrapper.find('.viz-error-hint').text()).toContain('不会影响页面其他内容');
    const buttons = wrapper.findAll('.viz-btn');
    expect(buttons[0].text()).toBe('重试');
    expect(wrapper.find('.viz-btn--outline').text()).toBe('反馈问题');
    expect(wrapper.find('.viz-btn--ghost').text()).toBe('查看详情');
  });

  it('shows English text when lang is en-US', async () => {
    mockLang.value = 'en-US';
    const wrapper = mountWithChild(CrashOnSetup, { name: 'SkipListViz' });
    await nextTick();

    expect(wrapper.find('.viz-error-title').text()).toContain('Visualization failed to render');
    expect(wrapper.find('.viz-error-hint').text()).toContain("won't affect the rest");
    const buttons = wrapper.findAll('.viz-btn');
    expect(buttons[0].text()).toBe('Retry');
    expect(wrapper.find('.viz-btn--outline').text()).toBe('Report Issue');
  });

  // --- Report Issue link ---

  it('shows Report Issue link with correct URL format including bug,viz labels', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'BloomFilterViz' });
    await nextTick();

    const link = wrapper.find('.viz-btn--outline');
    const href = link.attributes('href') || '';
    expect(href).toContain('github.com/nicepkg/battle-tested-patterns/issues/new');
    expect(href).toContain('labels=bug,viz');
    expect(href).toContain('BloomFilterViz');
    expect(href).toContain(encodeURIComponent('Setup crash'));
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');
  });

  // --- Show/Hide Details ---

  it('toggles error details visibility via button', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'MVCCViz' });
    await nextTick();

    // Initially hidden
    expect(wrapper.find('.viz-error-details').exists()).toBe(false);
    const detailsBtn = wrapper.find('.viz-btn--ghost');
    expect(detailsBtn.text()).toBe('Show Details');

    // Click to show
    await detailsBtn.trigger('click');
    await nextTick();
    expect(wrapper.find('.viz-error-details').exists()).toBe(true);
    expect(wrapper.find('.viz-error-details').text()).toContain('[MVCCViz]');
    expect(wrapper.find('.viz-error-details').text()).toContain('Setup crash');

    // Button text changes
    expect(wrapper.find('.viz-btn--ghost').text()).toBe('Hide Details');

    // Click to hide
    await wrapper.find('.viz-btn--ghost').trigger('click');
    await nextTick();
    expect(wrapper.find('.viz-error-details').exists()).toBe(false);
  });

  // --- Behavioral regression (matches current clientOnly behavior) ---

  it('uses viz-container and viz-error-boundary CSS classes', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestViz' });
    await nextTick();

    const boundary = wrapper.find('.viz-error-boundary');
    expect(boundary.exists()).toBe(true);
    expect(boundary.classes()).toContain('viz-container');
    expect(boundary.classes()).toContain('viz-error-boundary');
  });
});