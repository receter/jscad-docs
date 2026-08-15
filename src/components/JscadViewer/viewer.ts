/**
 * A small wrapper around @jscad/regl-renderer: turns a canvas plus a list of
 * geometries into an orbitable 3D view.
 *
 * Camera and control state live outside the WebGL lifecycle so the context can be
 * released when the viewer scrolls off screen and restored, framed as the reader left
 * it, when it scrolls back. Browsers only allow a handful of live WebGL contexts, and
 * a documentation page may hold many viewers.
 */

import {
  cameras,
  commands,
  controls,
  entitiesFromSolids,
  prepareRender,
} from '@jscad/regl-renderer';

const perspectiveCamera = cameras.perspective;
const orbitControls = controls.orbit;

/** How far one wheel notch moves the camera. */
const ZOOM_PER_STEP = 1.15;

const AXIS_COLORS = {
  xColor: [1, 0, 0, 1],
  yColor: [0, 0.6, 0, 1],
  zColor: [0, 0, 1, 1],
};

export type ViewerTheme = {
  background: [number, number, number, number];
  meshColor: [number, number, number, number];
  gridColor: [number, number, number, number];
  gridSubColor: [number, number, number, number];
};

/** Persists across WebGL teardown, so the reader keeps their viewpoint. */
export type ViewerState = {
  camera: Record<string, unknown>;
  controls: Record<string, unknown>;
  /** Cleared once the geometries have been framed, so framing happens only once. */
  needsZoomToFit: boolean;
};

const defaultControls = () => ({
  ...orbitControls.defaults,
  // Frame the model a little more tightly than the renderer's default, so examples
  // fill the modest space a documentation page can spare.
  zoomToFit: {...orbitControls.defaults.zoomToFit, tightness: 1.1},
});

export const createViewerState = (): ViewerState => ({
  camera: {...perspectiveCamera.defaults},
  controls: defaultControls(),
  needsZoomToFit: true,
});

/** Rounds up to the nearest 1, 2 or 5 times a power of ten — the steps a ruler uses. */
const niceStep = (raw: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const step = normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : normalized < 7.5 ? 5 : 10;
  return step * magnitude;
};

/**
 * A grid scaled to the model, so the reader gets a usable sense of size whether the
 * shape is 2 units across or 200. Aims for roughly four major cells across the model.
 */
const gridForDiameter = (diameter: number) => {
  const major = niceStep(Math.max(diameter, 1e-6) / 4);
  // Kept close to the model: a wide grid turns into a haze of converging lines under
  // perspective, which reads as noise rather than as scale.
  const extent = Math.max(major * 6, diameter * 1.8);
  return {size: [extent, extent], ticks: [major, major / 5]};
};

const diameterOf = (bounds: number[][]) =>
  Math.hypot(
    bounds[1][0] - bounds[0][0],
    bounds[1][1] - bounds[0][1],
    bounds[1][2] - bounds[0][2],
  );

export type Viewer = {
  setGeometries: (geometries: object[], bounds: number[][]) => void;
  resize: () => void;
  resetView: () => void;
  dispose: () => void;
};

export const createViewer = (
  canvas: HTMLCanvasElement,
  state: ViewerState,
  theme: ViewerTheme,
): Viewer => {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: false,
  });
  if (!gl) throw new Error('WebGL is not available in this browser.');

  let entities: unknown[] = [];
  /** Just the model, without the grid and axis helpers, which carry no geometry. */
  let solidEntities: unknown[] = [];
  let frame = 0;
  let disposed = false;

  const renderOptions = {
    glOptions: {gl},
    camera: state.camera,
    drawCommands: {
      drawAxis: commands.drawAxis,
      drawGrid: commands.drawGrid,
      drawLines: commands.drawLines,
      drawMesh: commands.drawMesh,
    },
    rendering: {
      background: theme.background,
      meshColor: theme.meshColor,
    },
    entities,
  };

  const render = prepareRender(renderOptions);

  const resize = () => {
    const ratio = Math.min(globalThis.devicePixelRatio ?? 1, 2);
    const width = Math.max(Math.round(canvas.clientWidth * ratio), 1);
    const height = Math.max(Math.round(canvas.clientHeight * ratio), 1);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    perspectiveCamera.setProjection(state.camera, state.camera, {width, height});
    requestFrame();
  };

  /**
   * Draws one frame, then keeps drawing while the camera is still settling —
   * the orbit controls decay rotation over several frames after a drag ends.
   */
  const drawFrame = () => {
    frame = 0;
    if (disposed) return;

    const updated = orbitControls.update({
      controls: state.controls,
      camera: state.camera,
    });
    Object.assign(state.controls, updated.controls);
    Object.assign(state.camera, updated.camera);
    perspectiveCamera.update(state.camera, state.camera);

    renderOptions.camera = state.camera;
    renderOptions.entities = entities;
    render(renderOptions);

    if (updated.controls.changed) requestFrame();
  };

  function requestFrame() {
    if (frame || disposed) return;
    frame = requestAnimationFrame(drawFrame);
  }

  const zoomToFit = () => {
    if (solidEntities.length === 0) return;

    // Only the model gets framed: zoomToFit reads `entity.geometry`, which the grid
    // and axis helpers do not have.
    const fitted = orbitControls.zoomToFit({
      controls: state.controls,
      camera: state.camera,
      entities: solidEntities,
    });
    Object.assign(state.controls, fitted.controls);
    Object.assign(state.camera, fitted.camera);
    requestFrame();
  };

  const setGeometries = (geometries: object[], bounds: number[][]) => {
    const diameter = diameterOf(bounds);
    const grid = gridForDiameter(diameter);
    const isFlat = bounds[1][2] - bounds[0][2] < diameter * 0.01;
    solidEntities = entitiesFromSolids({color: theme.meshColor}, geometries);
    entities = [
      {
        visuals: {drawCmd: 'drawGrid', show: true},
        size: grid.size,
        ticks: grid.ticks,
        color: theme.gridColor,
        subColor: theme.gridSubColor,
      },
      {
        visuals: {drawCmd: 'drawAxis', show: true},
        // A modest gizmo rather than three lines shooting past the model. Axes are
        // depth-tested so the model occludes them instead of being drawn over.
        size: Math.max(diameter * 0.6, 1e-6),
        alwaysVisible: false,
        ...AXIS_COLORS,
      },
      ...solidEntities,
    ];

    if (state.needsZoomToFit) {
      state.needsZoomToFit = false;
      // 2D examples read as a drawing, not as a solid, so look down at them rather
      // than from the default three-quarter angle. Not straight down: with a Z-up
      // camera that is degenerate for lookAt, and the view lands at an arbitrary
      // rotation. A shallow tilt keeps X horizontal and Y vertical on screen.
      if (isFlat) state.camera.position = [0, -300, 950];
      zoomToFit();
    }
    requestFrame();
  };

  const resetView = () => {
    Object.assign(state.camera, perspectiveCamera.defaults);
    // defaultControls(), not orbitControls.defaults, or resetting would silently
    // restore the renderer's looser framing.
    Object.assign(state.controls, defaultControls());
    resize();
    zoomToFit();
  };

  const dispose = () => {
    disposed = true;
    if (frame) cancelAnimationFrame(frame);
    // regl offers no teardown here, so drop the context explicitly to stay well
    // under the browser's limit on simultaneous WebGL contexts.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };

  const applyControlUpdate = (updated: {
    controls?: Record<string, unknown>;
    camera?: Record<string, unknown>;
  }) => {
    if (updated.controls) Object.assign(state.controls, updated.controls);
    if (updated.camera) Object.assign(state.camera, updated.camera);
    requestFrame();
  };

  return {
    setGeometries,
    resize,
    resetView,
    dispose,
    // Exposed for the pointer handlers in the React component.
    rotate: (dx: number, dy: number) =>
      applyControlUpdate(
        orbitControls.rotate(
          {controls: state.controls, camera: state.camera, speed: 1},
          [dx, dy],
        ),
      ),
    pan: (dx: number, dy: number) =>
      applyControlUpdate(
        orbitControls.pan(
          {controls: state.controls, camera: state.camera, speed: 1},
          [dx, dy],
        ),
      ),
    /**
     * Zoom by `steps` notches — positive away from the model, negative towards it.
     *
     * This sets the controls' scale directly rather than calling
     * `orbitControls.zoom()`, which is unusable: it normalises the delta with
     * `zoomDelta / zoomDelta`, so every notch is ±1. That doubles the distance when
     * zooming out, and when zooming in it computes a target distance of zero, fails
     * its own minimum-distance check, and does nothing at all.
     *
     * `update()` multiplies the camera distance by `scale` and then resets it to 1,
     * so accumulating multiplicatively keeps several notches within one frame smooth.
     */
    zoom: (steps: number) => {
      const scale = (state.controls.scale as number) ?? 1;
      state.controls.scale = scale * ZOOM_PER_STEP ** steps;
      requestFrame();
    },
  } as Viewer & {
    rotate: (dx: number, dy: number) => void;
    pan: (dx: number, dy: number) => void;
    zoom: (delta: number) => void;
  };
};
