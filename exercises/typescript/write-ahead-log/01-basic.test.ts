import { describe, it, expect } from 'vitest';

/**
 * Write-Ahead Log - Basic: Implement an in-memory WAL.
 *
 * TODO: Implement a WriteAheadLog that:
 * - append(entry): logs a mutation before applying it
 * - apply(applyFn): applies all unapplied entries
 * - recover(applyFn): replays the entire log (simulates crash recovery)
 */

interface LogEntry {
  id: number;
  operation: string;
  data: Record<string, unknown>;
  applied: boolean;
}

class WriteAheadLog {
  private entries: LogEntry[] = [];
  private nextId = 1;

  append(operation: string, data: Record<string, unknown>): number {
    // TODO: implement
    const id = this.nextId++;
    this.entries.push({ id, operation, data, applied: false });
    return id;
  }

  apply(applyFn: (entry: LogEntry) => void): number {
    // TODO: implement
    let count = 0;
    for (const entry of this.entries) {
      if (!entry.applied) {
        applyFn(entry);
        entry.applied = true;
        count++;
      }
    }
    return count;
  }

  recover(applyFn: (entry: LogEntry) => void): number {
    // TODO: implement
    let count = 0;
    for (const entry of this.entries) {
      applyFn(entry);
      entry.applied = true;
      count++;
    }
    return count;
  }

  get length(): number {
    return this.entries.length;
  }

  get pending(): number {
    return this.entries.filter((e) => !e.applied).length;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Write-Ahead Log - Basic', () => {
  it('should append entries with sequential IDs', () => {
    const wal = new WriteAheadLog();
    const id1 = wal.append('INSERT', { key: 'a', value: 1 });
    const id2 = wal.append('UPDATE', { key: 'a', value: 2 });

    expect(id1).toBe(1);
    expect(id2).toBe(2);
    expect(wal.length).toBe(2);
    expect(wal.pending).toBe(2);
  });

  it('should apply unapplied entries', () => {
    const wal = new WriteAheadLog();
    const state: Record<string, number> = {};

    wal.append('SET', { key: 'x', value: 10 });
    wal.append('SET', { key: 'y', value: 20 });

    const applied = wal.apply((entry) => {
      state[entry.data.key as string] = entry.data.value as number;
    });

    expect(applied).toBe(2);
    expect(state).toEqual({ x: 10, y: 20 });
    expect(wal.pending).toBe(0);
  });

  it('should not re-apply already applied entries', () => {
    const wal = new WriteAheadLog();
    let count = 0;

    wal.append('INC', {});
    wal.apply(() => { count++; });
    expect(count).toBe(1);

    wal.apply(() => { count++; });
    expect(count).toBe(1); // should not increment again
  });

  it('should recover by replaying all entries', () => {
    const wal = new WriteAheadLog();
    const state: Record<string, number> = {};

    wal.append('SET', { key: 'a', value: 1 });
    wal.append('SET', { key: 'b', value: 2 });
    wal.apply((entry) => {
      state[entry.data.key as string] = entry.data.value as number;
    });

    // Simulate crash: state is wiped
    const newState: Record<string, number> = {};
    const recovered = wal.recover((entry) => {
      newState[entry.data.key as string] = entry.data.value as number;
    });

    expect(recovered).toBe(2);
    expect(newState).toEqual({ a: 1, b: 2 });
  });

  it('should handle append after apply', () => {
    const wal = new WriteAheadLog();

    wal.append('A', {});
    wal.apply(() => {});
    wal.append('B', {});

    expect(wal.pending).toBe(1);
    expect(wal.length).toBe(2);
  });
});
