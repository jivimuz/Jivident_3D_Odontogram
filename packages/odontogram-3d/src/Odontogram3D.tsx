"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { OdontogramEngine } from "./engine";
import type {
  MappedPoint,
  Odontogram3DHandle,
  OdontogramTheme,
  ToothType,
} from "./types";

export interface Odontogram3DProps {
  /** "child" (20 teeth) or "adult" (32 teeth). Default: "child". */
  toothType?: ToothType;
  /** Colors for the tooth, highlight, marker, canvas background and lighting. */
  theme?: OdontogramTheme;
  /** Base path where the `.bin.gz` model files are served from. Default: "/assets/bin". */
  modelBaseUrl?: string;
  /** Override the model file name per tooth type. */
  modelFileNames?: { child?: string; adult?: string };
  /** Diagnostic points to render as soon as the model finishes loading (e.g. from imported JSON). */
  initialPoints?: MappedPoint[];
  /** Fires whenever a point is added/removed/replaced. */
  onPointsChange?: (points: MappedPoint[]) => void;
  /** Fires when the model starts/finishes loading. */
  onLoadingChange?: (loading: boolean) => void;
  minDistance?: number;
  maxDistance?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Self-contained 3D odontogram canvas: owns its own Three.js scene/renderer/model instance,
 * so multiple instances can be mounted on the same page without colliding.
 */
export const Odontogram3D = forwardRef<Odontogram3DHandle, Odontogram3DProps>(
  function Odontogram3D(
    {
      toothType = "child",
      theme,
      modelBaseUrl,
      modelFileNames,
      initialPoints,
      onPointsChange,
      onLoadingChange,
      minDistance,
      maxDistance,
      className,
      style,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<OdontogramEngine | null>(null);
    const isLoadingRef = useRef(true);
    const onPointsChangeRef = useRef(onPointsChange);
    const onLoadingChangeRef = useRef(onLoadingChange);
    onPointsChangeRef.current = onPointsChange;
    onLoadingChangeRef.current = onLoadingChange;

    // Mount once: create the engine instance for this component's lifetime.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const engine = new OdontogramEngine(canvas, {
        theme,
        modelBaseUrl,
        modelFileNames,
        minDistance,
        maxDistance,
        onLoadingChange: (loading) => {
          isLoadingRef.current = loading;
          onLoadingChangeRef.current?.(loading);
        },
        onPointsChange: (points) => onPointsChangeRef.current?.(points),
      });
      engineRef.current = engine;

      engine.loadModel(toothType).then(() => {
        if (initialPoints && initialPoints.length > 0) {
          engine.setMappedPoints(initialPoints);
        }
      });

      const handleResize = () => engine.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        engine.dispose();
        engineRef.current = null;
      };
      // Intentionally mount/unmount only: toothType/theme changes below are handled by
      // dedicated effects instead of recreating the whole scene.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload the model whenever toothType changes (but not on the very first mount).
    const previousToothType = useRef(toothType);
    useEffect(() => {
      if (previousToothType.current === toothType) return;
      previousToothType.current = toothType;
      engineRef.current?.loadModel(toothType);
    }, [toothType]);

    // Re-apply theme changes live, without reloading the model.
    useEffect(() => {
      if (!theme) return;
      engineRef.current?.applyTheme(theme);
    }, [theme]);

    const handlePointerDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
      if (isLoadingRef.current) return;
      engineRef.current?.handlePointerDown(event.clientX, event.clientY);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        resetMapping: () => engineRef.current?.resetMapping(),
        getMappedPoints: () => engineRef.current?.getMappedPoints() ?? [],
        setMappedPoints: (points: MappedPoint[]) => engineRef.current?.setMappedPoints(points),
        updatePoint: (id: number, patch: Partial<MappedPoint>) => engineRef.current?.updatePoint(id, patch),
        applyTheme: (nextTheme: OdontogramTheme) => engineRef.current?.applyTheme(nextTheme),
      }),
      []
    );

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width: "100%", height: "100%", ...style }}
        onMouseDown={handlePointerDown}
      />
    );
  }
);
