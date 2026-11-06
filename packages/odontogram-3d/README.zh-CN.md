# 3d-odontogram（简体中文）

可自定义的 React + Three.js 3D 牙齿图，支持旋转、缩放，以及点击牙齿添加诊断点。

**文档：** [English](README.md) · [Bahasa Indonesia](README.id.md) · 简体中文 ·
[日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) ·
[Português](README.pt-BR.md) · [Français](README.fr.md)

## 安装和使用

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

父容器必须有明确的宽度和高度。左键拖动旋转，右键拖动平移，滚轮缩放。
点击牙齿添加诊断点，再次点击可删除。

## 获取选中数据

`onPointsChange` 会在每次添加、删除、重置或替换后返回完整的 `MappedPoint[]`：

```tsx
const [points, setPoints] = useState<MappedPoint[]>([]);
<Odontogram3D toothType="adult" onPointsChange={setPoints} />;
```

也可以使用 ref：

```tsx
const ref = useRef<Odontogram3DHandle>(null);
const points = ref.current?.getMappedPoints() ?? [];
const tooth11 = points.find((point) => point.toothId === "Tooth-11");
```

每个点包含 `id`、`toothId`、`x`、`y`、`z`、`type` 和 `description`。
可使用 `resetMapping`、`setMappedPoints` 和 `updatePoint` 控制数据。

## Props 和模型 CDN

主要 Props：`toothType`、`theme`、`initialPoints`、`onPointsChange`、
`onLoadingChange`、`modelBaseUrl`、`modelFileNames`、`minDistance`、
`maxDistance` 和 `watermark`。水印默认是 `"Jivident"`，使用
`watermark={false}` 可隐藏。

模型会自动从 jsDelivr 加载：`child` 使用 `ip1.bin.gz`，`adult` 使用
`ip3.bin.gz`。自托管时设置 `modelBaseUrl="/odontogram-assets"`。

## 许可证

MIT
