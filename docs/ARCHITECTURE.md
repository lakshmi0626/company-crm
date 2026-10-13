# Architecture

- **Backend** is organised by feature (`src/modules/<feature>`). Simple resources share
  `src/utils/crudFactory.js`, which gives list/get/create/update/delete, search, filters,
  pagination, activity logging and owner-based access for sales reps.
- **Authorization** is enforced on the server: `authorize(...roles)` for route-level rules and
  `scopeByOwner` in the CRUD factory so sales reps can only read or change their own leads and tasks.
- **Lead status** is derived from the pipeline stage (`is_won` / `is_lost`), so the board, the
  lead form and reports always agree. `closed_at` is stamped when a lead closes.
- **Frontend** list screens are configuration over `components/ResourcePage.jsx` (columns, form
  fields, filters). Custom screens: Dashboard, Pipeline, Lead detail, Import/export.
- **Database** schema lives in `backend/db/schema.sql` and is applied idempotently by `npm run migrate`.
