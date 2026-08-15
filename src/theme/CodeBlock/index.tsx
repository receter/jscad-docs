import type {ReactNode} from 'react';
import CodeBlock from '@theme-original/CodeBlock';
import type CodeBlockType from '@theme/CodeBlock';
import type {WrapperProps} from '@docusaurus/types';

import JscadViewer from '@site/src/components/JscadViewer';

type Props = WrapperProps<typeof CodeBlockType>;

/**
 * Renders a fenced code block tagged `jscad` as a live example:
 *
 * ```js jscad
 * import { cuboid } from '@jscad/modeling'
 * export const main = () => cuboid({ size: [1, 2, 3] })
 * ```
 *
 * The block keeps its normal syntax highlighting and gains a 3D view of whatever
 * `main` returns. `height=NNN` sets the height of that view.
 */
export default function CodeBlockWrapper(props: Props): ReactNode {
  const meta = props.metastring?.split(/\s+/) ?? [];

  if (meta.includes('jscad')) {
    const height = meta
      .find((token) => token.startsWith('height='))
      ?.slice('height='.length);

    return (
      <JscadViewer
        code={String(props.children)}
        height={height ? Number(height) : undefined}
      />
    );
  }

  return <CodeBlock {...props} />;
}
