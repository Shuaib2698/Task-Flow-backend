🚀 Collaborative Task Manager - Full Stack Application
📋 Project Overview
A production-ready, real-time collaborative task management application built with modern web technologies. Features user authentication, task CRUD operations, real-time updates via WebSockets, and an intuitive dashboard.

🛠️ Tech Stack
Frontend
Framework: React with TypeScript + Vite

Styling: Tailwind CSS

State Management: React Query (TanStack Query)

Forms: React Hook Form with Zod validation

Real-time: Socket.io Client

Routing: React Router DOM

Charts: Recharts

Icons: Lucide React

Notifications: React Hot Toast

Backend
Runtime: Node.js + Express with TypeScript

Database: PostgreSQL with Prisma ORM

Authentication: JWT with HttpOnly cookies

Validation: Zod for DTO validation

Real-time: Socket.io

Security: Helmet, CORS, bcryptjs

🚀 Live Deployment
Frontend: https://task-manager-frontend.vercel.app

Backend API: https://task-manager-backend.onrender.com

API Health Check: GET https://task-manager-backend.onrender.com/api/health

📁 Project Structure
text
collaborative-task-manager/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
│
└── backend/                  # Node.js backend API
    ├── src/
    │   ├── controllers/     # Request handlers
    │   ├── services/        # Business logic
    │   ├── repositories/    # Data access layer
    │   ├── dtos/           # Data Transfer Objects
    │   ├── middlewares/    # Express middlewares
    │   ├── sockets/        # Socket.io handlers
    │   └── utils/          # Utility functions
    ├── prisma/             # Database schema & migrations
    └── package.json
🎯 Core Features
✅ User Authentication & Authorization
Secure user registration and login

Password hashing with bcrypt

JWT-based session management with HttpOnly cookies

Protected routes and API endpoints

User profile management

✅ Task Management (Full CRUD)
Create, read, update, and delete tasks

Task attributes:

Title (max 100 characters)

Description (multi-line)

Due date and time

Priority: Low, Medium, High, Urgent

Status: To Do, In Progress, Review, Completed

Creator and assignee tracking

Form validation with Zod

✅ Real-Time Collaboration
Live updates when tasks are modified

Instant notifications when tasks are assigned

Real-time status updates visible to all users

Socket.io integration for bidirectional communication

✅ User Dashboard
Personalized dashboard showing:

Tasks assigned to current user

Tasks created by current user

Overdue tasks

Interactive charts and statistics

Filtering by status and priority

Sorting by due date

🏗️ Architecture Design
Backend Architecture
Repository Pattern: Clean separation of data access logic

Service Layer: Business logic encapsulation

Controller Layer: HTTP request handling

DTO Validation: Input validation using Zod schemas

Error Handling: Consistent error responses with proper HTTP codes

Frontend Architecture
Component-based: Reusable, modular components

Custom Hooks: Encapsulated logic for authentication, tasks, and real-time updates

React Query: Efficient server state management with caching

Responsive Design: Mobile-first approach with Tailwind CSS

Database Design
PostgreSQL: Chosen for relational data integrity and ACID compliance

Prisma ORM: Type-safe database access with auto-generated TypeScript types

Relationships: Properly defined relationships between Users, Tasks, Activities, and Notifications

🔧 Setup Instructions
Prerequisites
Node.js 18+ and npm

PostgreSQL 14+

Git

Backend Setup
bash
# Clone the repository
git clone <repository-url>
cd collaborative-task-manager/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
Frontend Setup
bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend API URL

# Start development server
npm run dev
📡 API Documentation
Authentication Endpoints
POST /api/auth/register - Register new user

POST /api/auth/login - Login user

POST /api/auth/logout - Logout user

GET /api/auth/me - Get current user profile

PUT /api/auth/me - Update user profile

Task Endpoints
GET /api/tasks - Get tasks with filtering/sorting

GET /api/tasks/:id - Get single task with activities

POST /api/tasks - Create new task

PUT /api/tasks/:id - Update task

DELETE /api/tasks/:id - Delete task

GET /api/tasks/dashboard - Get dashboard data

GET /api/tasks/users - Get all users for assignment

WebSocket Events
task:created - Emitted when task is created

task:updated - Emitted when task is updated

task:deleted - Emitted when task is deleted

notification:new - Emitted for task assignments

🎮 How to Use the Application
1. Registration
Navigate to the registration page

Enter your email, password, and name

Click "Register" to create your account

You'll be automatically logged in and redirected to the dashboard

2. Login
If already registered, go to the login page

Enter your email and password

Click "Login" to access your account

3. Creating Tasks
Click the "New Task" button on the dashboard

Fill in the task details:

Title: Task name (required, max 100 chars)

Description: Detailed description

Due Date: When the task is due

Priority: Low, Medium, High, or Urgent

Assign To: Select yourself or another team member

Click "Create Task" to save

4. Task Management
View Tasks: See all tasks on the dashboard

Filter: Filter by status or priority

Sort: Sort by due date

Update: Click any task to edit details

Delete: Remove tasks you created

Change Status: Click status badge to cycle through statuses

5. Real-Time Features
Live Updates: When someone updates a task, you'll see it instantly

Notifications: Get notified when tasks are assigned to you

Team Collaboration: See what others are working on in real-time

6. Dashboard Insights
Assigned Tasks: Tasks assigned to you

Created Tasks: Tasks you created

Overdue Tasks: Tasks past their due date

Statistics: Visual charts showing task distribution

7. Profile Management
Click your profile picture/name in the top-right

Select "Profile" from the dropdown

Update your name or avatar

Changes are saved automatically

🧪 Testing
bash
# Run backend tests
cd backend
npm test

# Run specific test suites
npm test -- --testPathPattern=auth
npm test -- --testPathPattern=tasks
Test Coverage
Authentication service (user registration/login)

Task service (CRUD operations and validation)

Real-time event emission

Error handling scenarios

🚀 Deployment
Backend (Render)
Push code to GitHub repository

Create new Web Service on Render

Connect to GitHub repository

Configure environment variables:

DATABASE_URL: PostgreSQL connection string

JWT_SECRET: Secret key for JWT

CORS_ORIGIN: Frontend URL

Set build command: npm install && npm run build

Set start command: npm start

Frontend (Vercel)
Import GitHub repository to Vercel

Configure environment variables:

VITE_API_URL: Backend API URL

VITE_SOCKET_URL: WebSocket URL

Deploy automatically on push

🔐 Security Features
Password hashing with bcrypt

JWT tokens in HttpOnly cookies

CORS configuration

Helmet.js security headers

Input validation with Zod

Rate limiting on authentication endpoints

SQL injection prevention via Prisma

📱 Responsive Design
Mobile-first approach

Responsive grid layouts

Touch-friendly interfaces

Adaptive components for all screen sizes

Dark/light mode ready (optional)

🎨 UI/UX Features
Loading States: Skeleton loaders during data fetching

Error Boundaries: Graceful error handling

Toast Notifications: Non-intrusive feedback

Form Validation: Real-time validation with helpful messages

Accessibility: Semantic HTML and ARIA labels

Animations: Smooth transitions and interactions

🔄 Real-Time Implementation
typescript
// Frontend Socket.io connection
const socket = io(API_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

// Listening for updates
socket.on('task:updated', (task) => {
  queryClient.invalidateQueries(['tasks']);
});

// Backend event emission
io.emit('task:updated', updatedTask);
io.to(`user:${userId}`).emit('notification:new', notification);
📊 Database Schema
Users Table
id: Unique identifier

email: Unique email address

password: Hashed password

name: User's display name

avatar: Profile picture URL

createdAt, updatedAt: Timestamps

Tasks Table
id: Unique identifier

title: Task title (max 100 chars)

description: Task description

dueDate: Due date and time

priority: Enum (Low, Medium, High, Urgent)

status: Enum (To Do, In Progress, Review, Completed)

creatorId: Reference to User who created

assignedToId: Reference to assigned User

createdAt, updatedAt: Timestamps

Activities Table
Audit log for task changes

Tracks who changed what and when

Notifications Table
In-app notifications for task assignments

Read/unread status tracking

🤝 Contributing
Fork the repository

Create a feature branch

Make your changes

Add tests for new functionality

Submit a pull request

📄 License
MIT License - see LICENSE file for details

🙏 Acknowledgments
Icons by Lucide React

Charts by Recharts

Styling with Tailwind CSS

Database ORM by Prisma

Real-time communication with Socket.io

📞 Support
For issues or questions:

Check the GitHub Issues

Review the API documentation above

Contact via project maintainer

✨ Happy Task Managing! Track efficiently, collaborate seamlessly, and stay productive with the Collaborative Task Manager.
