/** @type {import('stylelint').Config} */
export default {
  // recommended-vue must come last so its postcss-html syntax wins for .vue files.
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  rules: {
    // Vue/VitePress scoped selectors use these pseudo-classes.
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['deep', 'global', 'slotted'] },
    ],
    // VitePress ships PascalCase component classes (.VPNav, .VPNavBar, .Layout, …)
    // that we override; we cannot rename them, so don't enforce kebab-case.
    'selector-class-pattern': null,
    // -webkit-backdrop-filter / -webkit-user-select are still required for Safari.
    'property-no-vendor-prefix': null,
    // `word-break: break-word` is intentional; the "modern" replacement
    // (overflow-wrap) has different semantics, so keep it.
    'declaration-property-value-keyword-no-deprecated': null,
  },
  overrides: [
    {
      // Vue SFCs use scoped CSS ([data-v-*] isolation), so cross-rule
      // specificity ordering is a non-issue; base styles after state
      // variants (.x-on .y / :hover-then-:disabled) are intentional.
      files: ['**/*.vue'],
      rules: {
        'no-descending-specificity': null,
      },
    },
  ],
};
