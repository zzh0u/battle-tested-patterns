package exercises

import (
	"fmt"
	"testing"
)

type ASTNode interface {
	Accept(v ASTVisitor) string
}

type ASTVisitor interface {
	VisitNumber(n *NumberNode) string
	VisitBinOp(b *BinOpNode) string
}

type NumberNode struct {
	Value int
}

func (n *NumberNode) Accept(v ASTVisitor) string { return v.VisitNumber(n) }

type BinOpNode struct {
	Op    string
	Left  ASTNode
	Right ASTNode
}

func (b *BinOpNode) Accept(v ASTVisitor) string { return v.VisitBinOp(b) }

// Printer visitor
type Printer struct{}

func (p Printer) VisitNumber(n *NumberNode) string { // TODO: implement
	return fmt.Sprintf("%d", n.Value)
}

func (p Printer) VisitBinOp(b *BinOpNode) string { // TODO: implement
	return fmt.Sprintf("(%s %s %s)", b.Left.Accept(p), b.Op, b.Right.Accept(p))
}

// Evaluator visitor
type Evaluator struct{}

func (e Evaluator) VisitNumber(n *NumberNode) string { // TODO: implement
	return fmt.Sprintf("%d", n.Value)
}

func (e Evaluator) VisitBinOp(b *BinOpNode) string { // TODO: implement
	left := evalInt(b.Left.Accept(e))
	right := evalInt(b.Right.Accept(e))
	switch b.Op {
	case "+":
		return fmt.Sprintf("%d", left+right)
	case "*":
		return fmt.Sprintf("%d", left*right)
	default:
		return "0"
	}
}

func evalInt(s string) int { // TODO: implement
	var n int
	fmt.Sscanf(s, "%d", &n)
	return n
}

func TestVisitorPrinter(t *testing.T) {
	// (1 + 2)
	tree := &BinOpNode{
		Op:    "+",
		Left:  &NumberNode{1},
		Right: &NumberNode{2},
	}
	result := tree.Accept(Printer{})
	if result != "(1 + 2)" {
		t.Errorf("expected (1 + 2), got %s", result)
	}
}

func TestVisitorEvaluator(t *testing.T) {
	// (3 + (2 * 4))
	tree := &BinOpNode{
		Op:   "+",
		Left: &NumberNode{3},
		Right: &BinOpNode{
			Op:    "*",
			Left:  &NumberNode{2},
			Right: &NumberNode{4},
		},
	}
	result := tree.Accept(Evaluator{})
	if result != "11" {
		t.Errorf("expected 11, got %s", result)
	}
}

func TestVisitorNested(t *testing.T) {
	// ((1 + 2) * (3 + 4))
	tree := &BinOpNode{
		Op: "*",
		Left: &BinOpNode{
			Op:    "+",
			Left:  &NumberNode{1},
			Right: &NumberNode{2},
		},
		Right: &BinOpNode{
			Op:    "+",
			Left:  &NumberNode{3},
			Right: &NumberNode{4},
		},
	}
	result := tree.Accept(Printer{})
	if result != "((1 + 2) * (3 + 4))" {
		t.Errorf("expected ((1 + 2) * (3 + 4)), got %s", result)
	}
	eval := tree.Accept(Evaluator{})
	if eval != "21" {
		t.Errorf("expected 21, got %s", eval)
	}
}
