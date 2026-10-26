export type ColorInput = number | string;

export type ToothType = "child" | "adult";

export interface OdontogramTheme {
  /** Default tooth color before any diagnostic marker is placed. */
  toothColor?: ColorInput;
  /** Color applied to a tooth once it has a diagnostic marker. */
  highlightColor?: ColorInput;
  /** Color of the small sphere marker placed at the click point. */
  markerColor?: ColorInput;
  /** Canvas/renderer clear color (the "background" behind the 3D model). */
  canvasBackground?: ColorInput;
  /** Opacity of the canvas clear color, 0 = fully transparent. */
  canvasBackgroundOpacity?: number;
  ambientLightColor?: ColorInput;
  ambientLightIntensity?: number;
  keyLightColor?: ColorInput;
  keyLightIntensity?: number;
  fillLightColor?: ColorInput;
  fillLightIntensity?: number;
}

export interface MappedPoint {
  id: number;
  toothId: string;
  x: string;
  y: string;
  z: string;
  type: string;
  description?: string;
}

export interface Odontogram3DHandle {
  /** Remove all markers and reset every tooth back to its default color. */
  resetMapping: () => void;
  /** Current diagnostic points mapped on the model. */
  getMappedPoints: () => MappedPoint[];
  /** Replace all diagnostic points and redraw markers/highlights to match. */
  setMappedPoints: (points: MappedPoint[]) => void;
  /** Patch metadata (e.g. description) on an existing point without touching the 3D scene. */
  updatePoint: (id: number, patch: Partial<MappedPoint>) => void;
  /** Re-apply a (partial) theme without re-mounting the component. */
  applyTheme: (theme: OdontogramTheme) => void;
}
