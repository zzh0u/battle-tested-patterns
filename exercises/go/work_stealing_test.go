package exercises

import (
	"sync"
	"testing"
)

type WorkQueue struct {
	mu    sync.Mutex
	items []int
}

func (q *WorkQueue) Push(item int) {
	q.mu.Lock()
	q.items = append(q.items, item)
	q.mu.Unlock()
}

func (q *WorkQueue) Pop() (int, bool) {
	q.mu.Lock()
	defer q.mu.Unlock()
	if len(q.items) == 0 {
		return 0, false
	}
	item := q.items[len(q.items)-1]
	q.items = q.items[:len(q.items)-1]
	return item, true
}

func (q *WorkQueue) Steal() (int, bool) {
	q.mu.Lock()
	defer q.mu.Unlock()
	if len(q.items) == 0 {
		return 0, false
	}
	item := q.items[0]
	q.items = q.items[1:]
	return item, true
}

func (q *WorkQueue) Len() int {
	q.mu.Lock()
	defer q.mu.Unlock()
	return len(q.items)
}

type WorkStealingPool struct {
	queues []*WorkQueue
}

func NewWorkStealingPool(workers int) *WorkStealingPool {
	queues := make([]*WorkQueue, workers)
	for i := range queues {
		queues[i] = &WorkQueue{}
	}
	return &WorkStealingPool{queues: queues}
}

func (p *WorkStealingPool) Submit(worker, item int) {
	p.queues[worker].Push(item)
}

func (p *WorkStealingPool) Process(worker int) (int, bool) {
	// Try own queue first
	if item, ok := p.queues[worker].Pop(); ok {
		return item, true
	}
	// Steal from others
	for i, q := range p.queues {
		if i != worker {
			if item, ok := q.Steal(); ok {
				return item, true
			}
		}
	}
	return 0, false
}

func TestWorkStealingOwnQueue(t *testing.T) {
	pool := NewWorkStealingPool(2)
	pool.Submit(0, 10)
	pool.Submit(0, 20)

	item, ok := pool.Process(0)
	if !ok {
		t.Fatal("should get item from own queue")
	}
	if item != 20 { // LIFO pop
		t.Errorf("expected 20 (LIFO), got %d", item)
	}
}

func TestWorkStealingSteals(t *testing.T) {
	pool := NewWorkStealingPool(2)
	pool.Submit(0, 10)
	pool.Submit(0, 20)

	// Worker 1 has no work, should steal from worker 0
	item, ok := pool.Process(1)
	if !ok {
		t.Fatal("should steal work from worker 0")
	}
	if item != 10 { // FIFO steal
		t.Errorf("expected 10 (FIFO steal), got %d", item)
	}
}

func TestWorkStealingEmpty(t *testing.T) {
	pool := NewWorkStealingPool(3)
	_, ok := pool.Process(0)
	if ok {
		t.Error("should return false when all queues empty")
	}
}

func TestWorkStealingFairness(t *testing.T) {
	pool := NewWorkStealingPool(2)
	for i := 1; i <= 10; i++ {
		pool.Submit(0, i)
	}

	// Worker 1 steals all work
	var stolen []int
	for {
		item, ok := pool.Process(1)
		if !ok {
			break
		}
		stolen = append(stolen, item)
	}
	if len(stolen) != 10 {
		t.Errorf("worker 1 should steal all 10 items, got %d", len(stolen))
	}
}
