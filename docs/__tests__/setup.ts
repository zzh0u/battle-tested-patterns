global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
  takeRecords() { return []; }
} as any;

// jsdom does not implement SVG layout, so SVGElement.getBBox() is missing.
// Any code path that touches SVG measurement (e.g. mermaid's renderer) throws
// "getBBox is not a function". Provide a zero-size stub so such libraries can
// run under tests without crashing. This is the standard jsdom + SVG polyfill.
if (typeof SVGElement !== 'undefined' && !(SVGElement.prototype as any).getBBox) {
  (SVGElement.prototype as any).getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 });
}
