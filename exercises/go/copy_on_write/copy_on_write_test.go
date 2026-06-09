package copy_on_write

import "testing"

type COWList struct {
	data    []int
	refCount *int
}

func NewCOWList(items []int) COWList { // TODO: implement
	cp := make([]int, len(items))
	copy(cp, items)
	rc := 1
	return COWList{data: cp, refCount: &rc}
}

func (c COWList) Clone() COWList { // TODO: implement
	*c.refCount++
	return COWList{data: c.data, refCount: c.refCount}
}

func (c *COWList) ensureUnique() { // TODO: implement
	if *c.refCount > 1 {
		*c.refCount--
		cp := make([]int, len(c.data))
		copy(cp, c.data)
		c.data = cp
		rc := 1
		c.refCount = &rc
	}
}

func (c *COWList) Set(index int, value int) { // TODO: implement
	c.ensureUnique()
	c.data[index] = value
}

func (c COWList) Get(index int) int { // TODO: implement
	return c.data[index]
}

func (c COWList) Len() int { // TODO: implement
	return len(c.data)
}

func TestCOWSharedRead(t *testing.T) {
	a := NewCOWList([]int{1, 2, 3})
	b := a.Clone()

	if a.Get(0) != b.Get(0) {
		t.Error("clones should share same data")
	}
}

func TestCOWCopyOnWrite(t *testing.T) {
	a := NewCOWList([]int{1, 2, 3})
	b := a.Clone()

	b.Set(0, 99)

	if a.Get(0) != 1 {
		t.Errorf("original should be unchanged, got %d", a.Get(0))
	}
	if b.Get(0) != 99 {
		t.Errorf("clone should reflect mutation, got %d", b.Get(0))
	}
}

func TestCOWNoUnnecessaryCopy(t *testing.T) {
	a := NewCOWList([]int{10, 20})
	a.Set(0, 99) // sole owner, no copy needed
	if a.Get(0) != 99 {
		t.Errorf("should mutate in place when sole owner, got %d", a.Get(0))
	}
}
