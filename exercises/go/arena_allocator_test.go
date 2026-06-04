package exercises

import "testing"

type Arena struct {
	buf []byte
	off int
}

func NewArena(size int) *Arena {
	return &Arena{buf: make([]byte, size)}
}

func (a *Arena) Alloc(n int) ([]byte, bool) {
	if a.off+n > len(a.buf) {
		return nil, false
	}
	slice := a.buf[a.off : a.off+n]
	a.off += n
	return slice, true
}

func (a *Arena) Reset() {
	a.off = 0
}

func (a *Arena) Used() int  { return a.off }
func (a *Arena) Cap() int   { return len(a.buf) }
func (a *Arena) Avail() int { return len(a.buf) - a.off }

func TestArenaAlloc(t *testing.T) {
	a := NewArena(64)
	s1, ok := a.Alloc(16)
	if !ok || len(s1) != 16 {
		t.Fatal("first alloc should succeed")
	}
	s2, ok := a.Alloc(32)
	if !ok || len(s2) != 32 {
		t.Fatal("second alloc should succeed")
	}
	if a.Used() != 48 {
		t.Errorf("expected used=48, got %d", a.Used())
	}
}

func TestArenaOverflow(t *testing.T) {
	a := NewArena(32)
	_, ok := a.Alloc(16)
	if !ok {
		t.Fatal("should succeed")
	}
	_, ok = a.Alloc(20)
	if ok {
		t.Error("should fail when not enough space")
	}
}

func TestArenaReset(t *testing.T) {
	a := NewArena(64)
	a.Alloc(32)
	a.Alloc(16)
	a.Reset()
	if a.Used() != 0 {
		t.Errorf("expected used=0 after reset, got %d", a.Used())
	}
	if a.Avail() != 64 {
		t.Errorf("expected avail=64 after reset, got %d", a.Avail())
	}
}

func TestArenaDisjoint(t *testing.T) {
	a := NewArena(64)
	s1, _ := a.Alloc(8)
	s2, _ := a.Alloc(8)
	// Write to s1 shouldn't affect s2
	for i := range s1 {
		s1[i] = 0xFF
	}
	for _, b := range s2 {
		if b != 0 {
			t.Error("allocations should be disjoint")
		}
	}
}
