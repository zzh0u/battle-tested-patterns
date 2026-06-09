package diff_patch

import "testing"

type EditOp struct {
	Kind string // "keep", "add", "remove"
	Text string
}

func DiffLines(old, new []string) []EditOp { // TODO: implement
	m, n := len(old), len(new)
	// LCS DP
	dp := make([][]int, m+1)
	for i := range dp {
		dp[i] = make([]int, n+1)
	}
	for i := 1; i <= m; i++ {
		for j := 1; j <= n; j++ {
			if old[i-1] == new[j-1] {
				dp[i][j] = dp[i-1][j-1] + 1
			} else if dp[i-1][j] > dp[i][j-1] {
				dp[i][j] = dp[i-1][j]
			} else {
				dp[i][j] = dp[i][j-1]
			}
		}
	}

	// Backtrack
	var ops []EditOp
	i, j := m, n
	for i > 0 || j > 0 {
		if i > 0 && j > 0 && old[i-1] == new[j-1] {
			ops = append(ops, EditOp{"keep", old[i-1]})
			i--
			j--
		} else if j > 0 && (i == 0 || dp[i][j-1] >= dp[i-1][j]) {
			ops = append(ops, EditOp{"add", new[j-1]})
			j--
		} else {
			ops = append(ops, EditOp{"remove", old[i-1]})
			i--
		}
	}

	// Reverse
	for l, r := 0, len(ops)-1; l < r; l, r = l+1, r-1 {
		ops[l], ops[r] = ops[r], ops[l]
	}
	return ops
}

func Patch(old []string, ops []EditOp) []string { // TODO: implement
	var result []string
	for _, op := range ops {
		switch op.Kind {
		case "keep":
			result = append(result, op.Text)
		case "add":
			result = append(result, op.Text)
		case "remove":
			// skip
		}
	}
	return result
}

func TestDiffNoChange(t *testing.T) {
	lines := []string{"a", "b", "c"}
	ops := DiffLines(lines, lines)
	for _, op := range ops {
		if op.Kind != "keep" {
			t.Errorf("no change should only produce keep ops, got %s", op.Kind)
		}
	}
}

func TestDiffAddRemove(t *testing.T) {
	old := []string{"a", "b", "c"}
	new := []string{"a", "x", "c"}
	ops := DiffLines(old, new)

	hasRemove, hasAdd := false, false
	for _, op := range ops {
		if op.Kind == "remove" && op.Text == "b" {
			hasRemove = true
		}
		if op.Kind == "add" && op.Text == "x" {
			hasAdd = true
		}
	}
	if !hasRemove || !hasAdd {
		t.Errorf("should detect remove b and add x: %v", ops)
	}
}

func TestPatchApply(t *testing.T) {
	old := []string{"a", "b", "c"}
	new := []string{"a", "x", "c", "d"}
	ops := DiffLines(old, new)
	result := Patch(old, ops)

	if len(result) != len(new) {
		t.Fatalf("expected %v, got %v", new, result)
	}
	for i, v := range result {
		if v != new[i] {
			t.Errorf("result[%d] = %s, want %s", i, v, new[i])
		}
	}
}

func TestDiffEmpty(t *testing.T) {
	ops := DiffLines(nil, []string{"a", "b"})
	addCount := 0
	for _, op := range ops {
		if op.Kind == "add" {
			addCount++
		}
	}
	if addCount != 2 {
		t.Errorf("expected 2 adds, got %d", addCount)
	}
}
