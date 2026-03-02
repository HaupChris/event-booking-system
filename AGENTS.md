# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: React 18 + TypeScript app (main code in `frontend/src`).
- `frontend/src/form/userArea`, `frontend/src/form/adminArea`, `frontend/src/form/artistArea`: feature flows for user, admin, and artist experiences.
- `server/`: Flask backend (entrypoint `server/main.py`, app code in `server/src`).
- `server/src/api`: route blueprints, `server/src/services`: business logic, `server/src/models`: schema/types, `server/src/utils`: config/logging/helpers.
- `test/`: integration-style Python API tests (`test/test_api.py`).
- Root files (`docker-compose.yml`, `docker-compose.local.yml`) define local/container orchestration.

## Build, Test, and Development Commands
- Backend setup:
  - `cd server && uv venv && source .venv/bin/activate && uv pip install -e ".[dev]"`
- Run backend locally:
  - `cd server && source .venv/bin/activate && python main.py` (binds to `127.0.0.1:5001`).
- Frontend setup/run:
  - `cd frontend && npm install`
  - `cd frontend && npm start` (CRA dev server on `:3000`).
- Quality checks:
  - `cd server && ruff check . && black --check . && mypy . && pytest`
  - `cd frontend && npm run quality`
- Full stack in Docker:
  - `docker-compose up --build`

## Coding Style & Naming Conventions
- Python: Black + Ruff, 100-char lines, type hints where practical.
- TypeScript/React: ESLint + Prettier (`tabWidth: 2`, `singleQuote: true`, semicolons enabled).
- Naming:
  - Python modules/functions: `snake_case`.
  - React components/types: `PascalCase` (for example `ProfileOverview.tsx`).
  - Hooks: `useXxx` (for example `useProfile.ts`).

## Testing Guidelines
- Backend tests use `pytest`; file pattern is `test_*.py`.
- Frontend tests use React Testing Library/Jest via `npm test`.
- Add or update tests with every behavior change; prefer API/service-level coverage for backend logic and component-level tests for UI behavior.

## Commit & Pull Request Guidelines
- Match existing commit style: `type(scope): imperative summary`.
- Common types in history: `feat`, `refactor` (for example `feat(profile-page): add profile_uuid to server endpoints`).
- Keep commits focused and small.
- PRs should include:
  - What changed and why.
  - Linked issue/task (if available).
  - Test evidence (`pytest`, `npm run quality`, screenshots for UI changes).
  - Notes on config/env or migration impacts.
