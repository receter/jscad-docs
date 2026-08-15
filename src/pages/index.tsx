import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import JscadViewer from '@site/src/components/JscadViewer';

import styles from './index.module.css';

const EXAMPLE = `import { colorize, cuboid, cylinder, subtract, translate, union } from '@jscad/modeling'

export const getParameterDefinitions = () => [
  { name: 'holes', type: 'int', initial: 6, min: 3, max: 12, caption: 'Holes' }
]

export const main = (params) => {
  const holes = Array.from({ length: params.holes }, (_, i) => {
    const angle = (i / params.holes) * Math.PI * 2
    return translate(
      [Math.cos(angle) * 18, Math.sin(angle) * 18, 0],
      cylinder({ radius: 4, height: 12, segments: 32 })
    )
  })

  const wheel = subtract(
    cylinder({ radius: 30, height: 8, segments: 64 }),
    union(holes),
    cylinder({ radius: 6, height: 12, segments: 32 })
  )

  return colorize([0.2, 0.6, 0.9], wheel)
}`;

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Read the guide
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="JSCAD User Guide"
      description="Learn to build parametric 2D and 3D models with JSCAD v3 and JavaScript.">
      <HomepageHeader />
      <main className="container margin-vert--lg">
        <Heading as="h2">Designs are just JavaScript</Heading>
        <p>
          A JSCAD design is a module that exports a <code>main</code> function
          returning a shape. Every example in this guide runs in your browser — drag
          the model to look around.
        </p>
        <JscadViewer code={EXAMPLE} height={360} />
      </main>
    </Layout>
  );
}
