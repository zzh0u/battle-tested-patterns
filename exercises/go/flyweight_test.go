package exercises

import "testing"

type Color struct {
	R, G, B byte
}

type ColorFactory struct {
	cache map[string]*Color
}

func NewColorFactory() *ColorFactory {
	return &ColorFactory{cache: make(map[string]*Color)}
}

func (f *ColorFactory) Get(name string) *Color {
	if c, ok := f.cache[name]; ok {
		return c
	}
	var c Color
	switch name {
	case "red":
		c = Color{255, 0, 0}
	case "green":
		c = Color{0, 255, 0}
	case "blue":
		c = Color{0, 0, 255}
	default:
		c = Color{0, 0, 0}
	}
	f.cache[name] = &c
	return &c
}

func TestFlyweightSharedInstance(t *testing.T) {
	f := NewColorFactory()
	r1 := f.Get("red")
	r2 := f.Get("red")

	if r1 != r2 {
		t.Error("same color name should return same pointer")
	}
}

func TestFlyweightDifferentInstances(t *testing.T) {
	f := NewColorFactory()
	r := f.Get("red")
	g := f.Get("green")

	if r == g {
		t.Error("different colors should be different pointers")
	}
}

func TestFlyweightCorrectValues(t *testing.T) {
	f := NewColorFactory()
	r := f.Get("red")
	if r.R != 255 || r.G != 0 || r.B != 0 {
		t.Errorf("red should be (255,0,0), got (%d,%d,%d)", r.R, r.G, r.B)
	}
}

func TestFlyweightMemorySaving(t *testing.T) {
	f := NewColorFactory()
	for i := 0; i < 1000; i++ {
		f.Get("blue")
	}
	if len(f.cache) != 1 {
		t.Errorf("cache should have 1 entry, got %d", len(f.cache))
	}
}
