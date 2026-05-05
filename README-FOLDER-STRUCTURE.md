# Smart School Transport System - Folder Structure

## 📁 Project Structure

```
smart-school-transport-system/
├── 📂 backend/                    # Backend API Server
│   ├── 📄 server.js              # Main server file
│   ├── 📄 package.json           # Backend dependencies
│   ├── 📂 config/                # Database configuration
│   ├── 📂 database/              # Database files and migrations
│   ├── 📂 middleware/            # Express middleware
│   ├── 📂 routes/                # API routes
│   ├── 📂 logs/                  # Log files
│   └── 📂 test/                  # Test files
│
├── 📂 frontend/                  # Frontend Static Files
│   ├── 📄 package.json           # Frontend dependencies
│   └── 📂 public/                # Static web files
│       ├── 📄 landing.html       # Landing page
│       ├── 📄 admin-login.html   # Admin login
│       ├── 📄 admin-dashboard.html # Admin dashboard
│       ├── 📄 driver-login.html  # Driver login
│       ├── 📄 driver-register.html # Driver registration
│       ├── 📄 driver-dashboard.html # Driver dashboard
│       ├── 📂 css/               # Stylesheets
│       ├── 📂 js/                # JavaScript files
│       └── 📂 images/            # Images and assets
│
├── 📄 package.json               # Main project configuration
├── 📄 .env.example              # Environment variables template
├── 📄 README.md                 # Main documentation
└── 📄 README-FOLDER-STRUCTURE.md # This file
```

## 🚀 Getting Started

### Installation
```bash
# Install all dependencies (main, backend, frontend)
npm run install:all

# Or install separately:
npm install                    # Main dependencies
cd backend && npm install      # Backend dependencies
cd ../frontend && npm install  # Frontend dependencies
```

### Development
```bash
# Start backend server (API + Static files)
npm run dev

# Start frontend only (for separate development)
npm run dev:frontend

# Production
npm start
```

## 📋 Features

### Backend (Port 5000)
- ✅ RESTful API
- ✅ SQLite Database
- ✅ JWT Authentication
- ✅ Rate Limiting
- ✅ Security Headers
- ✅ File Upload
- ✅ Logging

### Frontend (Static Files)
- ✅ Modern Black/Orange UI
- ✅ Responsive Design
- ✅ Admin Dashboard
- ✅ Driver Dashboard
- ✅ Registration & Login
- ✅ Real-time Updates

## 🔧 Configuration

### Backend Environment Variables
Copy `.env.example` to `backend/.env` and update:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
```

### Frontend Development
Frontend is served as static files from the backend. For development:
```bash
cd frontend
npm run dev  # Runs on port 3000
```

## 🏗️ Architecture

- **Monolithic Structure**: Single backend serving API and static files
- **Frontend**: Static HTML/CSS/JS (no build process required)
- **Database**: SQLite for simplicity
- **Authentication**: JWT tokens
- **Security**: Express middleware stack

## 📦 Deployment

### Production Setup
1. Set environment variables
2. Install dependencies: `npm run install:all`
3. Start server: `npm start`
4. Access at: `http://localhost:5000`

### Hosting Options
- **VPS**: DigitalOcean, Vultr, Linode
- **PaaS**: Heroku, Render, Railway
- **Cloud**: AWS EC2, Google Cloud

## 🎨 UI Theme

- **Primary**: Black (#000000)
- **Secondary**: Orange (#FF6B35)
- **Accent**: Warm Orange (#F7931E)
- **Background**: Dark gradient
- **Text**: White & Gray
