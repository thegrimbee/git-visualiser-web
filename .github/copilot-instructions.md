# Copilot Coding Agent Instructions

## Project Overview

**git-visualiser-web** is a React-based web application that visualizes Git object databases. It renders an interactive canvas-based graph showing Git objects (commits, trees, blobs, tags) and their relationships, with a detail panel for inspecting individual objects. The app currently uses mock data for demonstration purposes.

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (~5.9, strict mode enabled)
- **Framework**: React 19 with JSX automatic runtime
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 (via PostCSS + autoprefixer)
- **Icons**: lucide-react
- **Utilities**: clsx, tailwind-merge
- **Linting**: ESLint 9 (flat config) with typescript-eslint, react-hooks, and react-refresh plugins
- **Deployment**: GitHub Pages via GitHub Actions (push to `main` triggers deploy)

## Project Structure

```
src/
├── main.tsx                    # React DOM entry point
├── App.tsx                     # Root component (renders ObjectDatabase)
├── App.css                     # App-specific styles
├── index.css                   # Global styles (Tailwind imports)
└── assets/
    ├── ObjectDatabase.tsx      # Main layout: filter panel + graph + detail panel; defines GitObject types
    ├── ObjectGraph.tsx         # Interactive canvas-based graph with pan/drag (dark theme, used in production)
    ├── ObjectGraphLight.tsx    # Simplified static canvas graph (light variant, not currently used)
    ├── ObjectDetail.tsx        # Detail view for selected objects (commit/tree/blob/tag)
    └── MockData.tsx            # Sample Git objects for demo
public/                         # Static assets
```

### Key Architectural Notes

- All Git object TypeScript interfaces (`GitObject`, `CommitObject`, `TreeObject`, `BlobObject`, `TagObject`) are defined in `src/assets/ObjectDatabase.tsx` and imported by other components.
- The graph visualization uses the HTML Canvas API directly (not a charting library). `ObjectGraph.tsx` is the interactive version with panning and node dragging; `ObjectGraphLight.tsx` is a read-only variant.
- The app is a fully client-side static site with no backend. All data comes from `MockData.tsx`.
- The Vite base path is set to `/git-visualiser-web/` for GitHub Pages hosting.

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` (or `npm ci` for clean install) |
| Start dev server | `npm run dev` |
| Build for production | `npm run build` (runs `tsc -b && vite build`) |
| Lint | `npm run lint` |
| Preview production build | `npm run preview` |
| Deploy to GitHub Pages | `npm run deploy` |

## Build & Lint Details

- **Build** runs TypeScript compilation (`tsc -b`) first, then Vite bundling. Both must pass for a successful build.
- **Lint** uses ESLint flat config (`eslint.config.js`). It targets `**/*.{ts,tsx}` files and ignores the `dist` directory.
- There is **no test framework** configured. No test runner, no test files.
- TypeScript is configured with strict mode, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.

### Known Lint Warnings

The following lint warnings exist in the codebase and are pre-existing (not regressions):

1. `ObjectDatabase.tsx` line 82: `react-hooks/exhaustive-deps` — `useMemo` has unnecessary dependency `mockObjects` (outer scope constant).
2. `ObjectGraphLight.tsx` line 248: `react-hooks/exhaustive-deps` — `useEffect` missing dependencies `STATIC_PADDING.x` and `STATIC_PADDING.y`.

These are warnings only and do not block the build.

## CI/CD

The GitHub Actions workflow (`.github/workflows/deploy.yaml`) runs on pushes to `main`:

1. Checkout → Setup Node 20 → `npm ci` → `npm run build` → Deploy `dist/` to GitHub Pages

There are no CI checks for pull requests (no PR-triggered workflows for lint or build verification).

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite config with React plugin, base path `/git-visualiser-web/` |
| `tsconfig.json` | Project references to `tsconfig.app.json` and `tsconfig.node.json` |
| `tsconfig.app.json` | App TypeScript config (ES2022, strict, JSX react-jsx, bundler resolution) |
| `tsconfig.node.json` | Node/build TypeScript config (for vite.config.ts) |
| `eslint.config.js` | ESLint flat config with TS, React hooks, React refresh rules |
| `tailwind.config.js` | Tailwind CSS config scanning `src/` |
| `postcss.config.js` | PostCSS with Tailwind and autoprefixer plugins |

## Development Tips

- After making changes, always run `npm run build` to verify both TypeScript compilation and Vite bundling pass.
- Run `npm run lint` to check for ESLint issues. Aim for zero errors; warnings are acceptable if pre-existing.
- When adding new components, place them in `src/assets/` following the existing pattern (named exports, `.tsx` extension).
- When modifying Git object types, update the interfaces in `ObjectDatabase.tsx` — all other components import types from there.
- The canvas rendering code in `ObjectGraph.tsx` is complex. Changes to layout constants (e.g., `ROW_HEIGHT`, `COL_WIDTH_COMMIT`, `DEPTH_INDENT`) affect the visual layout of the entire graph.
- Use `npm run dev` to test UI changes with hot module replacement.
