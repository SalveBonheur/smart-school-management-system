# Smart School Transport System - React Frontend

Modern React frontend for the Smart School Transport Management System.

## Features

- **Modern React Architecture**: Built with Vite, React 18, and React Router
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Role-Based Access**: Separate dashboards for Admin, Driver, and Parent roles
- **Component-Based UI**: Reusable components for consistent design
- **Protected Routes**: Secure routing with authentication guards
- **Real-time Data**: API integration with the backend

## Project Structure

```
client/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Loader.jsx
│   │   ├── DashboardCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── Modal.jsx
│   │   ├── Alert.jsx
│   │   ├── SearchBar.jsx
│   │   └── DashboardLayout.jsx
│   ├── context/      # React Context
│   │   └── AuthContext.jsx
│   ├── pages/        # Page components
│   │   ├── LandingPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── DriverRegisterPage.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StudentsPage.jsx
│   │   │   ├── DriversPage.jsx
│   │   │   ├── BusesPage.jsx
│   │   │   ├── RoutesPage.jsx
│   │   │   ├── AttendancePage.jsx
│   │   │   ├── PaymentsPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── driver/
│   │   │   ├── DriverDashboard.jsx
│   │   │   ├── DriverAttendance.jsx
│   │   │   └── DriverProfile.jsx
│   │   └── parent/
│   │       ├── ParentDashboard.jsx
│   │       ├── ParentAttendance.jsx
│   │       └── ParentPayments.jsx
│   ├── services/     # API services
│   │   └── api.js
│   ├── styles/       # Global styles
│   │   └── index.css
│   ├── App.jsx       # Main app with routing
│   └── main.jsx      # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running (on port 3006 or 3002)

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication

The app uses JWT tokens stored in localStorage:
- Token is automatically attached to API requests via axios interceptors
- Protected routes check authentication and role requirements
- Context API manages global auth state

## Routes

### Public Routes
- `/` - Landing page
- `/about` - About page
- `/login` - Login page
- `/register/driver` - Driver registration

### Admin Routes (Requires admin role)
- `/admin/dashboard` - Admin dashboard
- `/admin/students` - Student management
- `/admin/drivers` - Driver management & approvals
- `/admin/buses` - Bus fleet management
- `/admin/routes` - Route management
- `/admin/attendance` - Attendance records
- `/admin/payments` - Payment management
- `/admin/reports` - Reports & exports

### Driver Routes (Requires driver role)
- `/driver/dashboard` - Driver dashboard
- `/driver/attendance` - Mark attendance
- `/driver/profile` - View profile

### Parent Routes (Requires parent role)
- `/parent/dashboard` - Parent dashboard
- `/parent/attendance` - View child's attendance
- `/parent/payments` - View payments

## Backend Integration

The frontend connects to the backend API at `http://localhost:3006/api` (configurable).

All API endpoints are defined in `src/services/api.js`.

## Demo Credentials

- **Admin**: admin@smarttransport.com / admin123

## License

MIT
