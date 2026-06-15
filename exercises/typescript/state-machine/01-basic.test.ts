import { describe, it, expect } from 'vitest';

/**
 * State Machine - Basic: Finite state transitions.
 *
 * TODO: Implement a StateMachine class that accepts a config
 * of states and transitions, and processes events.
 */

type StateConfig = Record<string, { on: Record<string, string> }>;

class StateMachine {
  private current: string;
  private config: StateConfig;

  constructor(config: StateConfig, initial: string) {
    this.config = config; // TODO: implement
    this.current = initial;
  }

  get state(): string {
    return this.current; // TODO: implement
  }

  /** Transition to next state if the event is valid */
  send(event: string): string {
    const next = this.config[this.current]?.on[event]; // TODO: implement
    if (next !== undefined) this.current = next;
    return this.current;
  }

  /** Check if an event is valid from current state */
  can(event: string): boolean {
    return this.config[this.current]?.on[event] !== undefined; // TODO: implement
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('State Machine - Basic: Finite State Transitions', () => {
  const trafficConfig: StateConfig = {
    green: { on: { TIMER: 'yellow' } },
    yellow: { on: { TIMER: 'red' } },
    red: { on: { TIMER: 'green' } },
  };

  it('should start in initial state', () => {
    const sm = new StateMachine(trafficConfig, 'green');
    expect(sm.state).toBe('green');
  });

  it('should transition on valid event', () => {
    const sm = new StateMachine(trafficConfig, 'green');
    expect(sm.send('TIMER')).toBe('yellow');
    expect(sm.send('TIMER')).toBe('red');
    expect(sm.send('TIMER')).toBe('green');
  });

  it('should ignore invalid events', () => {
    const sm = new StateMachine(trafficConfig, 'green');
    expect(sm.send('INVALID')).toBe('green');
  });

  it('should report which events are valid', () => {
    const sm = new StateMachine(trafficConfig, 'green');
    expect(sm.can('TIMER')).toBe(true);
    expect(sm.can('RESET')).toBe(false);
  });

  it('should enforce impossible transitions', () => {
    const fetchConfig: StateConfig = {
      idle: { on: { FETCH: 'loading' } },
      loading: { on: { RESOLVE: 'success', REJECT: 'error' } },
      success: { on: { RESET: 'idle' } },
      error: { on: { RETRY: 'loading' } },
    };

    const sm = new StateMachine(fetchConfig, 'idle');
    sm.send('FETCH');
    expect(sm.state).toBe('loading');

    // Can't go directly from loading to idle
    sm.send('RESET');
    expect(sm.state).toBe('loading');

    sm.send('RESOLVE');
    expect(sm.state).toBe('success');

    // Can't go from success to error
    sm.send('REJECT');
    expect(sm.state).toBe('success');
  });
});
