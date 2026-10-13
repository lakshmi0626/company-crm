# API reference

Base URL: `/api`. All routes except `/auth/*` and `/health` need `Authorization: Bearer <token>`.
List endpoints accept `?q=` (search), `?page=`, `?limit=` (max 200) and resource-specific filters,
and return `{ data, page, limit, total, pages }`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | Liveness check |
| GET | `/auth/setup-status` | `{ needsSetup }` |
| POST | `/auth/register` | Only works while no users exist; creates the admin |
| POST | `/auth/login` | `{ email, password }` returns `{ token, user }` |
| GET | `/auth/me` | Current user |
| PUT | `/auth/password` | `{ currentPassword, newPassword }` |
| GET | `/users/options` | id, name, role for dropdowns (all roles) |
| CRUD | `/users` | List: admin/manager. Write: admin |
| CRUD | `/companies` | Filter: `industry` |
| CRUD | `/contacts` | Filter: `company_id` |
| CRUD | `/leads` | Filters: `stage_id`, `status`, `source`, `owner_id`. Reps see their own |
| PATCH | `/leads/:id/stage` | `{ stage_id }` moves a lead and syncs status |
| GET | `/pipeline/stages`, `/pipeline/board` | Board returns stages with leads |
| POST/PUT/DELETE | `/pipeline/stages`, `/pipeline/stages/reorder`, `/pipeline/stages/:id` | admin/manager |
| CRUD | `/tasks` | Filters: `status`, `priority`, `assigned_to`, `lead_id` |
| PATCH | `/tasks/:id/complete` | `{ done: true|false }` |
| GET/POST/DELETE | `/notes` | Query/body: `lead_id`, `contact_id` or `company_id` |
| CRUD | `/templates` | |
| POST | `/templates/:id/render` | `{ lead_id?, contact_id? }` returns `{ subject, body, to }` |
| GET | `/reports/dashboard` | Totals, by stage, by source, monthly won, recent activity |
| GET | `/io/export/:entity` | `contacts`, `companies`, `leads` as CSV (admin/manager) |
| POST | `/io/import/contacts` | `{ csv }` returns `{ imported, skipped, errors }` |
| GET | `/activities` | Filters: `entity`, `entity_id`, `limit` |
