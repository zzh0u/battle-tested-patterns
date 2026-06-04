package exercises

import "testing"

type Checkpoint[T any] struct {
	history []T
}

func NewCheckpoint[T any]() *Checkpoint[T] { // TODO: implement
	return &Checkpoint[T]{}
}

func (c *Checkpoint[T]) Save(state T) { // TODO: implement
	c.history = append(c.history, state)
}

func (c *Checkpoint[T]) Restore(index int) (T, bool) { // TODO: implement
	if index < 0 || index >= len(c.history) {
		var zero T
		return zero, false
	}
	return c.history[index], true
}

func (c *Checkpoint[T]) Latest() (T, bool) { // TODO: implement
	if len(c.history) == 0 {
		var zero T
		return zero, false
	}
	return c.history[len(c.history)-1], true
}

func (c *Checkpoint[T]) Len() int { return len(c.history) }

func TestCheckpointSaveAndRestore(t *testing.T) {
	cp := NewCheckpoint[int]()
	cp.Save(10)
	cp.Save(20)
	cp.Save(30)

	val, ok := cp.Restore(0)
	if !ok || val != 10 {
		t.Errorf("expected 10, got %d", val)
	}
	val, ok = cp.Restore(2)
	if !ok || val != 30 {
		t.Errorf("expected 30, got %d", val)
	}
}

func TestCheckpointLatest(t *testing.T) {
	cp := NewCheckpoint[string]()
	cp.Save("v1")
	cp.Save("v2")

	val, ok := cp.Latest()
	if !ok || val != "v2" {
		t.Errorf("expected v2, got %s", val)
	}
}

func TestCheckpointEmpty(t *testing.T) {
	cp := NewCheckpoint[int]()
	_, ok := cp.Latest()
	if ok {
		t.Error("empty checkpoint should return false")
	}
	_, ok = cp.Restore(0)
	if ok {
		t.Error("restore from empty should return false")
	}
}

func TestCheckpointOutOfBounds(t *testing.T) {
	cp := NewCheckpoint[int]()
	cp.Save(1)
	_, ok := cp.Restore(5)
	if ok {
		t.Error("out of bounds restore should return false")
	}
	_, ok = cp.Restore(-1)
	if ok {
		t.Error("negative index should return false")
	}
}
