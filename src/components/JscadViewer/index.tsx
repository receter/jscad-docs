import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';
import {useColorMode} from '@docusaurus/theme-common';
import clsx from 'clsx';

import {evaluateDesign, measureBounds} from './evaluate';
import {createViewer, createViewerState, type ViewerTheme} from './viewer';
import styles from './styles.module.css';

const THEMES: Record<'light' | 'dark', ViewerTheme> = {
  light: {
    background: [0.98, 0.98, 0.99, 1],
    meshColor: [0, 0.6, 1, 1],
    gridColor: [0.66, 0.69, 0.74, 1],
    gridSubColor: [0.88, 0.89, 0.91, 1],
  },
  dark: {
    background: [0.11, 0.12, 0.14, 1],
    meshColor: [0.16, 0.68, 1, 1],
    gridColor: [0.33, 0.36, 0.41, 1],
    gridSubColor: [0.18, 0.2, 0.23, 1],
  },
};

/** Radians of orbit per pixel dragged. */
const ROTATE_PER_PIXEL = 0.01;

/**
 * Wheel notches for one event. Browsers report deltas in pixels, lines or pages
 * depending on the device, so normalise to pixels first — otherwise a mouse wheel and
 * a trackpad zoom at wildly different rates. Clamped so one flick cannot fly the
 * camera off into the distance.
 */
const wheelSteps = (event: WheelEvent) => {
  const PIXELS_PER_LINE = 16;
  const PIXELS_PER_PAGE = 400;
  const pixels =
    event.deltaMode === 1
      ? event.deltaY * PIXELS_PER_LINE
      : event.deltaMode === 2
        ? event.deltaY * PIXELS_PER_PAGE
        : event.deltaY;

  return Math.max(-3, Math.min(3, pixels / 100));
};

type ViewerHandle = ReturnType<typeof createViewer> & {
  rotate: (dx: number, dy: number) => void;
  pan: (dx: number, dy: number) => void;
  zoom: (delta: number) => void;
};

type CanvasProps = {
  code: string;
  height: number;
};

function Canvas({code, height}: CanvasProps): ReactNode {
  const {colorMode} = useColorMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<ViewerHandle | null>(null);
  const stateRef = useRef(createViewerState());
  /** The most recent successful evaluation, replayed whenever the context is recreated. */
  const modelRef = useRef<{geometries: object[]; bounds: number[][]} | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [engaged, setEngaged] = useState(false);

  // Only hold a WebGL context while the viewer is near the viewport.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      {rootMargin: '300px'},
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Create and tear down the viewer as visibility and theme change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!visible || !canvas) return;

    let viewer: ViewerHandle;
    try {
      viewer = createViewer(
        canvas,
        stateRef.current,
        THEMES[colorMode],
      ) as ViewerHandle;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    viewerRef.current = viewer;
    viewer.resize();

    const model = modelRef.current;
    if (model) viewer.setGeometries(model.geometries, model.bounds);

    const resizeObserver = new ResizeObserver(() => viewer.resize());
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      viewer.dispose();
      viewerRef.current = null;
    };
  }, [visible, colorMode]);

  // Evaluate the design, and hand the result to the viewer whenever one exists.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const geometries = await evaluateDesign(code);
        const bounds = await measureBounds(geometries);
        if (cancelled) return;

        modelRef.current = {geometries, bounds};
        setError(null);
        viewerRef.current?.setGeometries(geometries, bounds);
      } catch (cause) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : String(cause));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, visible]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    setEngaged(true);
    event.currentTarget.setPointerCapture(event.pointerId);

    const panning = event.shiftKey || event.button === 1;
    let lastX = event.clientX;
    let lastY = event.clientY;

    const handleMove = (move: PointerEvent) => {
      const dx = move.clientX - lastX;
      const dy = move.clientY - lastY;
      lastX = move.clientX;
      lastY = move.clientY;

      // The Y drag is negated: the controls measure the camera's angle down from
      // +Z, so passing the raw delta sends the camera the opposite way from the
      // pointer. Dragging down should tip the model towards you, showing its top.
      if (panning) viewer.pan(dx, dy);
      else viewer.rotate(dx * ROTATE_PER_PIXEL, -dy * ROTATE_PER_PIXEL);
    };

    const handleUp = () => {
      globalThis.removeEventListener('pointermove', handleMove);
      globalThis.removeEventListener('pointerup', handleUp);
    };

    globalThis.addEventListener('pointermove', handleMove);
    globalThis.addEventListener('pointerup', handleUp);
  }, []);

  // Scrolling only zooms once the reader has grabbed the model, so that scrolling past
  // the viewer never hijacks the page. Registered natively because React attaches wheel
  // listeners passively, which forbids preventDefault.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engaged) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      viewerRef.current?.zoom(wheelSteps(event));
    };
    canvas.addEventListener('wheel', onWheel, {passive: false});
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [engaged]);

  return (
    <div className={styles.viewport} ref={containerRef} style={{height}}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={handlePointerDown}
        onPointerLeave={() => setEngaged(false)}
      />

      {error ? (
        <div className={styles.error} role="alert">
          <strong>This example could not be rendered</strong>
          <pre>{error}</pre>
        </div>
      ) : (
        <>
          <p className={styles.hint} aria-hidden>
            {engaged ? 'Scroll to zoom · Shift-drag to pan' : 'Drag to rotate'}
          </p>
          <button
            type="button"
            className={styles.reset}
            onClick={() => viewerRef.current?.resetView()}
          >
            Reset view
          </button>
        </>
      )}
    </div>
  );
}

export type JscadViewerProps = {
  /** JSCAD design source: imports from '@jscad/modeling' and exports `main`. */
  code: string;
  /** Height of the 3D view in pixels. */
  height?: number;
  /** Render the code and the model side by side rather than stacked. */
  side?: boolean;
};

/**
 * Shows a JSCAD design alongside the model it produces. The source is evaluated in the
 * reader's browser, so the code on the page is exactly the code being rendered.
 */
export default function JscadViewer({
  code,
  height = 320,
  side = true,
}: JscadViewerProps): ReactNode {
  const source = code.replace(/\n+$/, '');

  return (
    <div className={clsx(styles.example, side && styles.sideBySide)}>
      <div className={styles.code}>
        <CodeBlock language="js">{source}</CodeBlock>
      </div>
      <BrowserOnly
        fallback={<div className={styles.viewport} style={{height}} />}
      >
        {() => <Canvas code={source} height={height} />}
      </BrowserOnly>
    </div>
  );
}
