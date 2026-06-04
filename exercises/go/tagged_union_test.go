package exercises

import (
	"fmt"
	"testing"
)

type ValueTag int

const (
	TagInt ValueTag = iota
	TagFloat
	TagString
)

type TaggedValue struct {
	tag    ValueTag
	intVal int
	fltVal float64
	strVal string
}

func IntValue(v int) TaggedValue      { return TaggedValue{tag: TagInt, intVal: v} }
func FloatValue(v float64) TaggedValue { return TaggedValue{tag: TagFloat, fltVal: v} }
func StringValue(v string) TaggedValue { return TaggedValue{tag: TagString, strVal: v} }

func (tv TaggedValue) Tag() ValueTag { return tv.tag }

func (tv TaggedValue) Display() string {
	switch tv.tag {
	case TagInt:
		return fmt.Sprintf("Int(%d)", tv.intVal)
	case TagFloat:
		return fmt.Sprintf("Float(%.2f)", tv.fltVal)
	case TagString:
		return fmt.Sprintf("String(%q)", tv.strVal)
	default:
		return "Unknown"
	}
}

func (tv TaggedValue) IsNumeric() bool {
	return tv.tag == TagInt || tv.tag == TagFloat
}

func TestTaggedUnionInt(t *testing.T) {
	v := IntValue(42)
	if v.Tag() != TagInt {
		t.Error("expected TagInt")
	}
	if v.Display() != "Int(42)" {
		t.Errorf("unexpected display: %s", v.Display())
	}
	if !v.IsNumeric() {
		t.Error("int should be numeric")
	}
}

func TestTaggedUnionFloat(t *testing.T) {
	v := FloatValue(3.14)
	if v.Tag() != TagFloat {
		t.Error("expected TagFloat")
	}
	if v.Display() != "Float(3.14)" {
		t.Errorf("unexpected display: %s", v.Display())
	}
	if !v.IsNumeric() {
		t.Error("float should be numeric")
	}
}

func TestTaggedUnionString(t *testing.T) {
	v := StringValue("hello")
	if v.Tag() != TagString {
		t.Error("expected TagString")
	}
	if v.Display() != `String("hello")` {
		t.Errorf("unexpected display: %s", v.Display())
	}
	if v.IsNumeric() {
		t.Error("string should not be numeric")
	}
}

func TestTaggedUnionCollection(t *testing.T) {
	values := []TaggedValue{
		IntValue(1),
		FloatValue(2.5),
		StringValue("three"),
	}
	numCount := 0
	for _, v := range values {
		if v.IsNumeric() {
			numCount++
		}
	}
	if numCount != 2 {
		t.Errorf("expected 2 numeric values, got %d", numCount)
	}
}
