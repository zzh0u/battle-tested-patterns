package exercises

import "testing"

type FreeList struct {
	pool []int
	free []int
}

func NewFreeList(size int) *FreeList {
	free := make([]int, size)
	for i := range free {
		free[i] = size - 1 - i // stack: top = 0
	}
	return &FreeList{
		pool: make([]int, size),
		free: free,
	}
}

func (fl *FreeList) Alloc() (int, bool) {
	if len(fl.free) == 0 {
		return -1, false
	}
	idx := fl.free[len(fl.free)-1]
	fl.free = fl.free[:len(fl.free)-1]
	return idx, true
}

func (fl *FreeList) Free(idx int) {
	fl.free = append(fl.free, idx)
	fl.pool[idx] = 0
}

func (fl *FreeList) Set(idx, val int) { fl.pool[idx] = val }
func (fl *FreeList) Get(idx int) int   { return fl.pool[idx] }
func (fl *FreeList) Available() int    { return len(fl.free) }

func TestFreeListAllocAndFree(t *testing.T) {
	fl := NewFreeList(4)
	if fl.Available() != 4 {
		t.Fatalf("expected 4 available, got %d", fl.Available())
	}

	i1, ok := fl.Alloc()
	if !ok {
		t.Fatal("alloc should succeed")
	}
	fl.Set(i1, 42)
	if fl.Get(i1) != 42 {
		t.Error("should read back value")
	}
	if fl.Available() != 3 {
		t.Errorf("expected 3 available, got %d", fl.Available())
	}
}

func TestFreeListExhaustion(t *testing.T) {
	fl := NewFreeList(2)
	fl.Alloc()
	fl.Alloc()
	_, ok := fl.Alloc()
	if ok {
		t.Error("should fail when exhausted")
	}
}

func TestFreeListReuse(t *testing.T) {
	fl := NewFreeList(2)
	i1, _ := fl.Alloc()
	fl.Set(i1, 100)
	fl.Free(i1)

	i2, ok := fl.Alloc()
	if !ok {
		t.Fatal("should reuse freed slot")
	}
	if fl.Get(i2) != 0 {
		t.Error("freed slot should be zeroed")
	}
}

func TestFreeListAllAllocAndFree(t *testing.T) {
	fl := NewFreeList(8)
	indices := make([]int, 8)
	for i := 0; i < 8; i++ {
		idx, ok := fl.Alloc()
		if !ok {
			t.Fatal("should allocate all slots")
		}
		indices[i] = idx
	}
	if fl.Available() != 0 {
		t.Error("all slots should be used")
	}
	for _, idx := range indices {
		fl.Free(idx)
	}
	if fl.Available() != 8 {
		t.Error("all slots should be free after freeing all")
	}
}
