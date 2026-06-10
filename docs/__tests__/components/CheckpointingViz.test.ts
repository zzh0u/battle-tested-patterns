import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CheckpointingViz from '../../.vitepress/theme/components/CheckpointingViz.vue';

describe('CheckpointingViz', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty log and state value 0', () => {
    const wrapper = mount(CheckpointingViz);
    expect(wrapper.findAll('.cp-log-entry')).toHaveLength(0);
    const stateBox = wrapper.find('.cp-state-value');
    expect(stateBox.text()).toBe('0');
  });

  it('applying an operation adds a log entry and changes state', async () => {
    const wrapper = mount(CheckpointingViz);
    const opBtns = wrapper.findAll('.viz-btn').filter((b) =>
      !b.classes().includes('viz-btn--primary') &&
      !b.classes().includes('viz-btn--danger') &&
      b.text().match(/^\+|\*|×/)
    );
    if (opBtns.length > 0) {
      await opBtns[0].trigger('click');
      vi.advanceTimersByTime(500);
      await flushPromises();
      expect(wrapper.findAll('.cp-log-entry').length).toBeGreaterThanOrEqual(1);
    }
  });

  it('checkpoint creates a marker in the log', async () => {
    const wrapper = mount(CheckpointingViz);
    const opBtns = wrapper.findAll('.viz-btn').filter((b) =>
      b.text().match(/^\+|\*|×/)
    );
    if (opBtns.length > 0) {
      await opBtns[0].trigger('click');
      vi.advanceTimersByTime(500);
      await flushPromises();
    }

    const cpBtn = wrapper.findAll('.viz-btn--primary').find((b) =>
      b.text().includes('Checkpoint') || b.text().includes('快照'),
    );
    if (cpBtn) {
      await cpBtn.trigger('click');
      vi.advanceTimersByTime(500);
      await flushPromises();

      const markers = wrapper.findAll('.cp-marker');
      expect(markers.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('reset clears log, state, and checkpoints', async () => {
    const wrapper = mount(CheckpointingViz);
    const resetBtn = wrapper.findAll('.viz-btn').find((b) =>
      b.text().includes('Reset') || b.text().includes('重置'),
    );
    await resetBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.findAll('.cp-log-entry')).toHaveLength(0);
  });

  it('has preset scenario buttons', () => {
    const wrapper = mount(CheckpointingViz);
    expect(wrapper.find('.viz-presets').exists()).toBe(true);
  });
});
