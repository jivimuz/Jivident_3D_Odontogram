# 3d-odontogram (한국어)

React + Three.js 기반의 사용자 지정 가능한 3D 치아도입니다. 회전, 확대/축소,
치아 클릭을 통한 진단 포인트 추가를 지원합니다.

**문서:** [English](README.md) · [Bahasa Indonesia](README.id.md) ·
[简体中文](README.zh-CN.md) · [日本語](README.ja.md) · 한국어 ·
[Español](README.es.md) · [Português](README.pt-BR.md) · [Français](README.fr.md)

## 설치 및 사용

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

부모 요소에 너비와 높이가 필요합니다. 왼쪽 드래그는 회전, 오른쪽 드래그는
이동, 스크롤은 확대/축소입니다. 치아를 클릭하면 포인트가 추가되고 다시
클릭하면 제거됩니다.

## 선택 데이터 읽기

`onPointsChange`는 변경 후 전체 `MappedPoint[]`를 전달합니다.

```tsx
const [points, setPoints] = useState<MappedPoint[]>([]);
<Odontogram3D toothType="adult" onPointsChange={setPoints} />;
```

```tsx
const ref = useRef<Odontogram3DHandle>(null);
const points = ref.current?.getMappedPoints() ?? [];
const tooth11 = points.find((point) => point.toothId === "Tooth-11");
```

각 포인트에는 `id`, `toothId`, `x`, `y`, `z`, `type`, `description`이
포함됩니다. `resetMapping`, `setMappedPoints`, `updatePoint`로 상태를
제어할 수 있습니다.

## Props 및 CDN

주요 Props는 `toothType`, `theme`, `initialPoints`, `onPointsChange`,
`onLoadingChange`, `modelBaseUrl`, `modelFileNames`, `minDistance`,
`maxDistance`, `watermark`입니다. 워터마크 기본값은 `"Jivident"`이며
`watermark={false}`로 숨길 수 있습니다.

모델은 jsDelivr에서 자동으로 로드됩니다. `child`는 `ip1.bin.gz`, `adult`는
`ip3.bin.gz`를 사용합니다. 직접 호스팅하려면
`modelBaseUrl="/odontogram-assets"`를 사용하세요.

## 라이선스

MIT
