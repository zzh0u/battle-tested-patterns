package exercises

import "testing"

type Version struct {
	value     string
	timestamp uint64
	deleted   bool
}

type MVCCStore struct {
	data    map[string][]Version
	clock   uint64
}

func NewMVCCStore() *MVCCStore {
	return &MVCCStore{data: make(map[string][]Version)}
}

func (s *MVCCStore) Put(key, value string) uint64 {
	s.clock++
	s.data[key] = append(s.data[key], Version{value: value, timestamp: s.clock})
	return s.clock
}

func (s *MVCCStore) Get(key string, asOf uint64) (string, bool) {
	versions := s.data[key]
	for i := len(versions) - 1; i >= 0; i-- {
		if versions[i].timestamp <= asOf {
			if versions[i].deleted {
				return "", false
			}
			return versions[i].value, true
		}
	}
	return "", false
}

func (s *MVCCStore) Delete(key string) uint64 {
	s.clock++
	s.data[key] = append(s.data[key], Version{deleted: true, timestamp: s.clock})
	return s.clock
}

func (s *MVCCStore) Clock() uint64 { return s.clock }

func TestMVCCBasic(t *testing.T) {
	s := NewMVCCStore()
	ts := s.Put("key", "v1")

	v, ok := s.Get("key", ts)
	if !ok || v != "v1" {
		t.Errorf("expected v1, got %q", v)
	}
}

func TestMVCCTimeTravel(t *testing.T) {
	s := NewMVCCStore()
	ts1 := s.Put("key", "v1")
	ts2 := s.Put("key", "v2")
	_ = s.Put("key", "v3")

	v, _ := s.Get("key", ts1)
	if v != "v1" {
		t.Errorf("at ts1, expected v1, got %q", v)
	}
	v, _ = s.Get("key", ts2)
	if v != "v2" {
		t.Errorf("at ts2, expected v2, got %q", v)
	}
}

func TestMVCCDelete(t *testing.T) {
	s := NewMVCCStore()
	ts1 := s.Put("key", "alive")
	tsD := s.Delete("key")

	_, ok := s.Get("key", tsD)
	if ok {
		t.Error("should not find deleted key at delete timestamp")
	}
	v, ok := s.Get("key", ts1)
	if !ok || v != "alive" {
		t.Error("should still see key before deletion")
	}
}

func TestMVCCFuture(t *testing.T) {
	s := NewMVCCStore()
	s.Put("key", "v1")

	_, ok := s.Get("key", 0) // before any write
	if ok {
		t.Error("should not find key before it was written")
	}
}
