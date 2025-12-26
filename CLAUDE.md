# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Prerequisites
- **Python**: 3.12+ required
- **Node.js**: 18+ recommended
- **uv**: Fast Python package installer (install: `pip install uv`)

### Frontend (React/TypeScript)
```bash
cd frontend
npm install              # Install dependencies
npm start                # Start development server on port 3000
npm run build            # Build for production
npm test                 # Run tests

# Code Quality
npm run lint             # Run ESLint (no auto-fix)
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without changes
npm run type-check       # Run TypeScript type checking
npm run quality          # Run all quality checks (lint + format + types)
```

### Backend (Flask/Python)
```bash
cd server

# Using uv (recommended - faster than pip)
uv venv                           # Create virtual environment
source .venv/bin/activate         # Activate venv (Linux/Mac)
# or: .venv\Scripts\activate      # Activate venv (Windows)
uv pip install -e ".[dev]"        # Install all dependencies + dev tools

# OR using traditional pip (legacy)
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run server
python main.py                    # Start Flask server on port 5001

# Code Quality
ruff check .                      # Run linter
ruff check . --fix                # Run linter with auto-fix
black .                           # Format code
mypy .                            # Run type checking
pytest                            # Run tests with coverage
```

### Pre-commit Hooks (Recommended)
```bash
# Install pre-commit (once per machine)
pip install pre-commit  # or: uv pip install pre-commit

# Install hooks (once per repo)
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

### Testing
```bash
# Backend tests with coverage
cd server && pytest

# Frontend tests
cd frontend && npm test
```

### Docker Deployment
```bash
docker-compose up --build    # Build and run both services
```

## Architecture Overview

This is a full-stack event booking system with a React frontend and Flask backend, designed for a small music festival.

### Core Architecture Pattern
- **Frontend**: React SPA with Material-UI components, organized around multi-step forms
- **Backend**: Flask REST API with SQLite database, organized in services pattern
- **Authentication**: JWT-based authentication with role-based access (user/admin/artist)
- **Data Flow**: Frontend → Flask API → SQLite database

### Key Directories Structure

**Frontend (`/frontend/src/`)**:
- `form/userArea/` - User registration flow (multi-step form)
- `form/adminArea/` - Admin dashboard and management interface  
- `form/artistArea/` - Artist-specific registration flow
- `components/core/` - Reusable UI components organized by function
- `contexts/` - React contexts (Auth, Theme)
- `hooks/` - Custom React hooks

**Backend (`/server/src/`)**:
- `api/` - Flask blueprints for REST endpoints
- `models/` - Data models and database schema
- `services/` - Business logic layer
- `utils/` - Configuration, logging, utilities

### Multi-Step Form Architecture
The frontend uses a sophisticated form management system:
- Each user type (user/artist) has its own registration container
- Forms are broken into logical steps (personal details, tickets, food, work shifts, etc.)
- State management via custom `useFormManagement` hook
- Form content dynamically loaded from backend via `/api/formcontent` endpoint

### Database Design
- SQLite database with well-defined schema in `server/data/schema.sql`
- Main entities: Bookings, WorkShifts, TimeSlots, Materials, Tickets
- Signature storage as base64 encoded images
- Comprehensive relationships between users and their selections

### Authentication & Security
- JWT tokens for API authentication
- Role-based access: user, admin, artist
- Rate limiting via Flask-Limiter
- Input validation and CORS configuration
- Password-based authentication (no user registration - controlled access)

### Key Features
- **Multi-step booking process** with validation at each step
- **Work shift assignment system** with preferred time slot selection
- **Material contribution tracking** for festival logistics
- **Signature capture** for legal agreements
- **Payment tracking** and confirmation emails
- **Admin dashboard** with comprehensive booking management
- **CSV export** functionality for organizers
- **Responsive space-themed UI** with dark/light mode

## Important Implementation Notes

### Frontend Form Management
- All forms extend base form components in `components/core/forms/`
- Use existing form validation patterns and Material-UI components
- Follow the established step navigation pattern for multi-step forms
- Maintain consistency with space theme styling in `components/styles/`

### Backend API Patterns
- All endpoints use Flask blueprints registered in `main.py`
- Follow established logging patterns with request/response logging
- Use the existing service layer pattern for business logic
- Maintain database transactions properly in service methods
- JWT authentication required for most endpoints

### Database Operations
- Use the established service pattern for database interactions
- Always handle database connections properly (close after use)
- Follow the existing schema patterns when adding new tables
- Use parameterized queries to prevent SQL injection

### Testing Approach
- Backend tests in `/test/test_api.py` use requests library for integration testing
- Frontend tests use React Testing Library
- Mock external dependencies appropriately
- Test authentication flows and form validation

## Code Quality Standards

### Enforced Rules
- **Max file length**: 300 lines (excluding blank lines and comments)
- **Max function length**: 50-80 lines
- **Max complexity**: 10 (cyclomatic complexity)
- **Max function parameters**: 4
- **Max nesting depth**: 4

### Python (Ruff + Black + mypy)
- **Linting**: Ruff (replaces Flake8, isort, pyupgrade)
- **Formatting**: Black (100 char line length)
- **Type checking**: mypy (basic mode)
- **Config**: `server/pyproject.toml`

### TypeScript (ESLint + Prettier)
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier (100 char line length)
- **Type checking**: TypeScript strict mode
- **Config**: `frontend/.eslintrc.json`, `frontend/.prettierrc`

### VS Code Integration
- Auto-format on save enabled for all languages
- Recommended extensions in `.vscode/extensions.json`
- Install: Open Command Palette → "Extensions: Show Recommended Extensions"

## Configuration
- Backend configuration via environment variables (see `utils/config.py`)
- Frontend proxy configured to backend on port 5001 in `package.json`
- Database and file storage paths configurable via environment
- Docker configuration supports both development and production modes
- Linting configuration: `pyproject.toml` (Python), `.eslintrc.json` (TypeScript)