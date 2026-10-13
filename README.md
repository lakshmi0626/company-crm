# Company CRM

A web-based CRM for sales teams: contacts, companies, a drag-and-drop pipeline, tasks, notes,
email templates, reports, and CSV import/export, with role-based access.

**Stack:** React 18 + Vite, Node.js + Express, PostgreSQL, JWT authentication.

## Features

| Area | What it does |
| --- | --- |
| Authentication | First user becomes admin; admins add everyone else. JWT sessions, bcrypt hashing, login rate limit |
| Roles | `admin` (everything), `manager` (all data, no user changes), `sales_rep` (own leads and tasks only) |
| Companies and contacts | Search, filter, pagination, owner assignment |
| Leads | Value, source, expected close, stage, owner; status syncs automatically with the stage |
| Pipeline | Kanban board, drag a card to change stage (updates instantly, rolls back on error) |
| Tasks | Due dates, priority, assignment, overdue highlighting, mark done |
| Notes | Per-lead timeline |
| Email templates | `{{first_name}}`, `{{company}}`, `{{lead_title}}` placeholders filled from the lead; opens in your email app |
| Dashboard | Pipeline value by stage, lead sources, won value by month, win rate, recent activity |
| Import/export | Contacts, companies, leads as CSV; bulk contact import with duplicate skipping |
| Activity log | Who created, updated, moved or deleted what |

## Quick start (Docker)

```bash
docker compose up --build
# in another terminal, load demo data:
docker compose exec api node db/seed.js
```

Open http://localhost:5173. Demo logins (password `Password@123`): `admin@crm.test`, `manager@crm.test`, `rep@crm.test`.

## Quick start (without Docker)

Requires Node 18+ and PostgreSQL 14+.

```bash
createdb crm
cp backend/.env.example backend/.env     # edit DATABASE_URL and JWT_SECRET
npm run install:all
npm run migrate
npm run seed        # optional demo data
npm run dev:api     # terminal 1 -> http://localhost:5000
npm run dev:web     # terminal 2 -> http://localhost:5173
```

With no seed data, open `/setup` in the browser to create the first admin account.

## Tests

```bash
npm test
```

## Project layout

```
backend/   Express API  (src/modules/<feature>, db/schema.sql, db/seed.js)
frontend/  React app    (src/pages, src/components, src/api)
docs/      API reference, architecture notes, Git workflow
scripts/   git-history.sh (builds a branch-per-feature Git history)
```

See `docs/API.md` for endpoints and `docs/GIT_WORKFLOW.md` for the branching strategy.
