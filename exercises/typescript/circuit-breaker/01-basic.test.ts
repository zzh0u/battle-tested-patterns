import { describe, it, expect } from 'vitest';

/**
 * Circuit Breaker - Basic: Implement a circuit breaker with three states.
 *
 * TODO: Implement a CircuitBreaker that tracks failures and transitions
 * between CLOSED (normal), OPEN (failing fast), and HALF_OPEN (testing).
 *
 * - CLOSED: calls pass through. After `threshold` consecutive failures → OPEN.
 * - OPEN: calls fail immediately. After `resetTimeout` ms → HALF_OPEN.
 * - HALF_OPEN: next call is a probe. Success → CLOSED. Failure → OPEN.
 */

type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
  private state: State = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private threshold: number,
    private resetTimeout: number,
  ) {} // TODO: implement

  getState(): State {
    if (this.state === 'OPEN' && Date.now() - this.lastFailureTime >= this.resetTimeout) {
      this.state = 'HALF_OPEN';
    }
    return this.state;
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    // TODO: implement
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      throw new Error('Circuit is OPEN');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Circuit Breaker - Basic', () => {
  it('should start in CLOSED state', () => {
    const cb = new CircuitBreaker(3, 1000);
    expect(cb.getState()).toBe('CLOSED');
  });

  it('should pass through successful calls', async () => {
    const cb = new CircuitBreaker(3, 1000);
    const result = await cb.call(async () => 'ok');
    expect(result).toBe('ok');
    expect(cb.getState()).toBe('CLOSED');
  });

  it('should open after threshold failures', async () => {
    const cb = new CircuitBreaker(3, 1000);
    const fail = async () => { throw new Error('fail'); };

    for (let i = 0; i < 3; i++) {
      await expect(cb.call(fail)).rejects.toThrow('fail');
    }
    expect(cb.getState()).toBe('OPEN');
  });

  it('should fail fast when OPEN', async () => {
    const cb = new CircuitBreaker(2, 5000);
    const fail = async () => { throw new Error('fail'); };

    await expect(cb.call(fail)).rejects.toThrow('fail');
    await expect(cb.call(fail)).rejects.toThrow('fail');
    expect(cb.getState()).toBe('OPEN');

    await expect(cb.call(async () => 'ok')).rejects.toThrow('Circuit is OPEN');
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    const cb = new CircuitBreaker(2, 50);
    const fail = async () => { throw new Error('fail'); };

    await expect(cb.call(fail)).rejects.toThrow();
    await expect(cb.call(fail)).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');

    await new Promise((r) => setTimeout(r, 60));
    expect(cb.getState()).toBe('HALF_OPEN');
  });

  it('should close on successful probe in HALF_OPEN', async () => {
    const cb = new CircuitBreaker(2, 50);
    const fail = async () => { throw new Error('fail'); };

    await expect(cb.call(fail)).rejects.toThrow();
    await expect(cb.call(fail)).rejects.toThrow();

    await new Promise((r) => setTimeout(r, 60));
    expect(cb.getState()).toBe('HALF_OPEN');

    const result = await cb.call(async () => 'recovered');
    expect(result).toBe('recovered');
    expect(cb.getState()).toBe('CLOSED');
  });

  it('should reopen on failed probe in HALF_OPEN', async () => {
    const cb = new CircuitBreaker(2, 50);
    const fail = async () => { throw new Error('fail'); };

    await expect(cb.call(fail)).rejects.toThrow();
    await expect(cb.call(fail)).rejects.toThrow();

    await new Promise((r) => setTimeout(r, 60));
    await expect(cb.call(fail)).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');
  });
});
