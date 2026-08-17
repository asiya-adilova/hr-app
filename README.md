# HR Employee Management

HR web app for employee registration and personnel management: React + Vite frontend, NestJS API, PostgreSQL.

## Project structure

```
hr-app/
├── compose.yml              # Local PostgreSQL (port 5433)
├── backend/                 # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── seed.ts              # Orchestrator: runs all seed modules
│   │   ├── seed-references.ts   # Lookup tables
│   │   ├── seed-admin.ts        # Admin account
│   │   └── seed-employees.ts    # Demo employees
│   └── src/
│       ├── security/        # Auth: login, register, JWT, roles
│       ├── employees/       # Employee CRUD, filters, table/details
│       ├── educations/
│       ├── work-experiences/
│       ├── relatives/
│       ├── references/      # Genders, cities, departments, etc.
│       ├── prisma/          # Prisma client wrapper
│       └── common/          # Shared DTOs, filters, helpers
└── frontend/                # React + Vite + Tailwind
    └── src/
        ├── app/             # Router, auth guards, providers
        ├── features/
        │   ├── auth/        # Login / register
        │   ├── admin/       # Admin dashboard
        │   ├── employees/   # List, details, create/edit wizard
        │   └── references/  # Reference catalog screens
        ├── components/      # Layout + UI kit
        └── services/        # API client
```

### Backend

NestJS modules:

| Module | Role |
| --- | --- |
| `SecurityModule` | Register, login, refresh tokens, `/security/me` |
| `EmployeesModule` | Employee CRUD, paging, filters (admin) |
| `EducationsModule` | Education records on an employee |
| `WorkExperiencesModule` | Work history |
| `RelativesModule` | Family members |
| `ReferencesModule` | Lookup dictionaries used by forms |

Roles: `ADMIN` (full personnel + references) and `EMPLOYEE` (own profile / registration wizard).

API docs: [http://localhost:3000/api](http://localhost:3000/api) after the backend is running.

### Frontend

- Guest: `/login`, `/register`
- Admin: `/admin`, `/admin/employees`, `/admin/references`
- Employee: `/employees/new` (wizard) or `/employees/:id` (profile)

## Seed data

`npx prisma db seed` (or `npm run prisma:seed`) runs `backend/prisma/seed.ts`, which calls:

1. `seed-references.ts` — genders, citizenships, nationalities, departments, positions, employment types, education levels, marital statuses, driver license categories, countries, cities
2. `seed-admin.ts` — admin account
3. `seed-employees.ts` — 50 demo employees with accounts, education, experience, and relatives

Seeds are idempotent (`skipDuplicates` / `upsert`). Re-running them will not duplicate rows.

## Setup on another computer

### Prerequisites

- Node.js 22+ (or current LTS)
- npm
- Docker Desktop (for PostgreSQL)

### 1. Clone and start the database

```bash
git clone <repo-url> hr-app
cd hr-app
docker compose up -d
```

Postgres listens on **localhost:5433**, database `employee_hr`, user/password `postgres` / `postgres`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:setup
npm run start:dev
```

`db:setup` generates the Prisma client, applies migrations, and seeds reference + admin + employee data.

API: [http://localhost:3000](http://localhost:3000)

### 3. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@hr.local` | `Admin123!` |
| Employee (example) | `seed.employee01@hr.local` | `Employee123!` |

Employee emails are `seed.employee01@hr.local` … `seed.employee50@hr.local`. Override passwords with `ADMIN_PASSWORD` and `EMPLOYEE_SEED_PASSWORD` in `backend/.env` before seeding.

## Useful commands

```bash
# Database only
docker compose up -d
docker compose down

# Backend
cd backend
npm run start:dev
npm run db:setup          # generate + migrate + seed
npm run prisma:seed       # seed only

# Frontend
cd frontend
npm run dev
```
