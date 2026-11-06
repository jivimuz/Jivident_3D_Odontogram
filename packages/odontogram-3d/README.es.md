# 3d-odontogram (Español)

Odontograma 3D personalizable para React + Three.js. Permite rotar, ampliar
y añadir puntos de diagnóstico haciendo clic en los dientes.

**Documentación:** [English](README.md) · [Bahasa Indonesia](README.id.md) ·
[简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
Español · [Português](README.pt-BR.md) · [Français](README.fr.md)

## Instalación y uso

```bash
npm install 3d-odontogram three react react-dom
```

```tsx
"use client";
import { Odontogram3D } from "3d-odontogram";

export default function Page() {
  return <div style={{ width: "100%", height: 600 }}><Odontogram3D toothType="adult" /></div>;
}
```

El elemento padre debe tener ancho y alto. Arrastra con el botón izquierdo para
rotar, con el derecho para desplazar y usa la rueda para ampliar. Haz clic en
un diente para añadir un punto; vuelve a hacer clic para quitarlo.

## Leer los dientes seleccionados

`onPointsChange` recibe el `MappedPoint[]` completo después de cada cambio:

```tsx
const [points, setPoints] = useState<MappedPoint[]>([]);
<Odontogram3D toothType="adult" onPointsChange={setPoints} />;
```

También puedes usar un ref:

```tsx
const ref = useRef<Odontogram3DHandle>(null);
const points = ref.current?.getMappedPoints() ?? [];
const tooth11 = points.find((point) => point.toothId === "Tooth-11");
```

Cada punto contiene `id`, `toothId`, `x`, `y`, `z`, `type` y `description`.
Usa `resetMapping`, `setMappedPoints` y `updatePoint` para controlar los datos.

## Props y CDN

Las Props principales son `toothType`, `theme`, `initialPoints`,
`onPointsChange`, `onLoadingChange`, `modelBaseUrl`, `modelFileNames`,
`minDistance`, `maxDistance` y `watermark`. La marca de agua predeterminada es
`"Jivident"`; usa `watermark={false}` para ocultarla.

Los modelos se cargan automáticamente desde jsDelivr: `ip1.bin.gz` para
`child` e `ip3.bin.gz` para `adult`. Para alojarlos localmente, usa
`modelBaseUrl="/odontogram-assets"`.

## Licencia

MIT
