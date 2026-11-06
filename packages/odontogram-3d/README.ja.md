# 3d-odontogram（日本語）

React + Three.js 用のカスタマイズ可能な 3D オドントグラムです。回転、
ズーム、歯をクリックした診断点の追加に対応しています。

**ドキュメント:** [English](README.md) · [Bahasa Indonesia](README.id.md) ·
[简体中文](README.zh-CN.md) · 日本語 · [한국어](README.ko.md) ·
[Español](README.es.md) · [Português](README.pt-BR.md) · [Français](README.fr.md)

## インストールと使用

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

親要素には幅と高さが必要です。左ドラッグで回転、右ドラッグで移動、
スクロールでズームできます。歯をクリックすると点が追加され、再度
クリックすると削除されます。

## 選択データ

`onPointsChange` は変更後の `MappedPoint[]` を返します。

```tsx
const [points, setPoints] = useState<MappedPoint[]>([]);
<Odontogram3D toothType="adult" onPointsChange={setPoints} />;
```

ref から取得することもできます。

```tsx
const ref = useRef<Odontogram3DHandle>(null);
const points = ref.current?.getMappedPoints() ?? [];
const tooth11 = points.find((point) => point.toothId === "Tooth-11");
```

各点には `id`、`toothId`、`x`、`y`、`z`、`type`、`description` が含まれます。
`resetMapping`、`setMappedPoints`、`updatePoint` で状態を操作できます。

## Props と CDN

主な Props は `toothType`、`theme`、`initialPoints`、`onPointsChange`、
`onLoadingChange`、`modelBaseUrl`、`modelFileNames`、`minDistance`、
`maxDistance`、`watermark` です。透かしの既定値は `"Jivident"` で、
`watermark={false}` で非表示にできます。

モデルは jsDelivr から自動的に読み込まれます。`child` は `ip1.bin.gz`、
`adult` は `ip3.bin.gz` です。自前でホストする場合は
`modelBaseUrl="/odontogram-assets"` を指定してください。

## ライセンス

MIT
