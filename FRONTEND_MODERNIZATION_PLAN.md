# Frontend Modernization Plan

This checklist tracks the React/TypeScript/MUI modernization effort from the current CRA-era stack to a modern toolchain.

## Phase 1 - Toolchain Migration (CRA -> Vite)

- [x] Add Vite and React plugin dependencies.
- [x] Switch `frontend/package.json` scripts from CRA build/start to Vite (`start`, `dev`, `build`, `preview`).
- [x] Add `frontend/vite.config.ts` with `/api` dev proxy and env prefixes.
- [x] Move HTML entrypoint to Vite root (`frontend/index.html`) and remove `frontend/public/index.html`.
- [x] Update app code from `process.env` usage to `import.meta.env` patterns.
- [x] Add typed Vite env declarations (`frontend/src/vite-env.d.ts`).
- [x] Add centralized env helpers (`frontend/src/config/env.ts`) and wire services to it.
- [x] Update TypeScript config to Vite-compatible module settings.
- [x] Update Docker frontend build output from `build/` to `dist/`.
- [x] Validate Phase 1 with `npm run build`, `npm run lint`, and smoke checks.

## Phase 2 - TypeScript Upgrade

- [x] Remove `react-scripts` and CRA-only dependencies that block TypeScript major upgrades.
- [x] Upgrade TypeScript from 4.9.x to latest stable major.
- [x] Update `@types/node`, `@types/react`, and `@types/react-dom` to compatible versions.
- [x] Tighten `tsconfig` for post-CRA ESM defaults and modern module resolution.
- [x] Fix resulting type errors and keep `npm run type-check` green.

## Phase 3 - React Upgrade

- [x] Upgrade `react` and `react-dom` to latest stable major.
- [x] Update any React API usage that changed between majors.
- [x] Migrate test tooling away from CRA runner where needed.
- [x] Ensure app bootstrap and strict mode behavior remain stable.
- [ ] Run and fix regression checks for auth, booking, and profile flows.

## Phase 4 - MUI Upgrade

- [x] Upgrade `@mui/material` and `@mui/icons-material` to latest stable major.
- [x] Upgrade `@mui/x-data-grid` to a compatible major (or remove if unused).
- [x] Run MUI codemods where applicable.
- [x] Resolve breaking changes in themes and component props.
- [ ] Verify UI behavior on desktop and mobile.

## Phase 5 - Hardening and Cleanup

- [x] Re-run dependency audit and address remaining critical/high issues.
- [x] Re-run `npm run quality` and address warnings that should be enforced.
- [x] Run build and deployment image checks after all upgrades.
- [x] Update documentation (developer setup, env variables, scripts).
- [x] Prepare final changelog + rollout notes.
