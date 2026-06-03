import { describe, it, expect } from 'vitest';

/**
 * Vtable - Intermediate: Plugin system with vtable-based extension.
 *
 * TODO: Implement a storage plugin system where each plugin provides
 * a vtable of operations (read, write, delete, list). New storage
 * backends can be added without modifying the core framework.
 *
 * Real-world use: Linux file_operations, database storage engines.
 */

interface StorageOps {
  read: (key: string) => string | undefined;
  write: (key: string, value: string) => void;
  remove: (key: string) => boolean;
  list: () => string[];
}

interface StoragePlugin {
  name: string;
  ops: StorageOps;
}

/** Create an in-memory storage plugin */
function createMemoryPlugin(): StoragePlugin {
  // TODO: implement
  const store = new Map<string, string>();
  return {
    name: 'memory',
    ops: {
      read: (key) => store.get(key),
      write: (key, value) => { store.set(key, value); },
      remove: (key) => store.delete(key),
      list: () => [...store.keys()],
    },
  };
}

/** Create a prefixed storage plugin that wraps another plugin */
function createPrefixedPlugin(inner: StoragePlugin, prefix: string): StoragePlugin {
  // TODO: implement — wrap inner ops, prefixing all keys
  return {
    name: `prefixed(${inner.name})`,
    ops: {
      read: (key) => inner.ops.read(prefix + key),
      write: (key, value) => inner.ops.write(prefix + key, value),
      remove: (key) => inner.ops.remove(prefix + key),
      list: () =>
        inner.ops.list()
          .filter((k) => k.startsWith(prefix))
          .map((k) => k.slice(prefix.length)),
    },
  };
}

/** A storage manager that dispatches through plugin vtables */
class StorageManager {
  private plugins = new Map<string, StoragePlugin>();

  register(plugin: StoragePlugin): void {
    // TODO: implement
    this.plugins.set(plugin.name, plugin);
  }

  /** Dispatch read to the named plugin */
  read(pluginName: string, key: string): string | undefined {
    // TODO: implement
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return undefined;
    return plugin.ops.read(key);
  }

  /** Dispatch write to the named plugin */
  write(pluginName: string, key: string, value: string): void {
    // TODO: implement
    const plugin = this.plugins.get(pluginName);
    if (!plugin) throw new Error(`Unknown plugin: ${pluginName}`);
    plugin.ops.write(key, value);
  }

  /** Dispatch list to the named plugin */
  list(pluginName: string): string[] {
    // TODO: implement
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return [];
    return plugin.ops.list();
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Vtable - Intermediate: Plugin System', () => {
  it('should read and write through memory plugin vtable', () => {
    const mem = createMemoryPlugin();
    mem.ops.write('key1', 'value1');
    expect(mem.ops.read('key1')).toBe('value1');
    expect(mem.ops.read('missing')).toBeUndefined();
  });

  it('should list keys through plugin vtable', () => {
    const mem = createMemoryPlugin();
    mem.ops.write('a', '1');
    mem.ops.write('b', '2');
    expect(mem.ops.list().sort()).toEqual(['a', 'b']);
  });

  it('should dispatch through StorageManager to registered plugins', () => {
    const manager = new StorageManager();
    const mem = createMemoryPlugin();
    manager.register(mem);

    manager.write('memory', 'greeting', 'hello');
    expect(manager.read('memory', 'greeting')).toBe('hello');
  });

  it('should support prefixed plugin wrapping another plugin', () => {
    const mem = createMemoryPlugin();
    const prefixed = createPrefixedPlugin(mem, 'user:');

    prefixed.ops.write('name', 'Alice');
    // The inner store has "user:name"
    expect(mem.ops.read('user:name')).toBe('Alice');
    // The prefixed plugin strips the prefix on read
    expect(prefixed.ops.read('name')).toBe('Alice');
    expect(prefixed.ops.list()).toEqual(['name']);
  });

  it('should handle multiple plugins independently', () => {
    const manager = new StorageManager();
    const plugin1 = createMemoryPlugin();
    const plugin2 = createMemoryPlugin();
    // Override names to distinguish
    (plugin1 as { name: string }).name = 'store-a';
    (plugin2 as { name: string }).name = 'store-b';

    manager.register(plugin1);
    manager.register(plugin2);

    manager.write('store-a', 'x', '100');
    manager.write('store-b', 'x', '200');
    expect(manager.read('store-a', 'x')).toBe('100');
    expect(manager.read('store-b', 'x')).toBe('200');
  });
});
