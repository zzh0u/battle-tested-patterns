package exercises

import "testing"

type CoopTask struct {
	name  string
	steps []func() string
}

type Scheduler struct {
	tasks   []CoopTask
	results []string
}

func NewScheduler() *Scheduler { // TODO: implement
	return &Scheduler{}
}

func (s *Scheduler) AddTask(name string, steps []func() string) { // TODO: implement
	s.tasks = append(s.tasks, CoopTask{name: name, steps: steps})
}

func (s *Scheduler) Run() []string { // TODO: implement
	cursors := make([]int, len(s.tasks))
	s.results = nil

	for {
		progress := false
		for i := range s.tasks {
			if cursors[i] < len(s.tasks[i].steps) {
				result := s.tasks[i].steps[cursors[i]]()
				s.results = append(s.results, result)
				cursors[i]++
				progress = true
			}
		}
		if !progress {
			break
		}
	}
	return s.results
}

func TestCoopSchedulerInterleaving(t *testing.T) {
	s := NewScheduler()
	s.AddTask("A", []func() string{
		func() string { return "A1" },
		func() string { return "A2" },
	})
	s.AddTask("B", []func() string{
		func() string { return "B1" },
		func() string { return "B2" },
	})

	results := s.Run()
	want := []string{"A1", "B1", "A2", "B2"}
	if len(results) != len(want) {
		t.Fatalf("got %v, want %v", results, want)
	}
	for i, v := range results {
		if v != want[i] {
			t.Errorf("results[%d] = %s, want %s", i, v, want[i])
		}
	}
}

func TestCoopSchedulerUnequalSteps(t *testing.T) {
	s := NewScheduler()
	s.AddTask("A", []func() string{
		func() string { return "A1" },
		func() string { return "A2" },
		func() string { return "A3" },
	})
	s.AddTask("B", []func() string{
		func() string { return "B1" },
	})

	results := s.Run()
	// A1, B1, A2, A3
	if len(results) != 4 {
		t.Fatalf("expected 4 results, got %d: %v", len(results), results)
	}
	if results[0] != "A1" || results[1] != "B1" {
		t.Errorf("first round wrong: %v", results[:2])
	}
}

func TestCoopSchedulerEmpty(t *testing.T) {
	s := NewScheduler()
	results := s.Run()
	if len(results) != 0 {
		t.Error("empty scheduler should produce no results")
	}
}
