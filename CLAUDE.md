# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wonder Kids Math is a children's math education game built as a Vite + React SPA. It presents word problems across 4 worlds (Addition, Subtraction, Multiplication, Division) with themed visuals, animations, and bilingual support (English/Thai).

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run build:data` — Rebuild curriculum JSON from `scripts/build-curriculum.cjs`

## Architecture

### Screen Flow
`App.jsx` manages three screens via state: `start` → `map` → `game`. Transitions use a cinematic loading screen with `AnimatePresence`. The `RebuildController` wraps the active game session.

### 4-Stage Mission Pipeline
Each level progresses through 4 stages in order, driven by `useGameStore.stage`:
1. **adventure** (`StageAdventure`) — Narrative introduction
2. **builder** (`StageBuilder`) — Equation construction
3. **tutor** (`StageTutor`) — Teaching moment
4. **celebration** (`StageCelebration`) — Completion/rewards

`StageSwitcher.jsx` maps stage names to components and handles animated transitions between them.

### State Management (Zustand)
- **`useGameStore`** — Session state: current question, stage progression, mistakes, microStep. Not persisted.
- **`useLevelStore`** — Persistent progression: completed levels with star ratings, per-operation analytics. Persisted to localStorage as `wonder-math-progression`.
- **`useLanguageStore`** — Language toggle (en/th). Persisted as `wonder-math-language`.
- **`useAudioStore`** — BGM/SFX/voice toggles. Persisted as `wonder-math-audio`.

### Curriculum Data
World data lives in `src/data/world_1.json` through `world_4.json`. `src/data/loader.js` flattens all worlds into a single `questions` array and exports a `WORLDS` registry. Each question has: `math` (num1, num2, ans), `narrative` (en/th), `theme` (id + emoji items), and `config` (mechanic, operation, missingField).

### Theming
`ThemeRegistry.js` defines visual themes (candy, classroom, bakery, beach, garden) with colors and asset paths. `SceneBackground` renders the theme backdrop; `ThemeItems` renders themed objects.

### Mini-Game Mechanics
Questions specify a `config.mechanic` that maps to interactive game components in `src/components/games/`: SortingBins, ClawMachine, GumballCrank, TrainLoader, MemoryMatch, HiddenObject, BubblePop, FeedCharacter, BridgeBuilder.

### Utilities
- `src/utils/tts.js` — Text-to-speech via browser API
- `src/utils/sfx.js` — Sound effects
- `src/utils/confetti.js` — canvas-confetti celebrations
- `src/utils/i18n.js` — Internationalization helpers
- `src/utils/encouragement.js` — Motivational messages
- `src/utils/progress.js` — Progress calculation helpers

### Key Libraries
React 19, Zustand 5 (state), Framer Motion 12 (animations), Lottie React (animated illustrations), Tailwind CSS 4, canvas-confetti, Lucide React (icons).

### Design System
- Fonts: "Fredoka One" (display), "Nunito" (body)
- Custom Tailwind color palette under `wonder-*` prefix
- Landscape-only layout with portrait rotation guard
- Glass-panel aesthetic via shared components (`GlassPanel`, `GummyButton`, `SpeechBubble`)
