import * as THREE from "three";
import type { ColorInput, OdontogramTheme } from "./types";

export const DEFAULT_THEME: Required<OdontogramTheme> = {
  toothColor: 0xf5f5dc, // Ivory
  highlightColor: 0x3b82f6, // Tailwind blue-500
  markerColor: 0xff0000, // Red
  canvasBackground: 0xecf0f1,
  canvasBackgroundOpacity: 0,
  ambientLightColor: 0xffffff,
  ambientLightIntensity: 0.8,
  keyLightColor: 0xffffff,
  keyLightIntensity: 0.6,
  fillLightColor: 0xffffff,
  fillLightIntensity: 0.4,
};

export function mergeTheme(theme?: OdontogramTheme): Required<OdontogramTheme> {
  return { ...DEFAULT_THEME, ...theme };
}

/** Three.js color helpers accept numbers (0xff0000) or strings ("#ff0000"); normalize both to a hex number. */
export function toHexColor(input: ColorInput): number {
  if (typeof input === "number") return input;
  return new THREE.Color(input).getHex();
}
