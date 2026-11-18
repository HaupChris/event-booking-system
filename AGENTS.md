# Repository Guidelines

Single source of guidance for humans and coding agents (`CLAUDE.md` imports this file).
Ongoing refactoring work and its order are tracked in `docs/REFACTORING_PLAN.md`.

## Project Overview

Booking and management system for a small, non-commercial music festival.
- `frontend/`: React 19 + TypeScript + MUI 7, built with Vite.
- `server/`: Flask REST API on SQLite, served by gunicorn in Docker.
- Roles: `user` and `artist` (registration flows), `admin` (dashboard). Logins are shared
  role passwords that issue JWTs. Participants reach their profile page via a secret
  `profile_uuid` link (no login).

## Project Structure

- `frontend/src/form/{userArea,artistArea,adminArea}`: registration flows and admin pages.
- `frontend/src/components/core/`: shared UI components (forms, inputs, layouts, display).
- `frontend/src/branding/`: yearly branding packs (e.g. circus, space) that style the
  user/artist flows. The admin area has its own theme in `form/adminArea/theme/`.
- `frontend/src/services/`: API access. New code uses `services/apiClient.ts`.
- `server/src/api/`: Flask blueprints (HTTP only: parse, authorize, call services, respond).
- `server/src/services/`: business logic and database access.
- `server/src/models/`: data types and schema helpers. `server/data/schema.sql`: DB schema.
- `server/src/utils/`: config, logging, rate limiting, helpers.
- `server/src/scripts/`, `server/src/migrations/`: standalone maintenance scripts.
- `deployment/`: VPS setup, host nginx config, backups. CI/CD in `.github/workflows/`.

## Commands

```bash
# Backend (Python 3.12, uv)
cd server && uv venv && source .venv/bin/activate && uv pip install -e ".[dev]"
python main.py                       # dev server on 127.0.0.1:5001
ruff check . && ruff format --check . && lint-imports && pytest
mypy .                               # not blocking yet, see "Lint baseline"

# Frontend (Node 20+)
cd frontend && npm install
npm start                            # Vite dev server on :3000, proxies /api to :5001
npm run quality                      # eslint + prettier check + tsc
npm test                             # vitest

# Repository-wide
python tools/check_file_length.py
pre-commit install                   # once per clone
pre-commit run --all-files
docker-compose -f docker-compose.local.yml up --build
```

## Code Rules (enforced)

| Rule | Limit | Enforced by |
|---|---|---|
| File length | 300 code lines (no blanks/comments) | `tools/check_file_length.py` |
| Cyclomatic complexity | 10 | ruff `C901` |
| Function arguments | 5 | ruff `PLR0913` |
| Statements per function | 50 | ruff `PLR0915` |
| Branches / returns | 12 / 6 | ruff `PLR0912` / `PLR0911` |
| Line length | 100 (formatter) | `ruff format`, Prettier |

- Python formatting: `ruff format` only (no Black). TypeScript: Prettier.
- Do not add global ignores. If a rule must be suppressed, use
  `# noqa: <CODE>  # <reason>` on the line.
- CI (`.github/workflows/ci.yml`) runs these checks on every branch and PR and gates the
  deploy on `main`. Keep it green.

### Lint baseline (must shrink)

Violations that existed when the rules were introduced (2026-11-18) are recorded and may
only be reduced, never extended:
- Ruff: inline `# noqa: ...  # lint-baseline`. When you touch such a line, fix it and
  remove the comment. Never add new `lint-baseline` comments.
- File length: `tools/file_length_allowlist.txt`. Entries may only shrink; remove an
  entry once the file is within the limit.
- import-linter: `ignore_imports` in `server/pyproject.toml`.
- mypy: currently non-blocking; existing errors are to be fixed, then it becomes blocking.

## Architecture Rules

- Backend layers: `api -> services -> models -> utils`. Never import upwards
  (checked by import-linter, see `[tool.importlinter]` in `server/pyproject.toml`).
- Services and models must not import Flask; pass plain values from the API layer.
- HTTP concerns (auth checks, status codes, request parsing) stay in `src/api/`.
- Database access only through the service layer; always use parameterized queries.
  Dynamic identifiers (table/column names) must come from fixed allowlists.
- Schema changes go into `server/data/schema.sql` plus a migration; no new
  `CREATE TABLE`/`ALTER TABLE` inside request handlers or services.
- Frontend: share logic between user and artist flows via the `*FormBase` components;
  theme differences belong in branding packs, not in duplicated components.

## Security Rules

- Never trust client-supplied prices, payment status or other server-owned fields:
  accept only whitelisted request fields and compute prices on the server.
- Check roles on the server for every protected endpoint (JWT `role` claim).
- Escape all user input that ends up in HTML (including emails).
- Do not log personal data (emails, names, full profile UUIDs) or secrets.
- Secrets only via environment variables; `detect-secrets` runs in pre-commit.

## Testing

- Backend: pytest in `server/test/` (`test_*.py`), using the Flask test client and a
  temporary database; mock mail sending.
- Frontend: Vitest + Testing Library (`npm test`).
- Every behavior change and every bug fix comes with a test; security fixes start with a
  failing test that demonstrates the issue.

## Commits & Pull Requests

- Commit style: `type(scope): imperative summary` (e.g. `feat(profile-page): ...`,
  `fix(mail): ...`, `refactor(api): ...`). Keep commits focused and small.
- `main` deploys automatically to production; work on branches and merge via PR.
- PRs include: what changed and why, test evidence, and notes on config, env or
  migration impact.
