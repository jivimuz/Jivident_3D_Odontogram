# Jivident 3D Odontogram 🦷

Jivident 3D Odontogram is a free modern, interactive web-based dental mapping (odontogram) application designed to digitize dental records into an intuitive 3D format.

This repo is a monorepo with two parts:

- **Demo app** (this root folder) — the Next.js application you see in the screenshot below.
- **[`packages/odontogram-3d`](packages/odontogram-3d)** — the reusable 3D canvas, published to npm as
  [`3d-odontogram`](https://www.npmjs.com/package/3d-odontogram). Install it in *any* React project to
  embed the same 3D odontogram with your own colors — see its [README](packages/odontogram-3d/README.md)
  for the full props/theme reference.

## Screenshots

![UI Screenshot](/ss1.png)

## Key Features

- Interactive 3D visualization (rotate, zoom, pan)
- Click-to-mark dental conditions
- Supports FDI & Universal Numbering
- Responsive design
- Fully customizable colors (tooth, highlight, marker, canvas background, lights) via the
  [`3d-odontogram`](https://www.npmjs.com/package/3d-odontogram) package's `theme` prop
- Powered by Next.js, TypeScript, and Three.js

## Tech Stack

- Next.js (App Router)
- TypeScript
- Three.js (via the `3d-odontogram` package)
- Tailwind CSS

## Getting Started

### Running the demo app

Requirements: Node.js 18.18 or newer and npm.

```bash
git clone https://github.com/jivimuz/Jivident_3D_Odontogram.git
cd Jivident_3D_Odontogram
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The root project is an npm workspace. `npm install` installs dependencies for
both the Next.js demo and the local `3d-odontogram` package. The development
command builds the package before starting Next.js.

### Installing the package in another React project

Install the published package and its peer dependencies:

```bash
npm install 3d-odontogram three react react-dom
```

Use it from a Client Component:

```tsx
"use client";

import { Odontogram3D } from "3d-odontogram";

export default function DentalChart() {
  return (
    <div style={{ width: "100%", height: 600 }}>
      <Odontogram3D toothType="adult" />
    </div>
  );
}
```

The parent element must have an explicit height because the canvas fills its
parent. Model files are loaded automatically from the default jsDelivr CDN.
For the complete props reference and selected-point data examples, see the
[package README](packages/odontogram-3d/README.md).

### Working on the package locally

Build the package:

```bash
npm run build:lib
```

Run the package build in watch mode:

```bash
npm run dev:lib
```

Run linting and the production build:

```bash
npm run lint
npm run build
```

### Documentation languages

The package README is available in:

- [English (default)](packages/odontogram-3d/README.md)
- [Bahasa Indonesia](packages/odontogram-3d/README.id.md)
- [简体中文](packages/odontogram-3d/README.zh-CN.md)
- [日本語](packages/odontogram-3d/README.ja.md)
- [한국어](packages/odontogram-3d/README.ko.md)
- [Español](packages/odontogram-3d/README.es.md)
- [Português do Brasil](packages/odontogram-3d/README.pt-BR.md)
- [Français](packages/odontogram-3d/README.fr.md)
