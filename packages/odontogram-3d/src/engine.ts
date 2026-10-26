import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DEFAULT_THEME, mergeTheme, toHexColor } from "./theme";
import { mapForToothType } from "./toothNameMaps";
import type { MappedPoint, OdontogramTheme, ToothType } from "./types";

export interface OdontogramEngineOptions {
  theme?: OdontogramTheme;
  /**
   * Base path where `<toothType>` model files are served from.
   * Default: a public CDN (jsDelivr, serving the files straight from this package's GitHub repo)
   * so the component works with zero setup. Pass your own path/URL to self-host the models instead.
   */
  modelBaseUrl?: string;
  /** Override the model file name per tooth type. Defaults to "ip1.bin.gz" (child) / "ip3.bin.gz" (adult). */
  modelFileNames?: { child?: string; adult?: string };
  onLoadingChange?: (loading: boolean) => void;
  onPointsChange?: (points: MappedPoint[]) => void;
  /** Camera orbit distance limits. */
  minDistance?: number;
  maxDistance?: number;
}

const DEFAULT_MODEL_FILE_NAMES = { child: "ip1.bin.gz", adult: "ip3.bin.gz" };

/** Served straight from the GitHub repo via jsDelivr — no separate asset hosting needed. */
const DEFAULT_MODEL_BASE_URL =
  "https://cdn.jsdelivr.net/gh/jivimuz/Jivident_3D_Odontogram@main/public/assets/bin";

/**
 * Encapsulates one Three.js scene/renderer/model instance. Every instance owns its own
 * state (no module-level globals), so multiple <Odontogram3D /> can be mounted at once.
 */
export class OdontogramEngine {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private toothMeshes: THREE.Object3D[] = [];
  private animationFrameId: number | null = null;
  private theme: Required<OdontogramTheme>;
  private toothMaterialTemplate: THREE.MeshPhongMaterial;
  private mappedPoints: MappedPoint[] = [];
  private options: OdontogramEngineOptions;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, options: OdontogramEngineOptions = {}) {
    this.canvas = canvas;
    this.options = options;
    this.theme = mergeTheme(options.theme);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      50,
      canvas.clientWidth / canvas.clientHeight || 1,
      0.1,
      200
    );
    this.camera.position.set(0, 2.5, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.applyCanvasBackground();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = options.minDistance ?? 100;
    this.controls.maxDistance = options.maxDistance ?? 130;
    this.controls.target.set(4, 8, 0);

    this.toothMaterialTemplate = new THREE.MeshPhongMaterial({
      color: toHexColor(this.theme.toothColor),
      specular: 0x555555,
      shininess: 30,
      flatShading: false,
      side: THREE.DoubleSide,
    });

    this.setupLights();

    const animate = () => {
      if (this.disposed) return;
      this.animationFrameId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private lights: {
    ambient: THREE.AmbientLight;
    key: THREE.DirectionalLight;
    fill: THREE.DirectionalLight;
  } | null = null;

  private setupLights() {
    const ambient = new THREE.AmbientLight(
      toHexColor(this.theme.ambientLightColor),
      this.theme.ambientLightIntensity
    );
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(
      toHexColor(this.theme.keyLightColor),
      this.theme.keyLightIntensity
    );
    key.position.set(10, 10, 10);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(
      toHexColor(this.theme.fillLightColor),
      this.theme.fillLightIntensity
    );
    fill.position.set(-10, -10, -5);
    this.scene.add(fill);

    this.lights = { ambient, key, fill };
  }

  private applyCanvasBackground() {
    this.renderer.setClearColor(
      toHexColor(this.theme.canvasBackground),
      this.theme.canvasBackgroundOpacity
    );
  }

  private resolveModelUrl(toothType: ToothType) {
    const base = this.options.modelBaseUrl ?? DEFAULT_MODEL_BASE_URL;
    const fileNames = { ...DEFAULT_MODEL_FILE_NAMES, ...this.options.modelFileNames };
    const fileName = toothType === "adult" ? fileNames.adult : fileNames.child;
    return `${base.replace(/\/$/, "")}/${fileName}`;
  }

  /** Re-apply a (partial) theme to lights, background and every tooth currently in its default state. */
  applyTheme(theme: OdontogramTheme) {
    this.theme = mergeTheme({ ...this.theme, ...theme });
    this.applyCanvasBackground();

    if (this.lights) {
      this.lights.ambient.color.setHex(toHexColor(this.theme.ambientLightColor));
      this.lights.ambient.intensity = this.theme.ambientLightIntensity;
      this.lights.key.color.setHex(toHexColor(this.theme.keyLightColor));
      this.lights.key.intensity = this.theme.keyLightIntensity;
      this.lights.fill.color.setHex(toHexColor(this.theme.fillLightColor));
      this.lights.fill.intensity = this.theme.fillLightIntensity;
    }

    this.toothMaterialTemplate.color.setHex(toHexColor(this.theme.toothColor));

    const mappedToothIds = new Set(this.mappedPoints.map((p) => p.toothId));
    this.forEachToothGroup((group) => {
      const isMapped = Boolean(group.userData.isMapped);
      const color = isMapped ? this.theme.highlightColor : this.theme.toothColor;
      this.setGroupColor(group, toHexColor(color));
    });

    // Markers use their own small sphere material, update those too.
    this.scene.children
      .filter((child) => child.name.startsWith("Marker-"))
      .forEach((marker) => {
        if (marker instanceof THREE.Mesh && marker.material instanceof THREE.MeshBasicMaterial) {
          marker.material.color.setHex(toHexColor(this.theme.markerColor));
        }
      });

    void mappedToothIds; // kept for clarity/future use, no-op reference
  }

  private forEachToothGroup(callback: (group: THREE.Object3D) => void) {
    const seen = new Set<THREE.Object3D>();
    this.toothMeshes.forEach((mesh) => {
      const group = mesh.userData.parentGroup as THREE.Object3D | undefined;
      if (group && !seen.has(group)) {
        seen.add(group);
        callback(group);
      }
    });
  }

  private setGroupColor(group: THREE.Object3D, hex: number) {
    group.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.userData.parentGroup === group &&
        child.material instanceof THREE.MeshPhongMaterial
      ) {
        child.material.color.setHex(hex);
      }
    });
  }

  async loadModel(toothType: ToothType) {
    const oldArchGroup = this.scene.getObjectByName("ArchGroup");
    if (oldArchGroup) {
      this.scene.remove(oldArchGroup);
      oldArchGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const material = child.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
    }

    this.toothMeshes = [];
    this.mappedPoints = [];
    this.options.onPointsChange?.([]);

    const loader = new GLTFLoader();
    const modelUrl = this.resolveModelUrl(toothType);
    this.options.onLoadingChange?.(true);

    try {
      const gltf = await loader.loadAsync(modelUrl);
      if (this.disposed) return;

      const loadedModel = gltf.scene;
      loadedModel.scale.set(1.0, 1.0, 1.0);
      loadedModel.position.set(0, -2, 0);
      loadedModel.rotation.set(0, 0, 0);
      loadedModel.name = "ArchGroup";

      const nameMap = mapForToothType(toothType);

      loadedModel.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        child.geometry.computeVertexNormals();
        if (child.geometry.attributes.color) {
          child.geometry.deleteAttribute("color");
        }

        let mappedName = nameMap[child.name];
        let targetObject: THREE.Object3D = child;

        if (!mappedName && child.parent && child.parent.type !== "Scene") {
          if (nameMap[child.parent.name]) {
            mappedName = nameMap[child.parent.name];
            targetObject = child.parent;
          }
        }

        child.material = this.toothMaterialTemplate.clone();

        if (!targetObject.userData.isTooth) {
          targetObject.userData = {
            toothId: mappedName ?? child.name,
            isTooth: true,
            isMapped: false,
            markerIds: [] as number[],
          };
        }

        child.userData.parentGroup = targetObject;
        this.toothMeshes.push(child);
      });

      this.scene.add(loadedModel);
    } catch (error) {
      console.error(`[odontogram-3d] Failed to load model at ${modelUrl}:`, error);
    } finally {
      this.options.onLoadingChange?.(false);
    }
  }

  private removeMarkers(markerIds: number[]) {
    markerIds.forEach((id) => {
      const marker = this.scene.getObjectByName(`Marker-${id}`);
      if (marker instanceof THREE.Mesh) {
        this.scene.remove(marker);
        marker.geometry.dispose();
        marker.material.dispose();
      }
    });
  }

  private addMarker(id: number, position: THREE.Vector3) {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: toHexColor(this.theme.markerColor) });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(position);
    marker.name = `Marker-${id}`;
    this.scene.add(marker);
  }

  private emitPointsChange() {
    this.options.onPointsChange?.([...this.mappedPoints]);
  }

  /** Handle a click/tap on the canvas (expects coordinates relative to the viewport, like a MouseEvent). */
  handlePointerDown(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.toothMeshes, false);
    if (intersects.length === 0) return;

    const clickedMesh = intersects[0].object;
    const toothGroup = clickedMesh.userData.parentGroup as THREE.Object3D | undefined;
    if (!toothGroup || !toothGroup.userData.isTooth) return;

    const toothId: string = toothGroup.userData.toothId;
    const point = intersects[0].point;
    const isCurrentlyMapped = Boolean(toothGroup.userData.isMapped);

    if (isCurrentlyMapped) {
      this.removeMarkers(toothGroup.userData.markerIds ?? []);
      this.setGroupColor(toothGroup, toHexColor(this.theme.toothColor));
      toothGroup.userData.isMapped = false;
      toothGroup.userData.markerIds = [];
      this.mappedPoints = this.mappedPoints.filter((p) => p.toothId !== toothId);
      this.emitPointsChange();
    } else {
      const newMarkerId = Date.now();
      this.setGroupColor(toothGroup, toHexColor(this.theme.highlightColor));
      toothGroup.userData.isMapped = true;
      toothGroup.userData.markerIds = [newMarkerId];
      this.addMarker(newMarkerId, point);

      const newPoint: MappedPoint = {
        id: newMarkerId,
        toothId,
        x: point.x.toFixed(2),
        y: point.y.toFixed(2),
        z: point.z.toFixed(2),
        type: "Karies",
        description: "",
      };
      this.mappedPoints = [...this.mappedPoints, newPoint];
      this.emitPointsChange();
    }
  }

  getMappedPoints(): MappedPoint[] {
    return [...this.mappedPoints];
  }

  /** Patch metadata (e.g. description) on an existing point without touching the 3D scene. */
  updatePoint(id: number, patch: Partial<MappedPoint>) {
    this.mappedPoints = this.mappedPoints.map((p) => (p.id === id ? { ...p, ...patch } : p));
    this.emitPointsChange();
  }

  resetMapping() {
    const existingMarkerIds = this.scene.children
      .filter((c) => c.name.startsWith("Marker-"))
      .map((c) => Number(c.name.replace("Marker-", "")));
    this.removeMarkers(existingMarkerIds);

    this.forEachToothGroup((group) => {
      this.setGroupColor(group, toHexColor(this.theme.toothColor));
      group.userData.isMapped = false;
      group.userData.markerIds = [];
    });

    this.mappedPoints = [];
    this.emitPointsChange();
  }

  /** Replace all diagnostic points and redraw markers/highlights to match (e.g. after importing JSON). */
  setMappedPoints(points: MappedPoint[]) {
    this.resetMapping();

    points.forEach((point) => {
      const group = this.toothMeshes.find(
        (mesh) => (mesh.userData.parentGroup as THREE.Object3D | undefined)?.userData.toothId === point.toothId
      )?.userData.parentGroup as THREE.Object3D | undefined;

      if (!group) return;

      this.setGroupColor(group, toHexColor(this.theme.highlightColor));
      group.userData.isMapped = true;
      group.userData.markerIds = [...(group.userData.markerIds ?? []), point.id];

      this.addMarker(point.id, new THREE.Vector3(parseFloat(point.x), parseFloat(point.y), parseFloat(point.z)));
    });

    this.mappedPoints = [...points];
    this.emitPointsChange();
  }

  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;
    const { clientWidth, clientHeight } = container;
    if (clientWidth === 0 || clientHeight === 0) return;

    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  dispose() {
    this.disposed = true;
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);

    const oldArchGroup = this.scene.getObjectByName("ArchGroup");
    if (oldArchGroup) this.scene.remove(oldArchGroup);

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const material = child.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      }
    });

    this.toothMaterialTemplate.dispose();
    this.controls.dispose();
    this.renderer.dispose();
  }
}

export { DEFAULT_THEME };
