# 3d-odontogram (Português do Brasil)

Odontograma 3D personalizável para React + Three.js. Permite girar, ampliar e
adicionar pontos de diagnóstico clicando nos dentes.

**Documentação:** [English](README.md) · [Bahasa Indonesia](README.id.md) ·
[简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · Português · [Français](README.fr.md)

## Instalação e uso

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

O elemento pai precisa ter largura e altura. Arraste com o botão esquerdo para
girar, com o direito para mover e use a roda para zoom. Clique em um dente para
adicionar um ponto e clique novamente para removê-lo.

## Lendo os dentes selecionados

`onPointsChange` recebe o `MappedPoint[]` completo após cada alteração:

```tsx
const [points, setPoints] = useState<MappedPoint[]>([]);
<Odontogram3D toothType="adult" onPointsChange={setPoints} />;
```

Com um ref:

```tsx
const ref = useRef<Odontogram3DHandle>(null);
const points = ref.current?.getMappedPoints() ?? [];
const tooth11 = points.find((point) => point.toothId === "Tooth-11");
```

Cada ponto contém `id`, `toothId`, `x`, `y`, `z`, `type` e `description`.
Use `resetMapping`, `setMappedPoints` e `updatePoint` para controlar os dados.

## Props e CDN

As principais Props são `toothType`, `theme`, `initialPoints`,
`onPointsChange`, `onLoadingChange`, `modelBaseUrl`, `modelFileNames`,
`minDistance`, `maxDistance` e `watermark`. A marca d'água padrão é
`"Jivident"`; use `watermark={false}` para ocultá-la.

Os modelos são carregados automaticamente do jsDelivr: `ip1.bin.gz` para
`child` e `ip3.bin.gz` para `adult`. Para hospedagem própria, use
`modelBaseUrl="/odontogram-assets"`.

## Licença

MIT
