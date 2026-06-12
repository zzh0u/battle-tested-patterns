import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initMermaidLoader } from '../.vitepress/theme/mermaid-loader';

// Mock the mermaid library so we control initialize()/run() behavior.
// Notes on the mock setup (both matter — verified by trial):
//   1. vi.hoisted() makes the mock fns exist before vi.mock's factory runs.
//      Without it the factory closes over still-undefined module-scope vars.
//   2. The mocks carry a default implementation (run resolves, initialize is a
//      no-op) AND beforeEach uses mockClear() — NOT mockReset(). mockReset()
//      strips the implementation, leaving run() returning undefined; under the
//      dynamic-import mock resolution that lets a call slip through to the real
//      mermaid library, which crashes in jsdom (SVG getBBox() is unimplemented)
//      and emits a stray "[mermaid-loader] ... getBBox is not a function" log.
//      mockClear() keeps the implementation while resetting call history.
const { runMock, initializeMock } = vi.hoisted(() => ({
  runMock: vi.fn(async () => {}),
  initializeMock: vi.fn(() => {}),
}));
vi.mock('mermaid', () => ({
  default: {
    initialize: initializeMock,
    run: runMock,
  },
}));

describe('mermaid-loader', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    runMock.mockClear();
    initializeMock.mockClear();
    document.body.innerHTML = '';
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function addDiagram(source = 'graph TD; A-->B') {
    const pre = document.createElement('pre');
    pre.className = 'mermaid';
    pre.textContent = source;
    document.body.appendChild(pre);
    return pre;
  }

  it('returns a no-op resolved promise when there are no .mermaid elements', async () => {
    const render = initMermaidLoader();
    await expect(render()).resolves.toBeUndefined();
    expect(runMock).not.toHaveBeenCalled();
  });

  it('renders diagrams via mermaid.run when .mermaid elements exist', async () => {
    addDiagram();

    const render = initMermaidLoader();
    await render();

    expect(initializeMock).toHaveBeenCalledTimes(1);
    expect(runMock).toHaveBeenCalledTimes(1);
  });

  it('does not reject when mermaid.run throws — error is isolated', async () => {
    addDiagram('this is not a valid diagram {{{');
    runMock.mockRejectedValueOnce(new Error('Parse error on malformed diagram'));

    const render = initMermaidLoader();

    // The crash must be swallowed: renderMermaid resolves, never rejects.
    await expect(render()).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      '[mermaid-loader] Failed to render diagram(s):',
      expect.any(Error),
    );
  });

  it('preserves the raw diagram source in dataset for re-rendering', async () => {
    const pre = addDiagram('graph LR; X-->Y');

    const render = initMermaidLoader();
    await render();

    expect(pre.dataset.mermaidSource).toBe('graph LR; X-->Y');
  });

  it('uses dark theme when the html element has the dark class', async () => {
    document.documentElement.classList.add('dark');
    addDiagram();

    const render = initMermaidLoader();
    await render();

    expect(initializeMock).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' }),
    );
  });

  // --- FOUC prevention: data-mermaid-status lifecycle ---

  it('marks elements with data-mermaid-status="rendered" after successful render', async () => {
    const pre = addDiagram();

    const render = initMermaidLoader();
    await render();

    expect(pre.dataset.mermaidStatus).toBe('rendered');
  });

  it('marks elements with data-mermaid-status="error" when render fails (FOUC fallback)', async () => {
    const pre = addDiagram('bad diagram');
    runMock.mockRejectedValueOnce(new Error('Parse error'));

    const render = initMermaidLoader();
    await render();

    expect(pre.dataset.mermaidStatus).toBe('error');
  });
});
