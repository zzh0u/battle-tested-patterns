import { describe, it, expect } from 'vitest';

/**
 * Vtable - Basic: Implement vtable dispatch for shapes.
 *
 * TODO: Implement a vtable-based polymorphism system where shapes
 * (circle, rectangle) have their own function tables for area()
 * and perimeter(). Dispatch operations through the vtable, not
 * through class inheritance.
 */

/** A vtable is a record of function pointers for shape operations */
interface ShapeVtable {
  area: (data: number[]) => number;
  perimeter: (data: number[]) => number;
  name: () => string;
}

/** A shape is just data + a pointer to its vtable */
interface Shape {
  vtable: ShapeVtable;
  data: number[];
}

/** Vtable for circles — data[0] = radius */
const circleVtable: ShapeVtable = {
  // TODO: implement
  area: (data) => Math.PI * data[0]! * data[0]!,
  perimeter: (data) => 2 * Math.PI * data[0]!,
  name: () => 'Circle',
};

/** Vtable for rectangles — data[0] = width, data[1] = height */
const rectVtable: ShapeVtable = {
  // TODO: implement
  area: (data) => data[0]! * data[1]!,
  perimeter: (data) => 2 * (data[0]! + data[1]!),
  name: () => 'Rectangle',
};

/** Create a circle with given radius */
function createCircle(radius: number): Shape {
  // TODO: implement
  return { vtable: circleVtable, data: [radius] };
}

/** Create a rectangle with given width and height */
function createRect(width: number, height: number): Shape {
  // TODO: implement
  return { vtable: rectVtable, data: [width, height] };
}

/** Dispatch area() through the vtable */
function area(shape: Shape): number {
  // TODO: implement
  return shape.vtable.area(shape.data);
}

/** Dispatch perimeter() through the vtable */
function perimeter(shape: Shape): number {
  // TODO: implement
  return shape.vtable.perimeter(shape.data);
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Vtable - Basic', () => {
  it('should compute circle area via vtable dispatch', () => {
    const c = createCircle(5);
    expect(area(c)).toBeCloseTo(Math.PI * 25);
  });

  it('should compute rectangle area via vtable dispatch', () => {
    const r = createRect(4, 6);
    expect(area(r)).toBeCloseTo(24);
  });

  it('should compute perimeters via vtable dispatch', () => {
    const c = createCircle(3);
    const r = createRect(5, 10);
    expect(perimeter(c)).toBeCloseTo(2 * Math.PI * 3);
    expect(perimeter(r)).toBeCloseTo(30);
  });

  it('should dispatch polymorphically on mixed shape arrays', () => {
    const shapes: Shape[] = [createCircle(1), createRect(2, 3), createCircle(4)];
    const areas = shapes.map(area);
    expect(areas[0]).toBeCloseTo(Math.PI);
    expect(areas[1]).toBeCloseTo(6);
    expect(areas[2]).toBeCloseTo(Math.PI * 16);
  });

  it('should report shape name through vtable', () => {
    expect(createCircle(1).vtable.name()).toBe('Circle');
    expect(createRect(1, 1).vtable.name()).toBe('Rectangle');
  });
});
