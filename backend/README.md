# Hostel Complaint Management System - Backend Setup

## Installation & Running

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start MongoDB (ensure MongoDB is installed and running)
   - Windows: Run MongoDB Shell or MongoDB Compass
   - Or use: `mongod --version` to verify installation

4. Run the backend:
   ```bash
   npm run dev    # Development mode with auto-reload (nodemon)
   npm start      # Production mode
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Complaints
- `POST /api/complaints/raise` - Raise a complaint (Student)
- `GET /api/complaints` - Get complaints (filtered by role)
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id/assign` - Assign to staff (Admin)
- `PUT /api/complaints/:id/status` - Update complaint status (Staff/Admin)
- `PUT /api/complaints/:id/reject` - Reject complaint (Admin)
- `GET /api/complaints/stats/overview` - Get dashboard stats (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/role/:role` - Get users by role (Admin)
- `GET /api/users/profile/me` - Get current user profile

### Staff
- `GET /api/staff` - Get all maintenance staff (Admin)
- `GET /api/staff/department/:department` - Get staff by department (Admin)

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@hostel.com | student123 |
| Admin | admin@hostel.com | admin123 |
| Maintenance | staff@hostel.com | staff123 |
