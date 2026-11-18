# Event Booking System

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)]()


A full-stack booking and management system that runs the registration and organisation of our small, non-commercial music festival. Every year, participants and artists register through it, and the organising team uses it to manage bookings, payments, work shifts, materials and news.

It consists of a React frontend with yearly festival branding (e.g. circus, space) and a Flask backend with a REST API on SQLite, deployed with Docker on a self-hosted server.

## 🚀 Features

- **User Authentication**: Simple password-based authentication with JWT for securing API endpoints
- **Booking System**: Multi-step form with comprehensive validation for festival registration
- **Work Shift Management**: Users can select preferred work shifts to support the event
- **Material Contributions**: System for participants to sign up for bringing needed festival materials
- **Admin Dashboard**: Organizers can view all bookings and manage participants
- **Artist Portal**: Separate flow for artist registration with specific requirements
- **Email Confirmations**: Automated confirmation emails with payment instructions
- **Responsive UI**: Material UI with switchable festival branding packs, works on mobile and desktop

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript 6
- **Vite 7** for build/dev tooling
- **Material UI 7** for component library
- **React Router** for navigation
- **Axios** for API calls
- **JWT** for authentication
- **Vitest + Testing Library** for frontend tests

### Backend
- **Flask** web framework
- **SQLite** database
- **Flask-JWT-Extended** for authentication
- **Flask-Limiter** for rate limiting
- **Flask-CORS** for cross-origin resource sharing
- **Python 3.12+**
- **Docker** support for containerized deployment

## 📦 Project Structure

```
/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── form/            # Form components
│   │   │   ├── userArea/    # User registration components
│   │   │   ├── adminArea/   # Admin dashboard components
│   │   │   └── artistArea/  # Artist registration components
│   │   ├── contexts/         # React contexts (auth/theme)
│   │   ├── services/         # API and data services
│   │   └── App.tsx          # Main application component
│   └── package.json
│
├── server/                  # Flask backend application
│   ├── src/
│   │   ├── api/             # API endpoints
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── Dockerfile           # Docker configuration
│   ├── main.py              # Application entry point
│   └── pyproject.toml        # Python dependencies and tooling config
```

## 🔧 Setup and Installation

### Prerequisites
- Node.js 20+
- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (`pip install uv`)
- Docker (optional)

### Local Development Setup

#### Backend
```bash
# Navigate to server directory
cd server

# Create .venv with the exact locked dependencies (incl. dev tools)
uv sync --extra dev
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Add or update a dependency: edit pyproject.toml, then `uv lock` and commit uv.lock

# Run the server
python main.py
```

#### Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm start

# Run quality checks
npm run quality

# Run tests
npm run test
```

### Quality Checks

Coding rules, lint baseline and architecture rules are described in [AGENTS.md](AGENTS.md).
CI runs the same checks on every branch and before each deploy.

```bash
# Backend
cd server
source .venv/bin/activate
ruff check . && ruff format --check . && lint-imports && pytest

# Frontend
cd frontend
npm run quality

# Repository-wide
python tools/check_file_length.py
```

### Pre-commit Hooks

```bash
pre-commit install          # once per clone (pre-commit is part of the backend dev deps)
pre-commit run --all-files  # run manually
```

The ESLint and Prettier hooks use `frontend/node_modules`, so run `npm install` first.

### Docker Setup
```bash
# Build and run locally with Docker Compose
docker-compose -f docker-compose.local.yml up --build
```

Production deployment (GitHub Actions → VPS) is described in [deployment/README.md](deployment/README.md).

## 📋 API Documentation

The backend provides a RESTful API with the following main endpoints:

- **Authentication**
  - POST `/api/auth`: User login
  - POST `/api/auth/admin`: Admin login
  - POST `/api/auth/artist`: Artist login

- **Bookings**
  - GET `/api/formcontent`: Get form configuration
  - POST `/api/submitForm`: Submit user booking
  - GET `/api/data`: Get all bookings (admin only)
  - PUT `/api/booking/:id`: Update booking (admin only)
  - PUT `/api/booking/:id/payment`: Update payment status (admin only)

- **Artists**
  - GET `/api/artist/formcontent`: Get artist form configuration
  - POST `/api/artist/submitForm`: Submit artist booking
  - GET `/api/artist/data`: Get all artist bookings (admin only)

- **Admin Management**
  - GET `/api/admin/news`: List news items
  - GET `/api/admin/faqs`: List FAQs
  - GET `/api/admin/profiles/stats`: Profile management statistics

- **Profile Portal**
  - GET `/api/profile/<profile_uuid>`: Load profile details
  - GET `/api/profile/<profile_uuid>/news`: Profile-specific news feed
  - GET `/api/profile/<profile_uuid>/shifts`: Profile shift assignments

## 🔒 Security Features

- JWT-based authentication
- Password hashing using PBKDF2
- Rate limiting to prevent brute force attacks
- Comprehensive input validation
- CORS configuration
- Environmental variable configuration

## 📝 License

This project is proprietary. All rights reserved. The source code is publicly visible, but it may not be used, copied or redistributed without explicit permission. For inquiries, please contact the repository owner.

## 🙏 Acknowledgements

- [Material UI](https://mui.com/)
- [Flask](https://flask.palletsprojects.com/)
- [React](https://reactjs.org/)
- All festival contributors and organizers
