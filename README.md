# Employee Task Management System

A full-stack employee task management assignment built with React, TypeScript, Redux Toolkit, React Router, Node.js, Express, Prisma, MySQL, and JWT authentication.

## Features

- JWT authentication with registration, login, logout, and Remember Me.
- Role-based access for Admin and Employee users.
- Admin dashboard with employee/task totals.
- Employee dashboard with assigned, completed, pending, and overdue task counts.
- Admin employee management with add, edit, delete, search, sort, and server-side pagination.
- Task management with priority/status chips, date validation, file uploads, and role-based visibility.
- Notifications for task assignment, due-tomorrow reminders, and completed tasks.
- Reports for completed tasks, pending tasks, and employee-wise task summaries.
- CSV and Excel export.
- Responsive Material UI frontend.

## Tech Stack

- Frontend: React, TypeScript, Vite, Material UI, MUI X DataGrid, Redux Toolkit, React Router, React Hook Form, Zod, TanStack Query.
- Backend: Node.js, Express, TypeScript, Prisma ORM, MySQL, JWT, Multer, node-cron.
- Database: MySQL.

## Project Structure

```text
employee-task-management/
  backend/          Express API, Prisma schema, services, controllers
  frontend/         React application
  database/         SQL database scripts
  docs/             Architecture diagrams and demo script
```

## Prerequisites

- Node.js 20+
- npm
- MySQL 8+

## Database Setup

Recommended local setup is to create the database, then let Prisma apply migrations:

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS employee_task_management;"
```

Then run the backend setup commands below.

The standalone SQL script required for submission is available at:

```text
database/employee_task_management.sql
```

You can import that script manually instead of running Prisma migrations if your reviewer asks for direct SQL setup.

The Prisma schema is also available at:

```text
backend/prisma/schema.prisma
```

## Backend Setup

```powershell
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Default backend URL:

```text
http://localhost:5000
```

Required environment variables are documented in [backend/.env.example](backend/.env.example).

Seed login credentials:

```text
Admin: admin@example.com / Password123
Employee: anika@example.com / Password123
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://127.0.0.1:5173
```

## API Overview

Auth:

- `POST /api/register`
- `POST /api/login`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Dashboard:

- `GET /api/dashboard`

Employees:

- `GET /api/employees`
- `POST /api/employees`
- `GET /api/employees/:id`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/attachments`

Notifications:

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`

Reports:

- `GET /api/reports?type=completed&format=csv`
- `GET /api/reports?type=pending&format=excel`
- `GET /api/reports?type=employee-wise&format=excel`

## Business Rules

- Password must be at least 8 characters and include uppercase, lowercase, and a number.
- Email must be unique.
- Due date cannot be earlier than start date.
- Completed tasks cannot be edited.
- Employees can only view their own tasks.
- Employees can only update task status.
- Admins can manage employees, all tasks, and reports.
- File upload accepts PDF, JPG, and PNG files up to 5 MB.

## Documentation

- Architecture and flow diagram: [docs/architecture.md](docs/architecture.md)

## Validation

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Backend:

```powershell
cd backend
npm run build
```