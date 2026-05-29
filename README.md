# FluidDnaFlow

An interactive **fluid dynamics simulation** in the browser — visualize flow around obstacles, tweak parameters live, compare runs side-by-side, and record simulations as **animated GIFs**. Built as a full-stack TypeScript app with React + Vite on the client and Express on the server.

**Live app:** [replit.com/@robertdickinson/FluidDnaFlow](https://replit.com/@robertdickinson/FluidDnaFlow)

---

## Overview

FluidDnaFlow is a teaching/exploration tool for 2D fluid flow. You set up the domain, pick an obstacle shape, and watch the flow field evolve in real time. The app also includes built-in **onboarding** and **documentation tabs** (with source-code view) so you can see exactly how the simulation is wired up.

The "DNA" in the name is a nod to the strand-like streamlines and vortex shedding you see when fluid flows past a bluff body — patterns that read almost like genetic ribbons in motion.

---

## Features

- **Interactive fluid dynamics simulation** — real-time flow field with live parameter controls.
- **Selectable obstacle shapes** — swap between different bluff bodies and see how the wake changes.
- **Side-by-side comparison** — run two simulations together to compare conditions.
- **GIF recording** — capture animated GIFs of simulation runs for sharing or notes.
- **Onboarding tab** — guided intro to the controls and the underlying model.
- **Documentation tab** — inline reference plus source-code view for transparency.
- **TypeScript end-to-end** — shared types between client and server.

---

## Tech stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React + Vite + TypeScript |
| UI          | Tailwind CSS + component registry (`components.json`) |
| Backend     | Node.js + Express (`server/`) |
| Database    | Drizzle ORM (`drizzle.config.ts`) |
| Shared code | `shared/` types & schema |
| Hosting     | Replit (`.replit` config) |

---

## Repository structure

```text
FluidDnaFlow/
├── client/              # React + Vite frontend (simulation UI, controls, GIF recorder)
├── server/              # Express server (API, onboarding, docs)
├── shared/              # Shared types & schema
├── attached_assets/     # Images and demo assets
├── drizzle.config.ts    # Drizzle ORM configuration
├── components.json      # UI component registry
├── package.json         # Scripts and dependencies
└── .replit              # Replit run/deploy configuration
```

---

## Getting started

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)

### Clone the repo

```bash
git clone https://github.com/Robert-Dickinson-NS-Apps/FluidDnaFlow.git
cd FluidDnaFlow
```

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

The Express server serves the API and the Vite-built client; open the printed local URL in your browser.

### Build for production

```bash
npm run build
npm start
```

---

## Usage

1. Open the app and start in the **Onboarding** tab if it's your first time.
2. Switch to the simulation view.
3. Pick an **obstacle shape** (cylinder, airfoil, custom, etc.).
4. Adjust flow parameters (velocity, viscosity / Reynolds number, resolution).
5. Press play to run the simulation — watch streamlines and vortices form.
6. Use **compare mode** to run a second simulation alongside the first.
7. Hit **record** to export the run as an animated GIF.
8. Open the **Documentation** tab to read the model notes and inspect the source.

---

## Customization ideas

- **New obstacle shapes** — add SVG paths or signed-distance functions to the obstacle library.
- **Flow model** — swap the solver (e.g., lattice-Boltzmann vs. simplified Navier–Stokes) or tune stability parameters.
- **Visualization** — add vorticity overlays, pressure contours, or streamline tracers.
- **Export** — add CSV / JSON export of the flow field alongside GIF capture.
- **Presets** — ship a small library of canonical cases (Karman vortex street, channel flow, lid-driven cavity).

---

## About

Built by **Robert Dickinson** as part of the [Robert-Dickinson-NS-Apps](https://github.com/Robert-Dickinson-NS-Apps) collection — a set of single-purpose web apps spanning water engineering, hydraulic modeling, learning communities, and lightweight visualization tools. FluidDnaFlow fits naturally next to the SWMM5/ICM work: same physics roots, but optimized for fast, visual intuition.

## License

MIT
