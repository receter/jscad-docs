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
        'design-guide/transforms',
        'design-guide/operations',
        'design-guide/extrusions',
      ],
    },
  ],
};

export default sidebars;
