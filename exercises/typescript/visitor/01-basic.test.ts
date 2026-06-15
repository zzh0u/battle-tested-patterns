import { describe, it, expect } from 'vitest';

/**
 * Visitor - Basic: AST visitor for math expressions.
 *
 * TODO: Implement a simple AST for math expressions (numbers, add, multiply)
 * and a visitor that evaluates and pretty-prints expressions without
 * modifying the AST node classes.
 */

type Expr =
  | { type: 'number'; value: number }
  | { type: 'add'; left: Expr; right: Expr }
  | { type: 'multiply'; left: Expr; right: Expr };

interface ExprVisitor<T> {
  visitNumber: (value: number) => T;
  visitAdd: (left: Expr, right: Expr) => T;
  visitMultiply: (left: Expr, right: Expr) => T;
}

/** Walk an expression tree, dispatching to the visitor */
function visit<T>(expr: Expr, visitor: ExprVisitor<T>): T {
  // TODO: implement — dispatch based on expr.type
  switch (expr.type) {
    case 'number':
      return visitor.visitNumber(expr.value);
    case 'add':
      return visitor.visitAdd(expr.left, expr.right);
    case 'multiply':
      return visitor.visitMultiply(expr.left, expr.right);
  }
}

/** Evaluate visitor — computes the numeric result */
function makeEvalVisitor(): ExprVisitor<number> {
  // TODO: implement
  return {
    visitNumber: (value) => value,
    visitAdd: (left, right) => visit(left, makeEvalVisitor()) + visit(right, makeEvalVisitor()),
    visitMultiply: (left, right) =>
      visit(left, makeEvalVisitor()) * visit(right, makeEvalVisitor()),
  };
}

/** Pretty-print visitor — returns a string representation */
function makePrintVisitor(): ExprVisitor<string> {
  // TODO: implement
  return {
    visitNumber: (value) => String(value),
    visitAdd: (left, right) =>
      `(${visit(left, makePrintVisitor())} + ${visit(right, makePrintVisitor())})`,
    visitMultiply: (left, right) =>
      `(${visit(left, makePrintVisitor())} * ${visit(right, makePrintVisitor())})`,
  };
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Visitor - Basic', () => {
  const num = (n: number): Expr => ({ type: 'number', value: n });
  const add = (l: Expr, r: Expr): Expr => ({ type: 'add', left: l, right: r });
  const mul = (l: Expr, r: Expr): Expr => ({ type: 'multiply', left: l, right: r });

  it('should evaluate a single number', () => {
    expect(visit(num(42), makeEvalVisitor())).toBe(42);
  });

  it('should evaluate addition', () => {
    const expr = add(num(3), num(7));
    expect(visit(expr, makeEvalVisitor())).toBe(10);
  });

  it('should evaluate nested expressions', () => {
    // (2 + 3) * 4 = 20
    const expr = mul(add(num(2), num(3)), num(4));
    expect(visit(expr, makeEvalVisitor())).toBe(20);
  });

  it('should pretty-print expressions', () => {
    const expr = mul(add(num(2), num(3)), num(4));
    expect(visit(expr, makePrintVisitor())).toBe('((2 + 3) * 4)');
  });

  it('should pretty-print nested expressions', () => {
    const expr = add(mul(num(1), num(2)), mul(num(3), num(4)));
    expect(visit(expr, makePrintVisitor())).toBe('((1 * 2) + (3 * 4))');
  });
});
