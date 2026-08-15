import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const sidebars: SidebarsConfig = {
  guideSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Design Guide',
      link: {type: 'doc', id: 'design-guide/index'},
      collapsed: false,
      items: [
        'design-guide/anatomy',
        'design-guide/parameters',
        'design-guide/projects',
        'design-guide/3d-primitives',
        'design-guide/2d-primitives',
        'design-guide/paths-and-text',
        'design-guide/transforms',
        'design-guide/operations',
        'design-guide/extrusions',
        'design-guide/curves-and-slices',
        'design-guide/offsets',
        'design-guide/colors',
        'design-guide/measurements',
      ],
    },
    'migrating-from-v2',
    'quick-reference',
    'math-guide',
    'file-formats',
    'more-designs',
    'contribute',
  ],
};

export default sidebars;
