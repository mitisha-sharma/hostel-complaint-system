# Smart Hostel Complaint Management System

A web-based hostel complaint management system built using **React + Vite**. The platform allows students to raise complaints, administrators to manage and assign them, and maintenance staff to resolve them efficiently in one centralized system.

The application also includes an **AI chatbot powered by Claude AI** to assist users with complaints, queries, and system navigation.

---

## Features

### Student Portal
- Raise complaints with category, priority, and description  
- Detects similar complaints before submission to reduce duplicates  
- Track complaint status with updates from maintenance staff  

### Admin / Warden Portal
- Dashboard to view and manage all complaints  
- Assign complaints to maintenance staff or reject them  
- Analytics section showing resolution rates, complaint categories, and staff performance  

### Maintenance Staff Portal
- View assigned complaints  
- Update complaint status (Assigned → In Progress → Resolved)  
- Add resolution notes when completing a complaint  

### AI Chatbot
- Available across the platform  
- Helps students describe issues and draft complaints  
- Helps admins analyze complaint trends and workloads  
- Helps maintenance staff track tasks and priorities  

---

## Tech Stack

- **React 18**
- **Vite**
- **React Router DOM**
- **Claude AI API**

---

## Test Credentials

| Role | Email | Password |
|-----|-----|-----|
| Student | student@hostel.com | student123 |
| Admin | admin@hostel.com | admin123 |
| Maintenance Staff | staff@hostel.com | staff123 |

---

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/hostel-complaint-system.git
cd hostel-complaint-system
npm install
npm run dev

---

## Running locally

```bash
# 1) Backend (http://localhost:5000)
cd backend
npm install
npm start        # uses MongoDB at MONGODB_URI; if none is running it falls back to an in-memory DB with demo users

# 2) Frontend (http://localhost:5173) - in a second terminal, from the project root
npm install
npm run dev
```

Demo logins: `student@hostel.com / student123`, `admin@hostel.com / admin123`, `staff@hostel.com / staff123`.
Copy `backend/.env.example` to `backend/.env` and set your own `JWT_SECRET` (`.env` is no longer tracked by git).
To use a real MongoDB: set `MONGODB_URI`, then run `node seed.js` once to create the demo users.
