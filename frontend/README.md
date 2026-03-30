# Frontend (Vite + React + TypeScript)

## Available Scripts

In the `frontend` directory, you can run:

- `npm start` or `npm run dev` - Starts the Vite dev server on `http://localhost:3000`.
- `npm run build` - Builds the production bundle into `dist/`.
- `npm run preview` - Serves the built app locally for quick verification.
- `npm run lint` - Runs ESLint checks.
- `npm run type-check` - Runs TypeScript checks.
- `npm run quality` - Runs lint + format check + type-check.

## Environment Variables

Vite-prefixed environment variables are supported:

- `VITE_API_BASE_URL`
- `VITE_API_URL`
- `VITE_VAPID_PUBLIC_KEY`

Legacy `REACT_APP_*` names are still accepted during migration.
