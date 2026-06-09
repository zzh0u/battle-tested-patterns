package write_ahead_log

import (
	"fmt"
	"testing"
)

type WALEntry struct {
	LSN  int
	Op   string
	Data string
}

type WAL struct {
	log       []WALEntry
	nextLSN   int
	committed int
}

func NewWAL() *WAL { // TODO: implement
	return &WAL{committed: -1}
}

func (w *WAL) Append(op, data string) int { // TODO: implement
	lsn := w.nextLSN
	w.log = append(w.log, WALEntry{LSN: lsn, Op: op, Data: data})
	w.nextLSN++
	return lsn
}

func (w *WAL) Commit(lsn int) error { // TODO: implement
	if lsn < 0 || lsn >= w.nextLSN {
		return fmt.Errorf("invalid LSN: %d", lsn)
	}
	if lsn > w.committed {
		w.committed = lsn
	}
	return nil
}

func (w *WAL) Replay() []WALEntry { // TODO: implement
	var result []WALEntry
	for _, e := range w.log {
		if e.LSN <= w.committed {
			result = append(result, e)
		}
	}
	return result
}

func (w *WAL) Len() int { return len(w.log) }

func TestWALAppendAndReplay(t *testing.T) {
	wal := NewWAL()
	lsn1 := wal.Append("SET", "x=1")
	lsn2 := wal.Append("SET", "y=2")
	wal.Commit(lsn2)

	entries := wal.Replay()
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	if entries[0].LSN != lsn1 || entries[1].LSN != lsn2 {
		t.Error("replay should return committed entries in order")
	}
}

func TestWALUncommittedNotReplayed(t *testing.T) {
	wal := NewWAL()
	wal.Append("SET", "x=1")
	wal.Append("SET", "y=2")
	// no commit

	entries := wal.Replay()
	if len(entries) != 0 {
		t.Error("uncommitted entries should not be replayed")
	}
}

func TestWALPartialCommit(t *testing.T) {
	wal := NewWAL()
	lsn1 := wal.Append("SET", "x=1")
	wal.Append("SET", "y=2")
	wal.Commit(lsn1)

	entries := wal.Replay()
	if len(entries) != 1 {
		t.Fatalf("expected 1 entry, got %d", len(entries))
	}
}

func TestWALInvalidCommit(t *testing.T) {
	wal := NewWAL()
	if err := wal.Commit(999); err == nil {
		t.Error("committing invalid LSN should error")
	}
}
