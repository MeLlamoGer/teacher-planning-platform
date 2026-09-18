# Teacher Planning Platform

A full-stack prototype for primary-school lesson planning, curriculum alignment and role-based collaboration. The application models a school workflow rather than a generic CRUD demo: teachers create plans against curriculum content, administrators manage classes/users, substitutes receive temporary access, and student-specific support/adaptations can be tracked.

> **Portfolio / privacy note**
> The public version is anonymized. Demo student records are synthetic and no real student data, school credentials or private deployment secrets are included.

## Stack

### Frontend
- React 19 + TypeScript + Vite
- React Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- FullCalendar
- Recharts

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT access/refresh authentication
- Role-based authorization middleware
- Zod request validation
- Multer for controlled PDF/image uploads

## Main capabilities

- Authentication with short-lived access tokens and HTTP-only refresh cookies
- Roles for teachers, administrators, secretaries and substitute teachers
- Academic-year and class management
- Temporary substitute-teacher access windows
- Curriculum spaces, units, competencies and content blocks
- Lesson-plan creation, editing and bulk scheduling across dates
- Calendar-based planning views
- Student lists plus support needs and plan adaptations
- Attachments and comments
- Reporting endpoints and frontend reporting views

## Architecture

```mermaid
flowchart LR
    B[React / Vite] -->|REST + Bearer token| API[Express API]
    B -->|HTTP-only refresh cookie| API
    API --> AUTH[JWT + RBAC middleware]
    API --> ORM[Prisma ORM]
    ORM --> DB[(PostgreSQL)]
    API --> FS[Controlled file storage]
```

The backend keeps authorization checks close to the domain. Teachers are scoped to assigned classes, substitute teachers receive time-bounded class access, while administrative roles can work across classes.

## Data model highlights

The Prisma schema includes relationships for:

- users ↔ classes;
- temporary substitute access;
- curriculum spaces / units / competencies / content;
- lesson plans and selected curriculum items;
- students, support needs and adaptations;
- attachments and comments.

This makes the project useful as an example of domain modeling and authorization, not only frontend work.

## Run locally

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd planificador-backend
cp .env.example .env
# Set DATABASE_URL to:
# postgresql://teacher_planner:teacher_planner@localhost:5432/teacher_planner
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

### 3. Frontend

In another terminal:

```bash
cd planificador-frontend
npm install
npm run dev
```

The Vite development server proxies API requests to `http://localhost:3000`.

## Demo data

Seed files contain curriculum structure and **synthetic** student records. Admin credentials are supplied through environment variables and must not be committed.

## Current status

This is an early-stage prototype, not a finished commercial product. The core backend/domain model is substantially developed; UI and deployment polish are still in progress. Keeping that distinction explicit is intentional: the repository is meant to show the engineering decisions and current state honestly.

## Next improvements

- automated API/unit tests;
- end-to-end authorization tests;
- object storage for production attachments;
- deployment configuration and CI;
- stronger audit history for sensitive school operations;
- additional reporting and UX polish.
