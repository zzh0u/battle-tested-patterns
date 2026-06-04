package exercises

import (
	"crypto/sha256"
	"encoding/hex"
	"testing"
)

func hashLeaf(data string) string { // TODO: implement
	h := sha256.Sum256([]byte(data))
	return hex.EncodeToString(h[:])
}

func hashPair(a, b string) string { // TODO: implement
	h := sha256.Sum256([]byte(a + b))
	return hex.EncodeToString(h[:])
}

type MerkleTree struct {
	root   string
	leaves []string
	layers [][]string
}

func BuildMerkle(data []string) *MerkleTree { // TODO: implement
	if len(data) == 0 {
		return &MerkleTree{}
	}

	leaves := make([]string, len(data))
	for i, d := range data {
		leaves[i] = hashLeaf(d)
	}

	layers := [][]string{leaves}
	current := leaves

	for len(current) > 1 {
		var next []string
		for i := 0; i < len(current); i += 2 {
			if i+1 < len(current) {
				next = append(next, hashPair(current[i], current[i+1]))
			} else {
				next = append(next, current[i]) // odd node promoted
			}
		}
		layers = append(layers, next)
		current = next
	}

	return &MerkleTree{
		root:   current[0],
		leaves: leaves,
		layers: layers,
	}
}

func (m *MerkleTree) Root() string     { return m.root }
func (m *MerkleTree) LeafCount() int   { return len(m.leaves) }
func (m *MerkleTree) Depth() int       { return len(m.layers) }

func TestMerkleRoot(t *testing.T) {
	tree := BuildMerkle([]string{"a", "b", "c", "d"})
	if tree.Root() == "" {
		t.Error("root should not be empty")
	}
	if tree.LeafCount() != 4 {
		t.Errorf("expected 4 leaves, got %d", tree.LeafCount())
	}
}

func TestMerkleDeterministic(t *testing.T) {
	t1 := BuildMerkle([]string{"x", "y", "z"})
	t2 := BuildMerkle([]string{"x", "y", "z"})
	if t1.Root() != t2.Root() {
		t.Error("same data should produce same root")
	}
}

func TestMerkleChangeSensitivity(t *testing.T) {
	t1 := BuildMerkle([]string{"a", "b", "c"})
	t2 := BuildMerkle([]string{"a", "b", "d"})
	if t1.Root() == t2.Root() {
		t.Error("different data should produce different root")
	}
}

func TestMerkleSingleElement(t *testing.T) {
	tree := BuildMerkle([]string{"only"})
	expected := hashLeaf("only")
	if tree.Root() != expected {
		t.Errorf("single element root should be its hash")
	}
}
