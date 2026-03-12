# Hostel Complaint Management System - Complete Setup Guide

## Project Structure

```
hostel-complaint-system/
├── frontend/                       (React + Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js             (NEW - Backend API client)
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── ...
│   └── package.json
│
├── backend/                        (Node.js + Express) - NEW
│   ├── models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── complaintController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   ├── users.js
│   │   └── staff.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   ├── .env
│   └── README.md
│
├── BACKEND_SETUP_SUMMARY.txt       (NEW - Detailed summary)
└── COMPLETE_SETUP_GUIDE.md         (THIS FILE)
```

## Prerequisites

- Node.js (v16+) - [Download](https://nodejs.org/)
- MongoDB (v5+) - [Download](https://www.mongodb.com/try/download/community)
- Git (optional)

## Installation Steps

### Step 1: Install MongoDB

**Windows:**
1. Download MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the wizard
3. Accept the default installation path: `C:\Program Files\MongoDB\Server\[version]`
4. Check "Install MongoDB as a Service"
5. Install MongoDB Compass (GUI for database management)

**Verify Installation:**
```powershell
mongod --version
```

### Step 2: Pull Latest Changes

```bash
cd hostel-complaint-system
```

### Step 3: Install Frontend Dependencies

```bash
npm install
```

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 5: Seed Database with Test Data

```bash
cd backend
node seed.js
```

Expected output:
```
MongoDB connected for seeding
Cleared existing users
Users created: 5
Seeding completed successfully
```

## Running the Application

### Terminal 1 - Start Backend (Port 5000)

```bash
cd backend
npm run dev
```

Expected output:
```
Server is running on port 5000
MongoDB connected
```

### Terminal 2 - Start Frontend (Port 5173)

```bash
npm run dev
```

Expected output:
```
  VITE v7.3.0  ready in 123 ms
  ➜  Local:   http://localhost:5173/
```

## Access the Application

Open browser and go to: **http://localhost:5173**

## Test Credentials

Login with any of these accounts:

| Role | Email | Password |
|------|-------|----------|
| Student | student@hostel.com | student123 |
| Admin | admin@hostel.com | admin123 |
| Maintenance | staff@hostel.com | staff123 |
| Maintenance (Plumbing) | mahesh@hostel.com | staff123 |
| Maintenance (Carpentry) | ravi@hostel.com | staff123 |

## Testing Workflow

### Test 1: Student Raises Complaint
1. Login as: **student@hostel.com / student123**
2. Click "Raise Complaint"
3. Fill form:
   - Category: Electrical
   - Priority: High
   - Description: "Fan in room is broken"
4. Submit and verify in dashboard

### Test 2: Admin Reviews and Assigns
1. Open new tab/window
2. Login as: **admin@hostel.com / admin123**
3. Go to Admin Dashboard
4. Find the complaint raised by student
5. Click Assign
6. Select staff member (Suresh Kumar - Electrical department)
7. Verify status changes to "Assigned"

### Test 3: Maintenance Staff Updates
1. Open another tab/window
2. Login as: **staff@hostel.com / staff123**
3. View assigned complaints
4. Click on the complaint
5. Update status to "In Progress"
6. Then to "Resolved" with notes
7. Verify resolution date is recorded

### Test 4: Student Tracks Status
1. Go back to student tab
2. Click on the complaint in dashboard
3. Verify real-time status updates

## API Endpoints (Backend)

### Health Check
```
GET http://localhost:5000/api/health
```

### Authentication
```
POST http://localhost:5000/api/auth/login
POST http://localhost:5000/api/auth/register
```

### Complaints
```
POST   http://localhost:5000/api/complaints/raise
GET    http://localhost:5000/api/complaints
GET    http://localhost:5000/api/complaints/:id
PUT    http://localhost:5000/api/complaints/:id/assign
PUT    http://localhost:5000/api/complaints/:id/status
PUT    http://localhost:5000/api/complaints/:id/reject
GET    http://localhost:5000/api/complaints/stats/overview
```

### Users
```
GET    http://localhost:5000/api/users
GET    http://localhost:5000/api/users/role/:role
GET    http://localhost:5000/api/users/profile/me
```

### Staff
```
GET    http://localhost:5000/api/staff
GET    http://localhost:5000/api/staff/department/:department
```

## Testing with Postman or cURL

### Example: Login API Call

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:5000/api/auth/login`
3. Body (JSON):
```json
{
  "email": "student@hostel.com",
  "password": "student123"
}
```

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@hostel.com\",\"password\":\"student123\"}"
```

## Troubleshooting

### Issue: Port 5000 already in use
**Solution:** Kill the process or use different port
```powershell
Stop-Process -Port 5000 -Force
# OR change PORT in backend/.env
```

### Issue: MongoDB connection failed
**Solution:** Start MongoDB service
```powershell
# Windows
net start MongoDB

# Or open MongoDB Atlas if using cloud
```

### Issue: Cannot connect backend to frontend
**Check:**
1. Backend is running on http://localhost:5000
2. Frontend is running on http://localhost:5173
3. CORS is enabled in backend (already configured)
4. Token is stored in localStorage after login

### Issue: npm install fails
**Solution:**
```bash
cd backend
rm -r node_modules
rm package-lock.json
npm install
```

### Issue: "Cannot find module" errors
**Solution:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install
```

## Database Management

### View Data with MongoDB Compass

1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"
4. Select `hostel-complaints` database
5. Browse `users` and `complaints` collections

### Clear Database

```bash
cd backend
# Edit seed.js and uncomment the clear function
node seed.js
```

## Development Commands

```bash
# Frontend
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run ESLint

# Backend
npm run dev     # Start with nodemon (auto-reload)
npm start       # Start in production mode
node seed.js    # Seed database
```

## Production Deployment

For deploying to production:

1. **Frontend:** Build and deploy to Vercel, Netlify, or GitHub Pages
2. **Backend:** Deploy to Heroku, Railway, or AWS
3. **Database:** Use MongoDB Atlas instead of local MongoDB
4. **Environment Variables:** Update `.env` with production URLs

See individual project README files for deployment instructions.

## File References

- **Frontend API Client:** [src/api/api.js](src/api/api.js)
- **Backend Setup:** [backend/README.md](backend/README.md)
- **Detailed Summary:** [BACKEND_SETUP_SUMMARY.txt](BACKEND_SETUP_SUMMARY.txt)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the detailed summary file
3. Check MongoDB and Node.js documentation
4. Ensure all ports are available and correct

---

**Last Updated:** March 11, 2026
**Status:** Ready for Development ✓
