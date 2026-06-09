package lsm_tree

import (
	"sort"
	"testing"
)

type LSMTree struct {
	memTable  map[string]string
	threshold int
	sstables  []map[string]string
}

func NewLSMTree(threshold int) *LSMTree { // TODO: implement
	return &LSMTree{
		memTable:  make(map[string]string),
		threshold: threshold,
	}
}

func (l *LSMTree) Put(key, value string) { // TODO: implement
	l.memTable[key] = value
	if len(l.memTable) >= l.threshold {
		l.flush()
	}
}

func (l *LSMTree) flush() { // TODO: implement
	if len(l.memTable) == 0 {
		return
	}
	frozen := l.memTable
	l.memTable = make(map[string]string)
	l.sstables = append(l.sstables, frozen)
}

func (l *LSMTree) Get(key string) (string, bool) { // TODO: implement
	// Check memtable first (newest)
	if v, ok := l.memTable[key]; ok {
		return v, true
	}
	// Check sstables from newest to oldest
	for i := len(l.sstables) - 1; i >= 0; i-- {
		if v, ok := l.sstables[i][key]; ok {
			return v, true
		}
	}
	return "", false
}

func (l *LSMTree) Flush() { l.flush() }

func (l *LSMTree) SSTCount() int { return len(l.sstables) }

func (l *LSMTree) AllKeys() []string { // TODO: implement
	seen := make(map[string]bool)
	for k := range l.memTable {
		seen[k] = true
	}
	for _, sst := range l.sstables {
		for k := range sst {
			seen[k] = true
		}
	}
	keys := make([]string, 0, len(seen))
	for k := range seen {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func TestLSMTreePutGet(t *testing.T) {
	l := NewLSMTree(10)
	l.Put("foo", "bar")
	l.Put("baz", "qux")

	v, ok := l.Get("foo")
	if !ok || v != "bar" {
		t.Errorf("expected bar, got %q", v)
	}
}

func TestLSMTreeAutoFlush(t *testing.T) {
	l := NewLSMTree(3)
	l.Put("a", "1")
	l.Put("b", "2")
	l.Put("c", "3") // triggers flush

	if l.SSTCount() != 1 {
		t.Errorf("expected 1 sstable, got %d", l.SSTCount())
	}
	// All keys still findable
	v, ok := l.Get("a")
	if !ok || v != "1" {
		t.Errorf("expected 1, got %q", v)
	}
}

func TestLSMTreeOverwrite(t *testing.T) {
	l := NewLSMTree(10)
	l.Put("key", "old")
	l.Flush()
	l.Put("key", "new")

	v, ok := l.Get("key")
	if !ok || v != "new" {
		t.Errorf("expected new (memtable), got %q", v)
	}
}

func TestLSMTreeMissing(t *testing.T) {
	l := NewLSMTree(10)
	l.Put("a", "1")
	_, ok := l.Get("z")
	if ok {
		t.Error("should not find nonexistent key")
	}
}
