# Event Booking System

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)]()


A full-stack booking and management system for a small, non-commercial music festival. This project features a React frontend with a space-themed UI and a Flask backend with RESTful APIs for handling user registrations, work shift assignments, and material contributions.

## 🚀 Features

- **User Authentication**: Simple password-based authentication with JWT for securing API endpoints
- **Booking System**: Multi-step form with comprehensive validation for festival registration
- **Work Shift Management**: Users can select preferred work shifts to support the event
- **Material Contributions**: System for participants to sign up for bringing needed festival materials
- **Admin Dashboard**: Organizers can view all bookings and manage participants
- **Artist Portal**: Separate flow for artist registration with specific requirements
- **Email Confirmations**: Automated confirmation emails with payment instructions
- **Responsive UI**: Space-themed Material UI design that works on mobile and desktop

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material UI** for component library
- **React Router** for navigation
- **Axios** for API calls
- **JWT** for authentication

### Backend
- **Flask** web framework
- **SQLite** database
- **Flask-JWT-Extended** for authentication
- **Flask-Limiter** for rate limiting
- **Flask-CORS** for cross-origin resource sharing
- **Python 3.11+**
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
│   │   ├── AuthContext.tsx  # Authentication context
│   │   └── App.tsx          # Main application component
│   └── package.json
│
├── server/                  # Flask backend application
│   ├── src/
│   │   ├── api/             # API endpoints
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── data/                # Configuration files
│   ├── Dockerfile           # Docker configuration
│   ├── main.py              # Application entry point
│   └── requirements.txt     # Python dependencies
```

## 🔧 Setup and Installation

### Prerequisites
- Node.js 16+
- Python 3.11+
- Docker (optional)

### Local Development Setup

#### Backend
```bash
# Navigate to server directory
cd server

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

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
```

### Docker Setup
```bash
# Build and run with Docker Compose
docker-compose up --build
```

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

## 🔒 Security Features

- JWT-based authentication
- Password hashing using PBKDF2
- Rate limiting to prevent brute force attacks
- Comprehensive input validation
- CORS configuration
- Environmental variable configuration

## 📝 License

This project is proprietary and is not open for redistribution or use without explicit permission. All rights reserved. The source code is shared on GitHub for demonstration and educational purposes only. For inquiries about using this code in your own projects, please contact the repository owner.

## 🙏 Acknowledgements

- [Material UI](https://mui.com/)
- [Flask](https://flask.palletsprojects.com/)
- [React](https://reactjs.org/)
- All festival contributors and organizers