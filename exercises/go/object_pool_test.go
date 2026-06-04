package exercises

import (
	"sync"
	"testing"
)

type ObjectPool[T any] struct {
	pool sync.Pool
}

func NewObjectPool[T any](factory func() T) *ObjectPool[T] { // TODO: implement
	return &ObjectPool[T]{
		pool: sync.Pool{New: func() any { return factory() }},
	}
}

func (p *ObjectPool[T]) Get() T { // TODO: implement
	return p.pool.Get().(T)
}

func (p *ObjectPool[T]) Put(obj T) { // TODO: implement
	p.pool.Put(obj)
}

func TestObjectPoolGetAndPut(t *testing.T) {
	pool := NewObjectPool(func() []byte { return make([]byte, 1024) })

	buf := pool.Get()
	if len(buf) != 1024 {
		t.Errorf("expected 1024-byte buffer, got %d", len(buf))
	}
	buf[0] = 42
	pool.Put(buf)
}

func TestObjectPoolReuse(t *testing.T) {
	createCount := 0
	pool := NewObjectPool(func() *int {
		createCount++
		v := 0
		return &v
	})

	obj := pool.Get()
	*obj = 999
	pool.Put(obj)

	obj2 := pool.Get()
	// May or may not reuse depending on GC, but factory should have been called at most 2 times
	_ = obj2
}

func TestObjectPoolConcurrent(t *testing.T) {
	pool := NewObjectPool(func() []byte { return make([]byte, 64) })
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			buf := pool.Get()
			buf[0] = 1
			pool.Put(buf)
		}()
	}
	wg.Wait()
}
