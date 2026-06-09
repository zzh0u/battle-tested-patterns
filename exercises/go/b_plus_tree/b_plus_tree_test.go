package b_plus_tree

import (
	"sort"
	"testing"
)

type BPlusLeaf struct {
	keys   []int
	values []string
}

type BPlusTree struct {
	order  int
	leaves []*BPlusLeaf
}

func NewBPlusTree(order int) *BPlusTree { // TODO: implement
	return &BPlusTree{
		order:  order,
		leaves: []*BPlusLeaf{{}},
	}
}

func (t *BPlusTree) findLeaf(key int) *BPlusLeaf { // TODO: implement
	for _, leaf := range t.leaves {
		if len(leaf.keys) == 0 || key <= leaf.keys[len(leaf.keys)-1] {
			return leaf
		}
	}
	return t.leaves[len(t.leaves)-1]
}

func (t *BPlusTree) Insert(key int, value string) { // TODO: implement
	leaf := t.findLeaf(key)

	// Update existing
	for i, k := range leaf.keys {
		if k == key {
			leaf.values[i] = value
			return
		}
	}

	// Insert sorted
	pos := sort.SearchInts(leaf.keys, key)
	leaf.keys = append(leaf.keys, 0)
	leaf.values = append(leaf.values, "")
	copy(leaf.keys[pos+1:], leaf.keys[pos:])
	copy(leaf.values[pos+1:], leaf.values[pos:])
	leaf.keys[pos] = key
	leaf.values[pos] = value

	// Split if full
	if len(leaf.keys) > t.order {
		mid := len(leaf.keys) / 2
		newLeaf := &BPlusLeaf{
			keys:   append([]int{}, leaf.keys[mid:]...),
			values: append([]string{}, leaf.values[mid:]...),
		}
		leaf.keys = leaf.keys[:mid]
		leaf.values = leaf.values[:mid]

		// Insert new leaf after current
		for i, l := range t.leaves {
			if l == leaf {
				t.leaves = append(t.leaves[:i+1], append([]*BPlusLeaf{newLeaf}, t.leaves[i+1:]...)...)
				break
			}
		}
	}
}

func (t *BPlusTree) Search(key int) (string, bool) { // TODO: implement
	for _, leaf := range t.leaves {
		for i, k := range leaf.keys {
			if k == key {
				return leaf.values[i], true
			}
		}
	}
	return "", false
}

func (t *BPlusTree) RangeScan(low, high int) []string { // TODO: implement
	var result []string
	for _, leaf := range t.leaves {
		for i, k := range leaf.keys {
			if k >= low && k <= high {
				result = append(result, leaf.values[i])
			}
		}
	}
	return result
}

func TestBPlusTreeInsertAndSearch(t *testing.T) {
	tree := NewBPlusTree(3)
	tree.Insert(5, "five")
	tree.Insert(3, "three")
	tree.Insert(7, "seven")
	tree.Insert(1, "one")

	val, ok := tree.Search(3)
	if !ok || val != "three" {
		t.Errorf("expected three, got %q", val)
	}
	_, ok = tree.Search(99)
	if ok {
		t.Error("should not find nonexistent key")
	}
}

func TestBPlusTreeRangeScan(t *testing.T) {
	tree := NewBPlusTree(4)
	for i := 1; i <= 10; i++ {
		tree.Insert(i, string(rune('a'+i-1)))
	}

	result := tree.RangeScan(3, 6)
	if len(result) != 4 {
		t.Errorf("expected 4 results, got %d: %v", len(result), result)
	}
}

func TestBPlusTreeUpdate(t *testing.T) {
	tree := NewBPlusTree(3)
	tree.Insert(1, "old")
	tree.Insert(1, "new")

	val, ok := tree.Search(1)
	if !ok || val != "new" {
		t.Errorf("expected 'new', got %q", val)
	}
}

func TestBPlusTreeSplit(t *testing.T) {
	tree := NewBPlusTree(3) // splits after 3 keys
	for i := 1; i <= 10; i++ {
		tree.Insert(i, "v")
	}
	// All keys should still be findable
	for i := 1; i <= 10; i++ {
		_, ok := tree.Search(i)
		if !ok {
			t.Errorf("key %d should exist after splits", i)
		}
	}
}
