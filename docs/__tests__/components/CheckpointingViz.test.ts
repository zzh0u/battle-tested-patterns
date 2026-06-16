import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CheckpointingViz from '../../.vitepress/theme/components/CheckpointingViz.vue';
import { clickButton, clickReset, playbackStepBack } from '../helpers/viz-interactions';

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
    await clickButton(wrapper, '+3');
    vi.advanceTimersByTime(500);
    await flushPromises();
    expect(wrapper.findAll('.cp-log-entry').length).toBeGreaterThanOrEqual(1);
  });

  it('checkpoint creates a marker in the log', async () => {
    const wrapper = mount(CheckpointingViz);
    await clickButton(wrapper, '+3');
    vi.advanceTimersByTime(500);
    await flushPromises();

    await clickButton(wrapper, ['Checkpoint', '创建快照']);
    vi.advanceTimersByTime(500);
    await flushPromises();

    const markers = wrapper.findAll('.cp-marker');
    expect(markers.length).toBeGreaterThanOrEqual(1);
  });

  it('reset clears log, state, and checkpoints', async () => {
    const wrapper = mount(CheckpointingViz);
    await clickReset(wrapper);

    expect(wrapper.findAll('.cp-log-entry')).toHaveLength(0);
  });

  it('has preset scenario buttons', () => {
    const wrapper = mount(CheckpointingViz);
    expect(wrapper.find('.viz-presets').exists()).toBe(true);
  });

  it('time travel restores recovery stats with the snapshot (regression: M1)', async () => {
    const wrapper = mount(CheckpointingViz);

    // Build a WAL, checkpoint, add one more op, crash, then recover.
    await clickButton(wrapper, '+3');
    await flushPromises();
    await clickButton(wrapper, ['Checkpoint', '创建快照']);
    await flushPromises();
    await clickButton(wrapper, '+3');
    await flushPromises();
    await clickButton(wrapper, ['Crash', '模拟崩溃']);
    await flushPromises();
    await clickButton(wrapper, ['Recover', '恢复']);
    // Let the replay animation finish so replayedCount > 0 and the stats panel shows.
    for (let i = 0; i < 12; i++) {
      vi.advanceTimersByTime(500);
      await flushPromises();
    }
    expect(wrapper.find('.cp-recovery-stats').exists()).toBe(true);

    // Step back to the pre-recovery step: replayedCount must travel with the
    // snapshot (it was 0 then), so the stats panel must disappear. Before the
    // fix it leaked the live value and lingered on historical steps.
    await playbackStepBack(wrapper);
    expect(wrapper.find('.cp-recovery-stats').exists()).toBe(false);
  });
});
