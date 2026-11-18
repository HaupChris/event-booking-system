# Development Environment Setup

This guide walks you through setting up the complete development environment with all code quality tools.

## Quick Start

### 1. Install Prerequisites

**Python 3.12+**
```bash
python --version  # Should be 3.12 or higher
```

**uv (Fast Python package manager)**
```bash
pip install uv
```

**Node.js 18+**
```bash
node --version  # Should be 18 or higher
```

### 2. Backend Setup

```bash
cd server

# Create virtual environment with uv
uv venv

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# or: .venv\Scripts\activate  # Windows

# Install all dependencies (including dev tools: ruff, black, mypy)
uv pip install -e ".[dev]"

# Verify installation
ruff --version
black --version
mypy --version
```

### 3. Frontend Setup

```bash
cd frontend

# Install all dependencies (including ESLint, Prettier)
npm install

# Verify installation
npx eslint --version
npx prettier --version
```

### 4. Pre-commit Hooks (Recommended)

```bash
# Install pre-commit (globally or in venv)
pip install pre-commit

# Install git hooks
pre-commit install

# Test it works
pre-commit run --all-files
```

## Daily Development Workflow

### Before Committing Code

**Option 1: Pre-commit hooks (automatic)**
- Just commit normally - hooks run automatically
- Hooks will auto-fix most issues

**Option 2: Manual checks**

```bash
# Python
cd server
ruff check . --fix     # Lint and auto-fix
black .                # Format code
mypy .                 # Type check
pytest                 # Run tests

# TypeScript
cd frontend
npm run lint:fix       # Lint and auto-fix
npm run format         # Format code
npm run type-check     # Type check
npm test               # Run tests
```

### Running Quality Checks

**All-in-one commands:**

```bash
# Frontend: Run all quality checks
cd frontend && npm run quality

# Backend: Run all checks
cd server
ruff check . && black --check . && mypy . && pytest
```

## Troubleshooting

### "Command not found: ruff"

Make sure you're in the virtual environment:
```bash
cd server
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
which ruff  # Should show path in .venv/
```

### "ESLint: No ESLint configuration found"

Make sure you're in the frontend directory and `.eslintrc.json` exists:
```bash
cd frontend
ls -la .eslintrc.json
```

### Pre-commit hooks not running

```bash
# Reinstall hooks
pre-commit uninstall
pre-commit install

# Test manually
pre-commit run --all-files
```

### VS Code not auto-formatting

1. Check you have the extensions installed
2. Open Settings (`Ctrl+,`)
3. Search "format on save"
4. Ensure it's checked
5. Check "Default Formatter" is set correctly:
   - Python: Ruff
   - TypeScript: Prettier

## Files Over 300 Lines

The following files currently exceed the 300-line limit and should be refactored:

**Python:**
- `server/src/services/mail_service.py` (765 lines)
- `server/src/services/profile_service.py` (630 lines)
- `server/src/services/booking_service.py` (565 lines)
- `server/src/services/formcontent_service.py` (555 lines)
- `server/src/services/artist_service.py` (470 lines)

**TypeScript:**
- `frontend/src/form/adminArea/FinancialsOverviewPage.tsx` (498 lines)
- `frontend/src/form/userArea/SummaryForm.tsx` (482 lines)
- `frontend/src/form/constants/texts.ts` (326 lines)

These files are currently exempt from the max-lines rule but should be refactored when possible.

## Code Quality Metrics

Our configuration enforces:

| Metric | Python | TypeScript |
|--------|--------|------------|
| Max file lines | 300 | 300 |
| Max function lines | 50 | 80 |
| Max complexity | 10 | 10 |
| Max parameters | 6 | 4 |
| Max nesting depth | - | 4 |

## Additional Resources

- **Ruff**: https://docs.astral.sh/ruff/
- **Black**: https://black.readthedocs.io/
- **mypy**: https://mypy.readthedocs.io/
- **ESLint**: https://eslint.org/docs/
- **Prettier**: https://prettier.io/docs/
- **uv**: https://github.com/astral-sh/uv

## Migration from pip to uv

If you have an existing `venv` created with pip:

```bash
# Remove old venv
cd server
rm -rf venv

# Create new venv with uv
uv venv
source .venv/bin/activate

# Install dependencies
uv pip install -e ".[dev]"
```

**Benefits of uv:**
- 10-100x faster than pip
- Better dependency resolution
- Improved caching
- Drop-in replacement for pip
