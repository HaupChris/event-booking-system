# Frontend (Vite + React + TypeScript)

## Available Scripts

In the `frontend` directory, you can run:

- `npm start` or `npm run dev` - Starts the Vite dev server on `http://localhost:3000`.
- `npm run build` - Builds the production bundle into `dist/`.
- `npm run preview` - Serves the built app locally for quick verification.
- `npm run test` - Runs Vitest test suite once.
- `npm run test:watch` - Runs Vitest in watch mode.
- `npm run lint` - Runs ESLint checks.
- `npm run type-check` - Runs TypeScript checks.
- `npm run quality` - Runs lint + format check + type-check.

## Stack Versions

- React 19
- TypeScript 6
- Material UI 7
- Vite 7

## Environment Variables

Vite-prefixed environment variables are supported:

- `VITE_API_BASE_URL`
- `VITE_API_URL`
- `VITE_VAPID_PUBLIC_KEY`

Legacy `REACT_APP_*` names are still accepted during migration.

## Development Notes

- The Vite dev server runs on `http://localhost:3000`.
- API requests to `/api/*` are proxied to `http://localhost:5001` in development.
