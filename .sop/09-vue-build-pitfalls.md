# SOP 09: Vue Component Build Pitfalls

## Trigger

- When writing or reviewing Vue SFC components (`.vue` files)
- When CI fails with `[vite:vue]` errors
- When adding i18n strings or dynamic attributes to Vue templates

## Rule 1: No Literal Double Quotes Inside Backtick Templates in `:attr="..."`

### The Problem

Vue template attributes use double quotes as delimiters:

```html
:title="expression"
```

If the expression is a backtick template literal containing literal double quotes, the HTML parser treats the inner `"` as the end of the attribute value, producing an "Unterminated template" build error.

### Bad (BREAKS BUILD)

```html
:title="t(`Click to free block ${id} ("${label}")`, `点击释放块 ${id}（"${label}"）`)"
```

The `("` after `${id}` terminates the `:title="..."` attribute prematurely.

### Good (string concatenation)

```html
:title="t('Click to free block ' + id + ' (' + label + ')', '点击释放块 ' + id + '（' + label + '）')"
```

### Good (single quotes only)

```html
:title="t(`Click to free block ${id} ('${label}')`, `点击释放块 ${id}（'${label}'）`)"
```

### Good (computed property)

```vue
<script setup>
const blockTitle = computed(() =>
  t(`Click to free block ${id} ("${label}")`, `...`)
);
</script>

<template>
  <div :title="blockTitle">...</div>
</template>
```

### CI Error Signature

```
[vite:vue] ComponentName.vue (LINE:COL): Error parsing JavaScript expression: Unterminated template.
```

### How to Scan

```bash
# Find backtick templates with literal double quotes inside :attr bindings
grep -rn ':[a-z-]*=".*`.*".*`' docs/.vitepress/theme/components/
```

## Rule 2: Unused Variables in `v-for` Destructuring

### The Problem

TypeScript / vue-tsc reports unused variables in `v-for` destructuring:

```html
v-for="[char, fw] in flyweightPool"  <!-- "fw" is declared but never read -->
```

### Fix

Drop the unused binding:

```html
v-for="[char] in flyweightPool"
```

## Rule 3: Mermaid Diagrams — No CJK in Subgraph IDs

### The Problem

Mermaid's parser breaks on CJK characters in subgraph identifiers. This causes rendering failures across the entire page, not just the broken diagram.

### Bad

```mermaid
subgraph 数据层
```

### Good

```mermaid
subgraph DataLayer["数据层"]
```

Use ASCII identifiers with quoted CJK labels.

## Rule 4: Mermaid `timeline` Chart Type is Unsupported

### The Problem

The `timeline` chart type in Mermaid causes global rendering errors in VitePress. It is not reliably supported.

### Fix

Use a text-based alternative (table, list, or custom Vue component) instead of `mermaid timeline`.

## Checklist Before Pushing Vue Changes

- [ ] No literal `"` inside backtick templates within `:attr="..."` bindings
- [ ] No unused variables in `v-for` destructuring
- [ ] No Mermaid diagrams with CJK subgraph IDs
- [ ] No Mermaid `timeline` chart types
- [ ] `pnpm typecheck` passes (or verify via CI if local Node version differs)
