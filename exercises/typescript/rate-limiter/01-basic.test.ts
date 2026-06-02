import { describe, it, expect } from 'vitest';

/**
 * Rate Limiter - Basic: Implement a token bucket rate limiter.
 *
 * TODO: Implement a TokenBucket that allows up to `rate` operations
 * per second with burst capacity.
 */

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number,
  ) {
    // TODO: implement
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  tryAcquire(tokens = 1): boolean {
    // TODO: implement
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  get available(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Rate Limiter - Basic', () => {
  it('should allow requests within capacity', () => {
    const bucket = new TokenBucket(5, 1);
    expect(bucket.tryAcquire()).toBe(true);
    expect(bucket.tryAcquire()).toBe(true);
    expect(bucket.tryAcquire()).toBe(true);
  });

  it('should reject when tokens exhausted', () => {
    const bucket = new TokenBucket(2, 0.1);
    expect(bucket.tryAcquire()).toBe(true);
    expect(bucket.tryAcquire()).toBe(true);
    expect(bucket.tryAcquire()).toBe(false);
  });

  it('should refill tokens over time', async () => {
    const bucket = new TokenBucket(2, 100); // 100 tokens/sec
    bucket.tryAcquire();
    bucket.tryAcquire();
    expect(bucket.tryAcquire()).toBe(false);

    await new Promise((r) => setTimeout(r, 50)); // wait 50ms = ~5 tokens
    expect(bucket.tryAcquire()).toBe(true);
  });

  it('should not exceed capacity', async () => {
    const bucket = new TokenBucket(3, 1000);
    await new Promise((r) => setTimeout(r, 50)); // lots of refill
    expect(bucket.available).toBeLessThanOrEqual(3);
  });

  it('should support multi-token acquire', () => {
    const bucket = new TokenBucket(10, 1);
    expect(bucket.tryAcquire(5)).toBe(true);
    expect(bucket.tryAcquire(5)).toBe(true);
    expect(bucket.tryAcquire(1)).toBe(false);
  });
});
