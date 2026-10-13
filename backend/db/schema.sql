CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'sales_rep'
                CHECK (role IN ('admin', 'manager', 'sales_rep')),
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  industry   VARCHAR(100),
  website    VARCHAR(200),
  phone      VARCHAR(30),
  address    TEXT,
  size       VARCHAR(30),
  owner_id   INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name  VARCHAR(80),
  email      VARCHAR(150),
  phone      VARCHAR(30),
  job_title  VARCHAR(100),
  company_id INT REFERENCES companies(id) ON DELETE SET NULL,
  owner_id   INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(60) NOT NULL,
  position    INT NOT NULL,
  probability INT NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  is_won      BOOLEAN NOT NULL DEFAULT FALSE,
  is_lost     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS leads (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(200) NOT NULL,
  value          NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status         VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  stage_id       INT NOT NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
  contact_id     INT REFERENCES contacts(id) ON DELETE SET NULL,
  company_id     INT REFERENCES companies(id) ON DELETE SET NULL,
  owner_id       INT REFERENCES users(id) ON DELETE SET NULL,
  source         VARCHAR(50),
  expected_close DATE,
  description    TEXT,
  closed_at      TIMESTAMP,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  due_date    DATE,
  status      VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  priority    VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  lead_id     INT REFERENCES leads(id) ON DELETE CASCADE,
  contact_id  INT REFERENCES contacts(id) ON DELETE SET NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id         SERIAL PRIMARY KEY,
  body       TEXT NOT NULL,
  lead_id    INT REFERENCES leads(id) ON DELETE CASCADE,
  contact_id INT REFERENCES contacts(id) ON DELETE CASCADE,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  author_id  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  subject    VARCHAR(200) NOT NULL,
  body       TEXT NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE SET NULL,
  entity     VARCHAR(30) NOT NULL,
  entity_id  INT,
  action     VARCHAR(30) NOT NULL,
  details    JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_notes_lead ON notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
