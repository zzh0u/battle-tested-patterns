package semaphore

import (
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

type Semaphore struct {
	ch chan struct{}
}

func NewSemaphore(permits int) *Semaphore { // TODO: implement
	return &Semaphore{ch: make(chan struct{}, permits)}
}

func (s *Semaphore) Acquire() { // TODO: implement
	s.ch <- struct{}{}
}

func (s *Semaphore) Release() { // TODO: implement
	<-s.ch
}

func TestSemaphoreAcquireRelease(t *testing.T) {
	sem := NewSemaphore(2)
	sem.Acquire()
	sem.Acquire()
	sem.Release()
	sem.Acquire() // should not block
}

func TestSemaphoreLimits(t *testing.T) {
	sem := NewSemaphore(2)
	var maxConcurrent int64
	var current int64
	var wg sync.WaitGroup

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem.Acquire()
			c := atomic.AddInt64(&current, 1)
			for {
				old := atomic.LoadInt64(&maxConcurrent)
				if c <= old || atomic.CompareAndSwapInt64(&maxConcurrent, old, c) {
					break
				}
			}
			time.Sleep(time.Millisecond)
			atomic.AddInt64(&current, -1)
			sem.Release()
		}()
	}
	wg.Wait()

	if maxConcurrent > 2 {
		t.Errorf("max concurrent %d exceeded semaphore limit 2", maxConcurrent)
	}
}

func TestSemaphoreAvailableSlots(t *testing.T) {
	sem := NewSemaphore(3)
	sem.Acquire()
	sem.Acquire()
	sem.Release()
	sem.Release()
	sem.Acquire()
	sem.Acquire()
	sem.Acquire()
	sem.Release()
	sem.Release()
	sem.Release()
}
