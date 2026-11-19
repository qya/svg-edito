# SVGEdito

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/qya/svg-edito)

> A professional, modern SVG and vector path editor built with React, TypeScript, and Vite. Inspired by the layer workflow of design tools like Figma and Photoshop, with a deep, first-class path-manipulation engine inspired by [svg-path-editor](https://github.com/Yqnn/svg-path-editor).

---

## ✨ Features

### 🎯 Path-First Vector Engine
- **Full SVG Path Command Support**: Visually edit every SVG path command: `M`, `L`, `H`, `V`, `C`, `S`, `Q`, `T`, `A`, and `Z`.
- **Interactive Control Handles**: Drag nodes and Bézier control points with precision snapping.
- **Coordinate Mode Toggling**: Seamlessly switch individual commands between absolute (uppercase) and relative (lowercase).
- **Geometric Transformations**:
  - Translate, scale, and rotate paths interactively.
  - Reverse path direction.
  - Change path origin / start node.
  - Optimize paths (remove redundant commands, merge collinear lines, round decimals).

### 🗂️ Multi-Layer Document Architecture
- **Hierarchical Layer Tree**: Organize artwork into layers and nested groups (`<g>`).
- **Layer Controls**:
  - Reorder z-index via drag-and-drop or actions.
  - Visibility toggles (show / hide).
  - Lock / unlock to prevent accidental edits.
  - Rename, duplicate, and delete layers.
- **Per-Layer Styling**: Custom fill, stroke, stroke-width, and opacity per layer.
- **Primitive Elements**: Direct parsing and layer representation for `<path>`, `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polyline>`, and `<polygon>`.

### 🔗 Compressed URL Sharing (`lz-string`)
- **Dual-Mode Sharing**:
  - **Selected Path Only**: Generates a shareable URL containing only the active vector path.
  - **Full SVG Document**: Compresses and encodes the entire layer hierarchy, styles, and viewBox.
- **High-Efficiency URL Compression**: Uses `lz-string` to produce compact, URL-safe hash strings (`#d=...`).
- **Backward Compatibility**: Fully compatible with legacy `#P=...` path URLs.
- **Instant Preview & Import**: Opening a shared link previews the artwork and lets you import it directly into the editor.

### 🖼️ Backdrop Images & Tracing
- Load reference bitmap images (`PNG`, `JPEG`, `WebP`, `SVG`).
- Adjust opacity, lock aspect ratio, and reposition/scale images to easily trace artwork into vector paths.

### 💾 Import & Export
- **Clean SVG Export**: Export the full multi-layer SVG document or only the active layer.
- **PNG Rasterization**: Render high-resolution PNGs at custom scale factors.
- **Local Browser Storage**: Autosave projects to local storage and reopen them anytime.
- **SVG Drag-and-Drop**: Drop `.svg` files directly into the window to inspect and edit.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn / pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/qya/svg-edito.git
cd svg-edito

# Install dependencies
npm install
```

### Development

```bash
# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:3000`.

### Production Build

```bash
# Type-check and build for production
npm run build

# Preview production build locally
npm run preview
```

### Running Tests

```bash
# Run unit tests with Vitest
npm test

# Run tests in watch mode
npm run test:watch
```

### Deploy to Cloudflare Workers

Click **Deploy to Cloudflare** above to copy this repository into your GitHub account and deploy it using Cloudflare Workers Builds. You need Cloudflare and GitHub accounts. Accept the detected build command (`npm run build`) and deploy command (`npm run deploy`).

The app runs as a static site on Workers. `wrangler.jsonc` serves the Vite output in `dist/` and enables single-page application fallback. No secrets, environment variables, or database bindings are required.

For deployment from your machine, use Node.js 22.18+ and run:

```bash
npm ci
npm run deploy
```

The deploy script downloads Wrangler 4 through `npx`, prompts you to sign in to Cloudflare when needed, builds the app, and deploys it to a `workers.dev` URL. Change `name` in `wrangler.jsonc` to use a different Worker name.

To build and preview with the local Cloudflare runtime:

```bash
npm run preview:cloudflare
```

Wrangler runs the build command before serving or deploying. Workers Builds also runs the detected build command, so its deployment may build the app a second time. To validate deployment packaging without publishing:

```bash
npm run deploy -- --dry-run
```

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Compression**: [lz-string](https://github.com/pieroxy/lz-string) for URL payload compression
- **Icons**: [lucide-react](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🤝 Acknowledgements & Credits

- Path editing engine and mathematics are inspired by and build upon [svg-path-editor](https://github.com/Yqnn/svg-path-editor) by Yqnn.
- URL compression technique inspired by [wiretext](https://github.com/mualat/wiretext).

---

## 📄 License

MIT License. Feel free to use, modify, and contribute!
