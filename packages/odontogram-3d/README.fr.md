# 3d-odontogram (Français)

Odontogramme 3D personnalisable pour React + Three.js. Il permet de faire
tourner, zoomer et d’ajouter des points de diagnostic en cliquant sur les dents.

**Documentation :** [English](README.md) · [Bahasa Indonesia](README.id.md) ·
[简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Português](README.pt-BR.md) · Français

## Installation et utilisation

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

Le parent doit avoir une largeur et une hauteur définies. Faites glisser avec
le bouton gauche pour tourner, le bouton droit pour déplacer et utilisez la
molette pour zoomer. Cliquez sur une dent pour ajouter un point, puis cliquez
à nouveau pour le supprimer.

## Lire les dents sélectionnées

`onPointsChange` reçoit le tableau complet `MappedPoint[]` après chaque
modification :

```tsx
const [points, setPoints] = useState<MappedPoint[]>([]);
<Odontogram3D toothType="adult" onPointsChange={setPoints} />;
```

Avec une ref :

```tsx
const ref = useRef<Odontogram3DHandle>(null);
const points = ref.current?.getMappedPoints() ?? [];
const tooth11 = points.find((point) => point.toothId === "Tooth-11");
```

Chaque point contient `id`, `toothId`, `x`, `y`, `z`, `type` et `description`.
Utilisez `resetMapping`, `setMappedPoints` et `updatePoint` pour gérer les données.

## Props et CDN

Les principales Props sont `toothType`, `theme`, `initialPoints`,
`onPointsChange`, `onLoadingChange`, `modelBaseUrl`, `modelFileNames`,
`minDistance`, `maxDistance` et `watermark`. Le filigrane par défaut est
`"Jivident"` ; utilisez `watermark={false}` pour le masquer.

Les modèles sont automatiquement chargés depuis jsDelivr : `ip1.bin.gz` pour
`child` et `ip3.bin.gz` pour `adult`. Pour les héberger vous-même, utilisez
`modelBaseUrl="/odontogram-assets"`.

## Licence

MIT
