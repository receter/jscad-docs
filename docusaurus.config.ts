import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'JSCAD User Guide',
  tagline: 'Parametric 2D and 3D design with JavaScript',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Where the site is published today. If it ever moves to its own domain,
  // this is the pair to change - baseUrl must match the path it is served from.
  url: 'https://receter.github.io',
  baseUrl: '/jscad-docs/',

  organizationName: 'jscad',
  projectName: 'OpenJSCAD.org',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/jscad/OpenJSCAD.org/tree/V3/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'JSCAD',
      logo: {
        alt: 'JSCAD Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guideSidebar',
          position: 'left',
          label: 'User Guide',
        },
        {
          href: 'https://github.com/jscad/OpenJSCAD.org',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'Design Guide', to: '/docs/design-guide'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Forum', href: 'https://openjscad.xyz/forum.html'},
            {label: 'Discord', href: 'https://openjscad.xyz/discord.html'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub', href: 'https://github.com/jscad/OpenJSCAD.org'},
            {
              label: 'API Reference',
              href: 'https://openjscad.xyz/docs/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} JSCAD Organization. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
