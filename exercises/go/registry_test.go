package exercises

import (
	"fmt"
	"testing"
)

type Handler func(data string) string

type Registry struct {
	handlers map[string]Handler
}

func NewRegistry() *Registry {
	return &Registry{handlers: make(map[string]Handler)}
}

func (r *Registry) Register(name string, h Handler) error {
	if _, exists := r.handlers[name]; exists {
		return fmt.Errorf("handler %q already registered", name)
	}
	r.handlers[name] = h
	return nil
}

func (r *Registry) Get(name string) (Handler, bool) {
	h, ok := r.handlers[name]
	return h, ok
}

func (r *Registry) Names() []string {
	names := make([]string, 0, len(r.handlers))
	for k := range r.handlers {
		names = append(names, k)
	}
	return names
}

func (r *Registry) Len() int { return len(r.handlers) }

func TestRegistryRegisterAndGet(t *testing.T) {
	r := NewRegistry()
	err := r.Register("json", func(data string) string {
		return fmt.Sprintf("{%q}", data)
	})
	if err != nil {
		t.Fatal(err)
	}

	h, ok := r.Get("json")
	if !ok {
		t.Fatal("should find registered handler")
	}
	result := h("test")
	if result != `{"test"}` {
		t.Errorf("unexpected result: %s", result)
	}
}

func TestRegistryDuplicate(t *testing.T) {
	r := NewRegistry()
	r.Register("xml", func(data string) string { return data })
	err := r.Register("xml", func(data string) string { return data })
	if err == nil {
		t.Error("duplicate registration should return error")
	}
}

func TestRegistryMissing(t *testing.T) {
	r := NewRegistry()
	_, ok := r.Get("nonexistent")
	if ok {
		t.Error("should not find unregistered handler")
	}
}

func TestRegistryMultiple(t *testing.T) {
	r := NewRegistry()
	r.Register("a", func(d string) string { return "a:" + d })
	r.Register("b", func(d string) string { return "b:" + d })
	r.Register("c", func(d string) string { return "c:" + d })

	if r.Len() != 3 {
		t.Errorf("expected 3 handlers, got %d", r.Len())
	}

	h, _ := r.Get("b")
	if h("x") != "b:x" {
		t.Error("handler b should work correctly")
	}
}
