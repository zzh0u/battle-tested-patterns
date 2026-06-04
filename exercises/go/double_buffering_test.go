package exercises

import "testing"

type DoubleBuffer struct {
	buffers [2][]byte
	front   int
}

func NewDoubleBuffer(size int) *DoubleBuffer { // TODO: implement
	return &DoubleBuffer{
		buffers: [2][]byte{make([]byte, size), make([]byte, size)},
		front:   0,
	}
}

func (db *DoubleBuffer) Back() []byte { // TODO: implement
	return db.buffers[1-db.front]
}

func (db *DoubleBuffer) Front() []byte { // TODO: implement
	return db.buffers[db.front]
}

func (db *DoubleBuffer) Swap() { // TODO: implement
	db.front = 1 - db.front
}

func TestDoubleBufferSwap(t *testing.T) {
	db := NewDoubleBuffer(4)
	back := db.Back()
	back[0] = 'A'
	back[1] = 'B'

	db.Swap()
	front := db.Front()
	if front[0] != 'A' || front[1] != 'B' {
		t.Error("after swap, front should contain back's data")
	}
}

func TestDoubleBufferIndependence(t *testing.T) {
	db := NewDoubleBuffer(4)
	db.Back()[0] = 'X'
	if db.Front()[0] == 'X' {
		t.Error("front and back should be independent before swap")
	}
}

func TestDoubleBufferMultipleSwaps(t *testing.T) {
	db := NewDoubleBuffer(2)
	db.Back()[0] = 1
	db.Swap()
	db.Back()[0] = 2
	db.Swap()

	if db.Front()[0] != 2 {
		t.Errorf("expected 2, got %d", db.Front()[0])
	}
}
