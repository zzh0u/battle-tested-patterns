package interning

import "testing"

type Interner struct {
	pool map[string]*string
}

func NewInterner() *Interner { // TODO: implement
	return &Interner{pool: make(map[string]*string)}
}

func (in *Interner) Intern(s string) *string { // TODO: implement
	if ptr, ok := in.pool[s]; ok {
		return ptr
	}
	cp := s
	in.pool[s] = &cp
	return &cp
}

func (in *Interner) Len() int { return len(in.pool) }

func TestInternerSamePointer(t *testing.T) {
	interner := NewInterner()
	p1 := interner.Intern("hello")
	p2 := interner.Intern("hello")
	if p1 != p2 {
		t.Error("same string should return same pointer")
	}
}

func TestInternerDifferentStrings(t *testing.T) {
	interner := NewInterner()
	p1 := interner.Intern("hello")
	p2 := interner.Intern("world")
	if p1 == p2 {
		t.Error("different strings should return different pointers")
	}
	if interner.Len() != 2 {
		t.Errorf("expected pool size 2, got %d", interner.Len())
	}
}

func TestInternerValue(t *testing.T) {
	interner := NewInterner()
	p := interner.Intern("test")
	if *p != "test" {
		t.Errorf("expected 'test', got %q", *p)
	}
}

func TestInternerManyStrings(t *testing.T) {
	interner := NewInterner()
	strs := []string{"alpha", "beta", "gamma", "alpha", "beta"}
	ptrs := make([]*string, len(strs))
	for i, s := range strs {
		ptrs[i] = interner.Intern(s)
	}

	if interner.Len() != 3 {
		t.Errorf("expected 3 unique, got %d", interner.Len())
	}
	// "alpha" at index 0 and 3 should be same pointer
	if ptrs[0] != ptrs[3] {
		t.Error("alpha pointers should match")
	}
	// "beta" at index 1 and 4 should be same pointer
	if ptrs[1] != ptrs[4] {
		t.Error("beta pointers should match")
	}
}
