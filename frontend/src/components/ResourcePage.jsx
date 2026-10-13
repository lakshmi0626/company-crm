import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import useDebounce from '../hooks/useDebounce.js';
import useOptions from '../hooks/useOptions.js';
import DataTable from './DataTable.jsx';
import Pagination from './Pagination.jsx';
import SearchBar from './SearchBar.jsx';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';

const TEAM = ['admin', 'manager'];

/**
 * Generic list + create/edit/delete screen driven by config.
 * `fields` / `filters` must be module-level constants so option loading runs once.
 */
export default function ResourcePage({
  title, noun, path, columns, fields, filters = [],
  canDelete = (u) => TEAM.includes(u.role), rowActions, intro,
}) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [q, setQ] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, row = existing
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const debouncedQ = useDebounce(q, 300);
  const options = useOptions([...fields, ...filters]);

  const visibleFields = fields.filter((f) => !f.visibleTo || f.visibleTo.includes(user.role));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(path, { q: debouncedQ, page, ...filterValues });
      setRows(res.data);
      setMeta({ page: res.page, pages: res.pages, total: res.total });
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path, debouncedQ, page, filterValues]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedQ, filterValues]);

  const openForm = (row) => {
    const initial = {};
    fields.forEach((f) => {
      let v = row ? row[f.name] : f.default;
      if (f.type === 'date' && v) v = String(v).slice(0, 10);
      if (f.type === 'checkbox') v = v === undefined ? true : Boolean(v);
      initial[f.name] = v ?? '';
    });
    setForm(initial);
    setEditing(row || {});
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {};
    visibleFields.forEach((f) => {
      let v = form[f.name];
      if (f.type === 'number' && v !== '') v = Number(v);
      if (f.name === 'password' && !v) return;
      body[f.name] = v;
    });
    try {
      if (editing.id) await api.put(`${path}/${editing.id}`, body);
      else await api.post(path, body);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete this ${noun}? This cannot be undone.`)) return;
    try {
      await api.del(`${path}/${row.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          {intro && <p className="muted">{intro}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => openForm(null)}>Add {noun}</button>
      </div>

      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} placeholder={`Search ${title.toLowerCase()}`} />
        {filters.map((f) => (
          <select
            key={f.name}
            className="input filter"
            aria-label={f.label}
            value={filterValues[f.name] || ''}
            onChange={(e) => setFilterValues((v) => ({ ...v, [f.name]: e.target.value }))}
          >
            <option value="">{f.label}</option>
            {(f.options || options[f.name] || []).map((o) => {
              const opt = typeof o === 'string' ? { value: o, label: o } : o;
              return <option key={opt.value} value={opt.value}>{opt.label}</option>;
            })}
          </select>
        ))}
      </div>

      {error && !editing && <div className="alert">{error}</div>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        onEdit={openForm}
        onDelete={canDelete(user) ? remove : undefined}
        rowActions={rowActions && ((row) => rowActions(row, load))}
      />
      <Pagination page={meta.page} pages={meta.pages} total={meta.total} onChange={setPage} />

      {editing && (
        <Modal title={editing.id ? `Edit ${noun}` : `Add ${noun}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="form">
            {error && <div className="alert">{error}</div>}
            {visibleFields.map((f) => (
              <FormField
                key={f.name}
                field={f.requiredOnCreate ? { ...f, required: !editing.id } : f}
                value={form[f.name]}
                onChange={setField}
                options={options[f.name]}
              />
            ))}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
