import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import ErrorBoundary from '../../.vitepress/theme/components/ErrorBoundary';
import {
  CrashOnSetup,
  CrashOnMount,
  HealthyChild,
  createCrashOnce,
} from '../helpers/error-boundary';

// Mock vitepress useData for useI18n
const mockLang = { value: 'en-US' };
vi.mock('vitepress', () => ({
  useData: () => ({ lang: mockLang }),
}));

/** Mount ErrorBoundary with a child component via :component prop */
function mountWithChild(child: any, props: { name?: string } = {}) {
  return mount(ErrorBoundary, { props: { component: child, ...props } });
}

describe('ErrorBoundary', () => {
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
    const wrapper = mountWithChild(HealthyChild);
    await nextTick();

    expect(wrapper.find('.healthy-child').exists()).toBe(true);
    expect(wrapper.find('.error-boundary').exists()).toBe(false);
  });

  it('catches synchronous setup error and shows error boundary', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestComp' });
    await nextTick();

    expect(wrapper.find('.error-boundary').exists()).toBe(true);
    expect(wrapper.find('.error-boundary-title').text()).toContain('Component failed to render');
  });

  it('catches onMounted error and shows error boundary', async () => {
    const wrapper = mountWithChild(CrashOnMount, { name: 'TestComp' });
    await flushPromises();
    await nextTick();

    expect(wrapper.find('.error-boundary').exists()).toBe(true);
    expect(wrapper.find('.error-boundary-hint').text()).toContain("won't affect the rest");
  });

  // --- Error isolation ---

  it('does not propagate error to parent — page remains intact', async () => {
    const Page = defineComponent({
      setup() {
        return () =>
          h('div', { class: 'page' }, [
            h('h1', 'Page Title'),
            h(ErrorBoundary, { name: 'TestComp', component: CrashOnSetup }),
            h('footer', 'Footer'),
          ]);
      },
    });

    const wrapper = mount(Page);
    await nextTick();

    expect(wrapper.find('h1').text()).toBe('Page Title');
    expect(wrapper.find('footer').text()).toBe('Footer');
    expect(wrapper.find('.error-boundary').exists()).toBe(true);
  });

  // --- Retry ---

  it('retry button clears error state and re-renders child', async () => {
    const CrashOnce = createCrashOnce();
    const wrapper = mountWithChild(CrashOnce, { name: 'TestComp' });
    await nextTick();

    expect(wrapper.find('.error-boundary').exists()).toBe(true);

    // Click retry
    await wrapper.find('.error-boundary-btn').trigger('click');
    await nextTick();

    expect(wrapper.find('.error-boundary').exists()).toBe(false);
    expect(wrapper.find('.recovered').exists()).toBe(true);
    expect(wrapper.find('.recovered').text()).toBe('Recovered!');
  });

  // --- Report Issue link ---

  it('shows Report Issue link with correct URL format', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'CompositionFlow' });
    await nextTick();

    const link = wrapper.find('.error-boundary-btn--outline');
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe('Report Issue');
    const href = link.attributes('href') || '';
    expect(href).toContain('github.com/nicepkg/battle-tested-patterns/issues/new');
    expect(href).toContain('labels=bug');
    expect(href).not.toContain('labels=bug,viz'); // generic uses "bug" not "bug,viz"
  });

  it('Report Issue link includes component name and error message', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'DecisionTree' });
    await nextTick();

    const link = wrapper.find('.error-boundary-btn--outline');
    const href = link.attributes('href') || '';
    expect(href).toContain('DecisionTree');
    expect(href).toContain(encodeURIComponent('Setup crash'));
  });

  it('Report Issue link opens in new tab with security attributes', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestComp' });
    await nextTick();

    const link = wrapper.find('.error-boundary-btn--outline');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');
  });

  // --- Accessibility ---

  it('displays role="alert" for accessibility', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestComp' });
    await nextTick();

    const boundary = wrapper.find('.error-boundary');
    expect(boundary.attributes('role')).toBe('alert');
  });

  it('displays aria-atomic="true" for accessibility', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestComp' });
    await nextTick();

    const boundary = wrapper.find('.error-boundary');
    expect(boundary.attributes('aria-atomic')).toBe('true');
  });

  // --- i18n ---

  it('shows Chinese text when lang is zh-CN', async () => {
    mockLang.value = 'zh-CN';
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestComp' });
    await nextTick();

    expect(wrapper.find('.error-boundary-title').text()).toContain('组件加载失败');
    expect(wrapper.find('.error-boundary-hint').text()).toContain('不会影响页面其他内容');
    const buttons = wrapper.findAll('.error-boundary-btn');
    expect(buttons[0].text()).toBe('重试');
    expect(buttons[1].text()).toBe('反馈问题');
  });

  it('shows English text when lang is en-US', async () => {
    mockLang.value = 'en-US';
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestComp' });
    await nextTick();

    expect(wrapper.find('.error-boundary-title').text()).toContain('Component failed to render');
    expect(wrapper.find('.error-boundary-hint').text()).toContain("won't affect the rest");
    const buttons = wrapper.findAll('.error-boundary-btn');
    expect(buttons[0].text()).toBe('Retry');
    expect(buttons[1].text()).toBe('Report Issue');
  });

  // --- Error details ---

  it('shows error details in collapsible details element', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'TestComp' });
    await nextTick();

    const details = wrapper.find('.error-boundary-details');
    expect(details.exists()).toBe(true);
    expect(details.find('summary').text()).toBe('Show Details');
    expect(details.find('pre').text()).toContain('[TestComp]');
    expect(details.find('pre').text()).toContain('Setup crash');
  });

  it('includes component name in error details', async () => {
    const wrapper = mountWithChild(CrashOnSetup, { name: 'CompositionFlow' });
    await nextTick();

    const pre = wrapper.find('.error-boundary-details pre');
    expect(pre.text()).toContain('[CompositionFlow]');
    expect(pre.text()).toContain('Setup crash');
  });
});
