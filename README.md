# HR Employee Management App

## About the project

This is an employee management HR app.

Employees can register, log in, and fill in their own profile:

- personal details
- current position in the organization
- work history
- education
- extra information (driver license, military status, marital status)
- relatives

There is also an admin panel. The admin can see all employees, search them, and filter the list. The admin can also open the reference tables used in the forms (cities, departments, positions, and similar lists).

## Roles

There are two roles: **employee** and **admin**.

Login uses email and password. The app checks the user with a JWT token.

### Employee

- can register and log in
- can create and update only their own profile
- cannot see or change other employees
- can use reference lists in the forms (dropdowns), but cannot open the full admin tables

### Admin

- can log in to the admin panel
- can see all employees
- can search and filter employees
- can read, update, and delete any employee
- can open all reference tables used in the app

## Tech

- Frontend: React (Vite)
- Backend: NestJS
- Database: PostgreSQL
- Auth: JWT (email + password)

## Project structure

```
hr-app/
├── compose.yml          starts local PostgreSQL
├── docs/screenshots/    images for this README
├── backend/             API
└── frontend/            web app
```

### Backend (`backend/`)

```
backend/
├── prisma/
│   ├── schema.prisma          database models
│   ├── migrations/            database changes
│   ├── seed.ts                runs all seed files
│   ├── seed-references.ts     cities, departments, positions, and other lists
│   ├── seed-admin.ts          admin account
│   └── seed-employees.ts      demo employees
└── src/
    ├── security/              login, register, JWT, roles
    ├── employees/             employee data
    ├── educations/            education records
    ├── work-experiences/      work history
    ├── relatives/             relatives
    ├── references/            reference tables
    ├── prisma/                database connection
    └── common/                shared helpers
```

### Frontend (`frontend/`)

```
frontend/src/
├── app/                       routes and access checks
├── features/
│   ├── auth/                  login and register pages
│   ├── admin/                 admin home
│   ├── employees/             employee list, profile, and form
│   └── references/            reference table pages
├── components/                layout and UI
└── services/                  API calls
```

## Screenshots

Login:

![Login](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/login.png)

Registration:

![Registration](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/register.png)

Employee cabinet, step 1 (personal and passport data):

![Employee form contacts](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/employee-form-contacts.png)

Employee cabinet, step 3 (work experience):

![Employee form work experience](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/employee-form-experience.png)

Employee cabinet, profile view:

![Employee profile](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/employee-profile.png)

Employee cabinet, profile view (work, education, relatives):

![Employee profile more](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/employee-profile-more.png)

Admin panel, home:

![Admin home](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/admin-home.png)

Admin panel, employees table with filters:

![Admin employees](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/admin-employees.png)

Admin panel, reference tables:

![Admin references](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/admin-references.png)

Admin panel, cities reference table:

![Admin cities](https://cdn.jsdelivr.net/gh/asiya-adilova/hr-app@main/docs/screenshots/admin-references-cities.png)

## How to run

You need **Git**, **Node.js** (20 or 22 LTS), **npm**, and **Docker Desktop**. Docker is used only for PostgreSQL. The backend and frontend run with Node on your machine.

You will use **three terminals**: one for the database check, one for the backend, one for the frontend. A fourth terminal is optional for Prisma Studio.

### 0. Check the tools

```bash
git --version
node -v
npm -v
docker --version
docker compose version
```

Open **Docker Desktop** and wait until it is running. If Docker is not started, the database command will fail.

### 1. Clone the project

```bash
git clone https://github.com/asiya-adilova/hr-app.git
cd hr-app
```

You should see `backend/`, `frontend/`, and `compose.yml`.

### 2. Start the database

From the project root (`hr-app/`):

```bash
docker compose up -d
```

Check that Postgres is up:

```bash
docker compose ps
```

The container `employee_hr_postgres` should be **running** (and **healthy** after a few seconds).

Postgres is available on host port **5433** (not 5432), so it does not clash with a local Postgres install.

If you prefer not to use Docker, install PostgreSQL yourself, create a database named `employee_hr`, and in `backend/.env` set `DATABASE_URL` to your local connection (usually port **5432**). Then continue from step 3.

### 3. Start the backend

Open a **new terminal**:

```bash
cd hr-app/backend
cp .env.example .env
npm install
npm run db:setup
npm run start:dev
```

What these commands do:

| Command | What it does |
|---|---|
| `cp .env.example .env` | Creates local env vars. For Docker, you can leave the file as is (`DATABASE_URL` already uses port 5433). |
| `npm install` | Installs NestJS, Prisma, JWT, and other backend packages. |
| `npm run db:setup` | Generates the Prisma client, applies migrations (creates tables), and seeds demo data. |
| `npm run start:dev` | Starts the API in watch mode. Leave this terminal running. |

`npm run db:setup` is three steps in one:

1. `prisma generate` — generate the Prisma client from `prisma/schema.prisma`
2. `prisma migrate deploy` — create / update database tables
3. `prisma db seed` — load reference lists, the admin account, and 50 demo employees

API: http://localhost:3000  
API docs (Swagger): http://localhost:3000/api

### 4. Start the frontend

Open a **new terminal**:

```bash
cd hr-app/frontend
cp .env.example .env
npm install
npm run dev
```

What these commands do:

| Command | What it does |
|---|---|
| `cp .env.example .env` | Sets `VITE_API_URL=http://localhost:3000`. You can leave it as is. |
| `npm install` | Installs React, Vite, and other frontend packages. |
| `npm run dev` | Starts the Vite dev server. Leave this terminal running. |

App: http://localhost:5173

### 5. Log in

Open http://localhost:5173 in the browser.

Admin:

- email: `admin@hr.local`
- password: `Admin123!`

Employee (example):

- email: `seed.employee01@hr.local`
- password: `Employee123!`

There are 50 demo employees: `seed.employee01@hr.local` … `seed.employee50@hr.local`. All of them use the same password.

You can also create a new employee from the registration page.

## Seed the database

The first-time command `npm run db:setup` already runs the seed. To run the seed files again later (for example after you wiped the database, or if demo logins are missing), from `backend/`:

```bash
cd hr-app/backend
npm run prisma:seed
```

That script runs `prisma/seed.ts`, which loads:

1. `prisma/seed-references.ts` — cities, departments, positions, and other dropdown lists
2. `prisma/seed-admin.ts` — admin account (`admin@hr.local` / `Admin123!`)
3. `prisma/seed-employees.ts` — 50 demo employees (`seed.employee01@hr.local` … `seed.employee50@hr.local` / `Employee123!`)

Postgres must be running before you seed. `npm run prisma:seed` only loads data; it does not create tables. For a new empty database, use `npm run db:setup` instead.

## Prisma Studio

Prisma Studio is a browser UI for the database (tables, rows, relations). The database and `backend/.env` must already be set up.

Open a **new terminal**:

```bash
cd hr-app/backend
npm run prisma:studio
```

Then open http://localhost:5555.

Use this to inspect seed data (accounts, employees, cities, departments, and so on) without writing SQL.

## Useful commands

Run these from `backend/` unless noted.

| Command | What it does |
|---|---|
| `npm run db:setup` | Generate client + migrate + seed (first-time setup) |
| `npm run prisma:generate` | Generate the Prisma client only |
| `npm run prisma:migrate` | Apply migrations only |
| `npm run prisma:seed` | Reload seed data (admin, employees, reference lists) |
| `npm run prisma:studio` | Open Prisma Studio at http://localhost:5555 |
| `npm run start:dev` | Start the API in watch mode |
| `npm run start:prod` | Start the compiled API (`npm run build` first) |

From `frontend/`:

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview the production build |

From the project root:

| Command | What it does |
|---|---|
| `docker compose up -d` | Start Postgres in the background |
| `docker compose ps` | Show the database container status |
| `docker compose down` | Stop Postgres (keeps the data volume) |
| `docker compose down -v` | Stop Postgres **and delete** the database volume |

## Stop the project

1. In the frontend terminal: `Ctrl+C`
2. In the backend terminal: `Ctrl+C`
3. In the Prisma Studio terminal (if you opened it): `Ctrl+C`
4. From the project root: `docker compose down`

## If something fails

- **Docker daemon error** — open Docker Desktop and wait until it is running, then run `docker compose up -d` again.
- **Prisma cannot connect / `ECONNREFUSED` on 5433** — Postgres is not up, or `DATABASE_URL` in `backend/.env` does not use port 5433. Run `docker compose ps`.
- **Frontend loads but API calls fail** — the backend is not running, or `frontend/.env` does not have `VITE_API_URL=http://localhost:3000`.
- **Demo logins fail** — seed did not run. From `backend/`, with Postgres up: `npm run prisma:seed`.
- **Port already in use** — another app is using 3000, 5173, 5433, or 5555. Stop that app, or close the extra Prisma Studio / Vite process.
