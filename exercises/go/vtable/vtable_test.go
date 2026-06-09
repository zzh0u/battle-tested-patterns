package vtable

import (
	"fmt"
	"testing"
)

type VTable struct {
	typeName string
	methods  map[string]func(data any) string
}

func NewVTable(typeName string) *VTable { // TODO: implement
	return &VTable{typeName: typeName, methods: make(map[string]func(data any) string)}
}

func (vt *VTable) AddMethod(name string, fn func(data any) string) { // TODO: implement
	vt.methods[name] = fn
}

type DynObject struct {
	vtable *VTable
	data   any
}

func NewDynObject(vtable *VTable, data any) *DynObject { // TODO: implement
	return &DynObject{vtable: vtable, data: data}
}

func (o *DynObject) Call(method string) (string, bool) { // TODO: implement
	fn, ok := o.vtable.methods[method]
	if !ok {
		return "", false
	}
	return fn(o.data), true
}

func (o *DynObject) TypeName() string { return o.vtable.typeName }

func TestVTableDispatch(t *testing.T) {
	vt := NewVTable("Dog")
	vt.AddMethod("speak", func(data any) string {
		return fmt.Sprintf("%s says Woof!", data.(string))
	})

	dog := NewDynObject(vt, "Rex")
	result, ok := dog.Call("speak")
	if !ok || result != "Rex says Woof!" {
		t.Errorf("expected 'Rex says Woof!', got %q", result)
	}
}

func TestVTableShared(t *testing.T) {
	vt := NewVTable("Cat")
	vt.AddMethod("speak", func(data any) string {
		return data.(string) + " says Meow!"
	})

	cat1 := NewDynObject(vt, "Whiskers")
	cat2 := NewDynObject(vt, "Mittens")

	r1, _ := cat1.Call("speak")
	r2, _ := cat2.Call("speak")
	if r1 == r2 {
		t.Error("different data should produce different results")
	}
	if cat1.TypeName() != cat2.TypeName() {
		t.Error("shared vtable should give same type name")
	}
}

func TestVTableMissingMethod(t *testing.T) {
	vt := NewVTable("Fish")
	fish := NewDynObject(vt, nil)
	_, ok := fish.Call("fly")
	if ok {
		t.Error("should fail on missing method")
	}
}

func TestVTableMultipleMethods(t *testing.T) {
	vt := NewVTable("Calculator")
	vt.AddMethod("add", func(data any) string {
		nums := data.([2]int)
		return fmt.Sprintf("%d", nums[0]+nums[1])
	})
	vt.AddMethod("mul", func(data any) string {
		nums := data.([2]int)
		return fmt.Sprintf("%d", nums[0]*nums[1])
	})

	calc := NewDynObject(vt, [2]int{3, 4})
	add, _ := calc.Call("add")
	mul, _ := calc.Call("mul")
	if add != "7" || mul != "12" {
		t.Errorf("expected add=7 mul=12, got add=%s mul=%s", add, mul)
	}
}
