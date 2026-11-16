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

## Live demo

**https://mitisha-sharma.github.io/hostel-complaint-system/**

The hosted site runs in **demo mode**: a small in-browser backend (`src/api/mockServer.js`) stores data in your browser's localStorage, so no server is needed. Log in with the quick-login buttons:

| Role | Email | Password |
|---|---|---|
| Student | `student@hostel.com` | `student123` |
| Admin / Warden | `admin@hostel.com` | `admin123` |
| Maintenance | `staff@hostel.com` | `staff123` |

Demo data resets if you clear site data. Everything you create stays only in your browser.

## Running locally

**Frontend only (demo mode, no database):**
```bash
npm install
npm run dev        # http://localhost:5173
```
If the backend isn't running, the app automatically falls back to demo mode.

**Full stack (Express + MongoDB):**
```bash
# terminal 1: backend on http://localhost:5000
cd backend
npm install
npm start          # uses MONGODB_URI; if no MongoDB is running it starts a temporary in-memory DB with the demo users

# terminal 2: frontend, from the project root
npm install
npm run dev
```
Copy `backend/.env.example` to `backend/.env` and set your own `JWT_SECRET`. To use a real MongoDB, set `MONGODB_URI` and run `node seed.js` once to create the demo users.

## Deployment

Pushing to `main` builds the frontend and publishes it to GitHub Pages through `.github/workflows/deploy.yml`.
One-time setup: **Settings -> Pages -> Build and deployment -> Source: GitHub Actions**.
To point the hosted site at a real backend instead of demo mode, set the repository variable/secret `VITE_API_URL` and pass it to the build step.
