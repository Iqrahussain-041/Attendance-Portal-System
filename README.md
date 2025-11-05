# Attendance Portal System

A comprehensive attendance management system built with Next.js, React, TypeScript, and Tailwind CSS. This system allows employees to mark their attendance (clock-in/out) and request leaves, while admins can manage employees and view detailed attendance reports.

## Features

### Employee Portal
- **Unique Personal Links**: Each employee has a unique link to access their attendance page
- **Clock In/Out**: Employees can mark their arrival and departure times
- **Attendance History**: View personal attendance records with timestamps
- **Leave Management**: Request leaves (full-day or half-day) with reasons
- **Statistics**: View personal statistics including total present days, leaves, half-days, and late arrivals
- **Real-time Clock**: Live clock display showing current date and time

### Admin Dashboard
- **Employee Management**: Add, view, and delete employees
- **Real-time Status**: See which employees are currently clocked in/out
- **Leave Approval**: Approve or reject leave requests
- **Today's Attendance**: View all attendance records for the current day
- **Monthly Reports**: Generate detailed monthly reports for all employees or individual employees
- **Attendance History**: View complete attendance history for any employee

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Storage**: MongoDB (MongoDB Atlas recommended)
- **Authentication**: Simple password-based authentication

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

## Default Credentials

### Admin Login
- **Password**: `admin123`

### Sample Employees
The system comes with two sample employees:
- **John Doe**: Link: `john-doe`, Password: `password123`
- **Jane Smith**: Link: `jane-smith`, Password: `password123`

## Usage Guide

### For Employees

1. **Access Your Attendance Page**
   - Go to the home page
   - Click on "Employee Portal"
   - Enter your unique link (e.g., `john-doe`)
   - Or directly visit: `/attendance/your-unique-link`

2. **Clock In/Out**
   - Enter your password when prompted
   - Click "Clock In" when you arrive at work
   - Click "Clock Out" when you leave work
   - System automatically tracks late arrivals (after 9:00 AM)

3. **Request Leave**
   - Click "Request Leave" button
   - Select date, type (full-day/half-day), and provide reason
   - Submit the request
   - View request status (pending/approved/rejected)

4. **View Statistics**
   - Check your personal statistics dashboard
   - View attendance history

### For Admins

1. **Login**
   - Go to the home page
   - Click on "Admin Dashboard"
   - Enter password: `admin123`

2. **Add Employee**
   - Click "Add Employee" button
   - Fill in employee details:
     - Name
     - Unique Link (URL-friendly identifier)
     - Email
     - Password
     - Designation (optional)
   - Click "Add Employee"

3. **Manage Employees**
   - View all employees with their current status
   - Click "View Details" to see employee attendance history
   - Click "Delete" to remove an employee

4. **Approve Leaves**
   - View pending leave requests on the dashboard
   - Click "Approve" or "Reject" for each request

5. **View Reports**
   - Click "Monthly Reports" in the navigation
   - Select month and year
   - View comprehensive reports for all employees
   - Reports include:
     - Total present days
     - Total leaves
     - Total half-days
     - Total late arrivals
     - Detailed attendance with clock-in/out times

6. **View Today's Attendance**
   - See all employees' attendance for the current day
   - Identify who's clocked in/out

## Data Storage

All data is stored in MongoDB. The application uses MongoDB collections:
- `employees`: Employee information
- `attendance`: All attendance records
- `leaves`: Leave requests and approvals

### MongoDB Setup

1. **Create a MongoDB Atlas account** (free tier available at https://www.mongodb.com/cloud/atlas)

2. **Create a cluster** and get your connection string

3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance-portal?retryWrites=true&w=majority
     ```

4. **For Vercel deployment:**
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add `MONGODB_URI` with your MongoDB connection string
   - Redeploy your application

## Configuration

### Standard Start Time
The system considers 9:00 AM as the standard start time. Any clock-in after this time is marked as late.

You can modify this in `lib/calculations.ts`:
```typescript
const STANDARD_START_TIME = '09:00:00';
```

### Admin Password
To change the admin password, modify `app/admin/login/page.tsx`:
```typescript
if (password === 'admin123') { // Change this password
```

## Project Structure

```
attendance-portal/
├── app/
│   ├── admin/              # Admin pages
│   ├── attendance/         # Employee attendance pages
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── page.tsx           # Home page
├── data/                  # JSON data files
├── lib/                   # Utility functions and types
├── public/                # Static assets
└── package.json
```

## Building for Production

```bash
npm run build
npm start
```

## Features Overview

- ✅ Employee clock-in/out functionality
- ✅ Unique employee links
- ✅ Leave request system
- ✅ Admin dashboard
- ✅ Monthly reports with statistics
- ✅ Real-time attendance tracking
- ✅ Late arrival detection
- ✅ Responsive design
- ✅ Modern UI with Tailwind CSS

## Notes

- The system now uses MongoDB for data storage (works on Vercel and other serverless platforms)
- Passwords are stored in plain text - implement encryption for production
- Admin authentication uses localStorage - implement proper session management for production
- Make sure to set the `MONGODB_URI` environment variable before deploying

## License

This project is open source and available for use.
