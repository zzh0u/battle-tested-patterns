import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref, computed, onMounted, onErrorCaptured, nextTick } from 'vue';

/**
 * Minimal reproduction of the ErrorBoundary logic from theme/index.ts clientOnly().
 * We skip defineAsyncComponent to test the error-catching behavior directly.
 * Mirrors the full implementation: i18n, issue link, collapsible details.
 */
function createErrorBoundary(ChildComponent: any, componentName = 'TestViz') {
  return defineComponent({
    name: 'VizClientOnly',
    props: {
      lang: { type: String, default: 'en-US' },
    },
    setup(props) {
      const hasError = ref(false);
      const errorMsg = ref('');
      const showDetails = ref(false);
      const isZh = computed(() => props.lang === 'zh-CN');

      onErrorCaptured((err: Error) => {
        hasError.value = true;
        errorMsg.value = err?.message || 'Unknown error';
        return false; // prevent propagation
      });
      return () => {
        if (hasError.value) {
          const issueTitle = encodeURIComponent(
            `[Bug] ${componentName} render error: ${errorMsg.value.slice(0, 60)}`
          );
          const issueBody = encodeURIComponent(
            `## Component\n${componentName}\n\n## Error\n\`\`\`\n${errorMsg.value}\n\`\`\`\n\n## Steps to reproduce\n1. Open the page containing ${componentName}\n2. (describe what you did)\n\n## Environment\n- Browser: \n- OS: \n`
          );
          const issueUrl = `https://github.com/nicepkg/battle-tested-patterns/issues/new?title=${issueTitle}&body=${issueBody}&labels=bug,viz`;

          return h('div', { class: 'viz-container viz-error-boundary', role: 'alert' }, [
            h('p', { class: 'viz-error-title' },
              isZh.value ? '⚠ 可视化组件渲染失败' : '⚠ Visualization failed to render'
            ),
            h('p', { class: 'viz-error-hint' },
              isZh.value
                ? '这不会影响页面其他内容。你可以尝试重试，或反馈此问题帮助我们改进。'
                : 'This won\'t affect the rest of the page. You can retry or report this issue to help us improve.'
            ),
            h('div', { class: 'viz-error-actions' }, [
              h('button', {
                class: 'viz-btn',
                onClick: () => { hasError.value = false; showDetails.value = false; },
              }, isZh.value ? '重试' : 'Retry'),
              h('a', {
                class: 'viz-btn viz-btn--outline',
                href: issueUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
              }, isZh.value ? '反馈问题' : 'Report Issue'),
              h('button', {
                class: 'viz-btn viz-btn--ghost',
                onClick: () => { showDetails.value = !showDetails.value; },
              }, showDetails.value
                ? (isZh.value ? '收起详情' : 'Hide Details')
                : (isZh.value ? '查看详情' : 'Show Details')
              ),
            ]),
            showDetails.value
              ? h('pre', { class: 'viz-error-details' },
                  `[${componentName}] ${errorMsg.value}`
                )
              : null,
          ]);
        }
        return h(ChildComponent);
      };
    },
  });
}

/** A child component that throws during setup */
const CrashOnSetup = defineComponent({
  name: 'CrashOnSetup',
  setup() {
    throw new Error('Setup crash');
  },
  render() {
    return h('div', 'unreachable');
  },
});

/** A child component that throws during onMounted */
const CrashOnMount = defineComponent({
  name: 'CrashOnMount',
  setup() {
    onMounted(() => {
      throw new Error('Mount crash');
    });
    return () => h('div', { class: 'mount-child' }, 'mounted child');
  },
});

/** A healthy child component */
const HealthyChild = defineComponent({
  name: 'HealthyChild',
  setup() {
    return () => h('div', { class: 'healthy-child' }, 'I am healthy');
  },
});

/** A child that crashes on first render but succeeds on second */
let renderCount = 0;
const CrashOnce = defineComponent({
  name: 'CrashOnce',
  setup() {
    renderCount++;
    if (renderCount === 1) {
      throw new Error('First render crash');
    }
    return () => h('div', { class: 'recovered' }, 'Recovered!');
  },
});

describe('VizErrorBoundary (onErrorCaptured in clientOnly wrapper)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderCount = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders child component normally when no error', async () => {
    const Wrapped = createErrorBoundary(HealthyChild);
    const wrapper = mount(Wrapped);
    await nextTick();

    expect(wrapper.find('.healthy-child').exists()).toBe(true);
    expect(wrapper.find('.healthy-child').text()).toBe('I am healthy');
    expect(wrapper.find('.viz-error-boundary').exists()).toBe(false);
  });

  it('catches synchronous setup error and shows error boundary', async () => {
    const Wrapped = createErrorBoundary(CrashOnSetup);
    const wrapper = mount(Wrapped);
    await nextTick();

    expect(wrapper.find('.viz-error-boundary').exists()).toBe(true);
    expect(wrapper.find('.viz-error-title').text()).toContain('failed to render');
  });

  it('catches onMounted error and shows error boundary', async () => {
    const Wrapped = createErrorBoundary(CrashOnMount);
    const wrapper = mount(Wrapped);
    await flushPromises();
    await nextTick();

    expect(wrapper.find('.viz-error-boundary').exists()).toBe(true);
    expect(wrapper.find('.viz-error-hint').text()).toContain('retry');
  });

  it('does not propagate error to parent — page remains intact', async () => {
    const Wrapped = createErrorBoundary(CrashOnSetup);
    const Page = defineComponent({
      setup() {
        return () => h('div', { class: 'page' }, [
          h('h1', 'Page Title'),
          h(Wrapped),
          h('footer', 'Footer'),
        ]);
      },
    });

    const wrapper = mount(Page);
    await nextTick();

    // Page structure remains intact — no white screen
    expect(wrapper.find('h1').text()).toBe('Page Title');
    expect(wrapper.find('footer').text()).toBe('Footer');
    expect(wrapper.find('.viz-error-boundary').exists()).toBe(true);
  });

  it('retry button clears error state and re-renders child', async () => {
    const Wrapped = createErrorBoundary(CrashOnce);
    const wrapper = mount(Wrapped);
    await nextTick();

    // First render: error boundary shown
    expect(wrapper.find('.viz-error-boundary').exists()).toBe(true);

    // Click retry — clears hasError, re-renders child (which now succeeds)
    await wrapper.find('.viz-btn').trigger('click');
    await nextTick();

    expect(wrapper.find('.viz-error-boundary').exists()).toBe(false);
    expect(wrapper.find('.recovered').exists()).toBe(true);
    expect(wrapper.find('.recovered').text()).toBe('Recovered!');
  });

  it('displays role="alert" for accessibility', async () => {
    const Wrapped = createErrorBoundary(CrashOnSetup);
    const wrapper = mount(Wrapped);
    await nextTick();

    const boundary = wrapper.find('.viz-error-boundary');
    expect(boundary.attributes('role')).toBe('alert');
  });

  it('shows Chinese text when lang is zh-CN', async () => {
    const Wrapped = createErrorBoundary(CrashOnSetup, 'ConsistentHashViz');
    const wrapper = mount(Wrapped, { props: { lang: 'zh-CN' } });
    await nextTick();

    expect(wrapper.find('.viz-error-title').text()).toContain('渲染失败');
    expect(wrapper.find('.viz-error-hint').text()).toContain('不会影响页面其他内容');
    // Buttons in Chinese
    const buttons = wrapper.findAll('.viz-btn');
    expect(buttons[0].text()).toBe('重试');
    const reportLink = wrapper.find('.viz-btn--outline');
    expect(reportLink.text()).toBe('反馈问题');
    const detailsBtn = wrapper.find('.viz-btn--ghost');
    expect(detailsBtn.text()).toBe('查看详情');
  });

  it('shows English text when lang is en-US', async () => {
    const Wrapped = createErrorBoundary(CrashOnSetup, 'SkipListViz');
    const wrapper = mount(Wrapped, { props: { lang: 'en-US' } });
    await nextTick();

    expect(wrapper.find('.viz-error-title').text()).toContain('Visualization failed to render');
    expect(wrapper.find('.viz-error-hint').text()).toContain('won\'t affect the rest');
    const buttons = wrapper.findAll('.viz-btn');
    expect(buttons[0].text()).toBe('Retry');
    const reportLink = wrapper.find('.viz-btn--outline');
    expect(reportLink.text()).toBe('Report Issue');
  });

  it('report issue link contains component name and error in URL', async () => {
    const Wrapped = createErrorBoundary(CrashOnSetup, 'BloomFilterViz');
    const wrapper = mount(Wrapped);
    await nextTick();

    const link = wrapper.find('.viz-btn--outline');
    const href = link.attributes('href') || '';
    expect(href).toContain('github.com');
    expect(href).toContain('issues/new');
    expect(href).toContain('BloomFilterViz');
    expect(href).toContain(encodeURIComponent('Setup crash'));
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');
  });

  it('show details button toggles error details visibility', async () => {
    const Wrapped = createErrorBoundary(CrashOnSetup, 'MVCCViz');
    const wrapper = mount(Wrapped);
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
});
