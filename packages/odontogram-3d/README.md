# 3d-odontogram

Customizable React + Three.js 3D odontogram (dental chart). Click a tooth to mark/unmark a
diagnostic point; every color — tooth, highlight, marker, canvas background, lights — is
themeable via props, and each instance owns its own Three.js scene so you can mount more than
one on the same page.

![3D Odontogram screenshot](https://raw.githubusercontent.com/jivimuz/Jivident_3D_Odontogram/main/ss1.png)

*Screenshot of the [demo app](https://github.com/jivimuz/Jivident_3D_Odontogram) built on top of this package.*

## Install

```bash
npm install 3d-odontogram three react react-dom
```

`react`, `react-dom` and `three` are peer dependencies — install them in the consuming app.

## Basic usage

```tsx
import { Odontogram3D } from "3d-odontogram";

export default function Page() {
  return (
    <div style={{ width: "100%", height: 600 }}>
      <Odontogram3D toothType="adult" />
    </div>
  );
}
```

The component renders a `<canvas>` that fills its parent — size it with a container `div`.

## Customizing colors (theme)

```tsx
<Odontogram3D
  toothType="adult"
  theme={{
    toothColor: "#fdf6e3",      // default tooth color
    highlightColor: "#e11d48",  // color applied when a tooth has a diagnostic point
    markerColor: "#111827",     // marker sphere color
    canvasBackground: "#0f172a",
    canvasBackgroundOpacity: 1, // 0 = transparent canvas, 1 = opaque background
    ambientLightColor: "#ffffff",
    ambientLightIntensity: 0.9,
  }}
/>
```

Colors accept a hex number (`0xff0000`) or any CSS color string (`"#ff0000"`, `"red"`).
Changing the `theme` prop after mount re-applies it live — no reload of the 3D model.

## Model files (zero setup by default)

The `.bin.gz` model files (`ip1.bin.gz` for child, `ip3.bin.gz` for adult) are **not** bundled
into this npm package — they're tens of MB, far too big to ship in every install. Instead, by
default the component loads them from a public CDN (jsDelivr, serving the files straight from
this package's GitHub repo), so it works out of the box with no extra setup.

If you'd rather self-host the models (e.g. for offline use, a private network, or to avoid the
external CDN dependency), download `ip1.bin.gz` / `ip3.bin.gz` from
[`public/assets/bin`](https://github.com/jivimuz/Jivident_3D_Odontogram/tree/main/public/assets/bin)
into your own app's public folder and override the base path and/or file names:

```tsx
<Odontogram3D
  toothType="child"
  modelBaseUrl="/odontogram-assets"
  modelFileNames={{ child: "child-model.bin.gz", adult: "adult-model.bin.gz" }}
/>
```

## Reading and controlling diagnostic points

```tsx
import { useRef } from "react";
import { Odontogram3D, type Odontogram3DHandle, type MappedPoint } from "3d-odontogram";

function Example() {
  const handleRef = useRef<Odontogram3DHandle>(null);

  return (
    <Odontogram3D
      ref={handleRef}
      onPointsChange={(points: MappedPoint[]) => console.log(points)}
      onLoadingChange={(loading) => console.log("loading:", loading)}
    />
  );
}

// Elsewhere, using the ref:
handleRef.current?.resetMapping();
handleRef.current?.getMappedPoints();
handleRef.current?.setMappedPoints(importedPoints); // e.g. after importing a JSON file
handleRef.current?.applyTheme({ highlightColor: "#22c55e" });
```

## Props reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `toothType` | `"child" \| "adult"` | `"child"` | 20-tooth or 32-tooth model. |
| `theme` | `OdontogramTheme` | see below | Colors for tooth/highlight/marker/background/lights. |
| `modelBaseUrl` | `string` | jsDelivr CDN (this repo's `public/assets/bin`) | Base path for the `.bin.gz` model files. |
| `modelFileNames` | `{ child?: string; adult?: string }` | `{ child: "ip1.bin.gz", adult: "ip3.bin.gz" }` | File names per tooth type. |
| `initialPoints` | `MappedPoint[]` | — | Points to render as soon as the model loads. |
| `onPointsChange` | `(points: MappedPoint[]) => void` | — | Called whenever points are added/removed/replaced. |
| `onLoadingChange` | `(loading: boolean) => void` | — | Called when the model starts/finishes loading. |
| `minDistance` / `maxDistance` | `number` | `100` / `130` | Orbit camera zoom limits. |
| `className` / `style` | — | — | Passed through to the `<canvas>`. |

### `OdontogramTheme` defaults

| Key | Default |
| --- | --- |
| `toothColor` | `0xf5f5dc` (ivory) |
| `highlightColor` | `0x3b82f6` (blue) |
| `markerColor` | `0xff0000` (red) |
| `canvasBackground` | `0xecf0f1` |
| `canvasBackgroundOpacity` | `0` |
| `ambientLightColor` / `ambientLightIntensity` | `0xffffff` / `0.8` |
| `keyLightColor` / `keyLightIntensity` | `0xffffff` / `0.6` |
| `fillLightColor` / `fillLightIntensity` | `0xffffff` / `0.4` |

## License

MIT
