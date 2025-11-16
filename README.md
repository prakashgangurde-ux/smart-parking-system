# Smart Parking System

A full-stack web application for managing parking slots, bookings, payments, and gate operations with QR code scanning capabilities.

## Project Structure

```
smart_parking/
├── backend/          # FastAPI backend
├── frontend/         # React + Vite frontend
├── README.md
└── .gitignore
```

## Features

- **User Management**: Registration, login, and profile settings
- **Parking Slots**: Browse and book available parking slots
- **Bookings**: View booking history and manage reservations
- **Payments**: Integrated payment processing
- **Gate Operations**: QR code scanning and gate logs
- **Admin Dashboard**: Manage users, slots, and notifications
- **WebSocket Support**: Real-time updates and notifications
- **PDF Generation**: Receipt generation for bookings

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MySQL
- **Authentication**: JWT-based security
- **Additional**: WebSocket support, PDF generation

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: CSS (custom theme system)
- **Routing**: React Router
- **HTTP Client**: Axios (via `services/api.js`)

## Installation

### Database Setup

1. Log in to MySQL:
  ```bash
  mysql -u root -p
  password
  ```

2. Create the database:
  ```bash

  CREATE DATABASE smart_parking_db;
  ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with necessary environment variables:
   ```
   DATABASE_URL=your_database_url
   SECRET_KEY=your_secret_key
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   # Add other required variables

   ```

5. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with API configuration:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

### Backend
- Run development server: `uvicorn app.main:app --reload`
- Run tests: `pytest`

### Frontend
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint code: `npm run lint`

## API Documentation

Once the backend is running, access the interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Modules

### Backend
- `app/main.py` - Application entry point
- `app/models.py` - Database models
- `app/schemas.py` - Request/response schemas
- `app/api/` - API route handlers
  - `auth.py` - Authentication endpoints
  - `bookings.py` - Booking management
  - `payments.py` - Payment processing
  - `gate.py` - Gate operations
  - `admin.py` - Admin operations
  - `slots.py` - Parking slot management
  - `users.py` - User management

### Frontend
- `src/App.jsx` - Main application component
- `src/router.jsx` - Route configuration
- `src/contexts/AuthContext.jsx` - Authentication state management
- `src/components/` - Reusable components
- `src/pages/` - Page components
- `src/services/api.js` - API client

## Authentication Flow

The application uses JWT-based authentication. Check [backend/app/security.py](backend/app/security.py) for implementation details.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.
