import { describe, it, expect } from 'vitest';

/**
 * Trie - Basic: Implement a prefix tree.
 *
 * TODO: Implement a Trie with insert(), search(), and startsWith().
 */

class TrieNode {
  children = new Map<string, TrieNode>();
  isEnd = false;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    // TODO: implement
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    // TODO: implement
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix: string): boolean {
    // TODO: implement
    return this.findNode(prefix) !== null;
  }

  private findNode(s: string): TrieNode | null {
    let node = this.root;
    for (const ch of s) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Trie - Basic', () => {
  it('should insert and search words', () => {
    const trie = new Trie();
    trie.insert('apple');
    expect(trie.search('apple')).toBe(true);
    expect(trie.search('app')).toBe(false);
  });

  it('should check prefix existence', () => {
    const trie = new Trie();
    trie.insert('apple');
    expect(trie.startsWith('app')).toBe(true);
    expect(trie.startsWith('apl')).toBe(false);
  });

  it('should handle multiple words with shared prefix', () => {
    const trie = new Trie();
    trie.insert('car');
    trie.insert('card');
    trie.insert('care');
    trie.insert('careful');

    expect(trie.search('car')).toBe(true);
    expect(trie.search('card')).toBe(true);
    expect(trie.search('care')).toBe(true);
    expect(trie.search('careful')).toBe(true);
    expect(trie.search('ca')).toBe(false);
  });

  it('should handle empty trie', () => {
    const trie = new Trie();
    expect(trie.search('anything')).toBe(false);
    expect(trie.startsWith('')).toBe(true);
  });

  it('should distinguish between prefix and full word', () => {
    const trie = new Trie();
    trie.insert('hello');
    expect(trie.startsWith('hell')).toBe(true);
    expect(trie.search('hell')).toBe(false);
    trie.insert('hell');
    expect(trie.search('hell')).toBe(true);
  });
});
