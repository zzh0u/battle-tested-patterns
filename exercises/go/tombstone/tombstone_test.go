package tombstone

import "testing"

type TombstoneStore struct {
	data map[string]string
	dead map[string]bool
}

func NewTombstoneStore() *TombstoneStore { // TODO: implement
	return &TombstoneStore{
		data: make(map[string]string),
		dead: make(map[string]bool),
	}
}

func (s *TombstoneStore) Put(key, value string) { // TODO: implement
	s.data[key] = value
	delete(s.dead, key)
}

func (s *TombstoneStore) Get(key string) (string, bool) { // TODO: implement
	if s.dead[key] {
		return "", false
	}
	v, ok := s.data[key]
	return v, ok
}

func (s *TombstoneStore) Delete(key string) { // TODO: implement
	s.dead[key] = true
}

func (s *TombstoneStore) IsDeleted(key string) bool { // TODO: implement
	return s.dead[key]
}

func (s *TombstoneStore) Compact() { // TODO: implement
	for k := range s.dead {
		delete(s.data, k)
		delete(s.dead, k)
	}
}

func (s *TombstoneStore) Len() int { // TODO: implement
	count := 0
	for k := range s.data {
		if !s.dead[k] {
			count++
		}
	}
	return count
}

func TestTombstonePutGet(t *testing.T) {
	s := NewTombstoneStore()
	s.Put("a", "1")
	v, ok := s.Get("a")
	if !ok || v != "1" {
		t.Errorf("expected 1, got %q", v)
	}
}

func TestTombstoneDelete(t *testing.T) {
	s := NewTombstoneStore()
	s.Put("a", "1")
	s.Delete("a")

	_, ok := s.Get("a")
	if ok {
		t.Error("deleted key should not be found")
	}
	if !s.IsDeleted("a") {
		t.Error("should report as deleted")
	}
}

func TestTombstoneReinsert(t *testing.T) {
	s := NewTombstoneStore()
	s.Put("a", "1")
	s.Delete("a")
	s.Put("a", "2")

	v, ok := s.Get("a")
	if !ok || v != "2" {
		t.Errorf("reinserted key should return 2, got %q", v)
	}
	if s.IsDeleted("a") {
		t.Error("should not be marked deleted after reinsertion")
	}
}

func TestTombstoneCompact(t *testing.T) {
	s := NewTombstoneStore()
	s.Put("a", "1")
	s.Put("b", "2")
	s.Delete("a")
	s.Compact()

	if s.IsDeleted("a") {
		t.Error("tombstone should be removed after compact")
	}
	v, ok := s.Get("b")
	if !ok || v != "2" {
		t.Error("non-deleted key should survive compact")
	}
	if s.Len() != 1 {
		t.Errorf("expected len 1, got %d", s.Len())
	}
}
