import { useState } from 'react';
import { api } from '../api/client.js';

const EXPORTS = [
  { key: 'contacts', label: 'Contacts' },
  { key: 'companies', label: 'Companies' },
  { key: 'leads', label: 'Leads' },
];

export default function ImportExport() {
  const [csv, setCsv] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const download = async (key) => {
    try {
      const text = await api.get(`/io/export/${key}`);
      const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${key}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setError('');
    } catch (e) { setError(e.message); }
  };

  const pick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setCsv(await file.text());
    setResult(null);
  };

  const run = async () => {
    setBusy(true);
    try { setResult(await api.post('/io/import/contacts', { csv })); setError(''); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <section>
      <div className="page-head"><div><h1>Import and export</h1>
        <p className="muted">Move data in and out of the CRM as CSV files.</p></div></div>
      {error && <div className="alert">{error}</div>}

      <div className="grid-2">
        <div className="panel">
          <h2>Export</h2>
          <p className="muted">Download everything in a list as a spreadsheet-ready CSV.</p>
          <div className="form-actions left">
            {EXPORTS.map((x) => <button key={x.key} className="btn btn-ghost" onClick={() => download(x.key)}>Export {x.label.toLowerCase()}</button>)}
          </div>
        </div>

        <div className="panel">
          <h2>Import contacts</h2>
          <p className="muted">
            First row must be a header with: <code>first_name, last_name, email, phone, job_title, company</code>.
            New companies are created automatically and contacts with an existing email are skipped.
          </p>
          <input type="file" accept=".csv,text/csv" onChange={pick} aria-label="CSV file" />
          {fileName && <p className="muted">{fileName} ready to import</p>}
          <div className="form-actions left">
            <button className="btn btn-primary" disabled={!csv || busy} onClick={run}>{busy ? 'Importing…' : 'Import contacts'}</button>
          </div>
          {result && (
            <div className="result">
              <strong>{result.imported} imported, {result.skipped} skipped</strong>
              {result.errors.length > 0 && (
                <ul>{result.errors.map((er) => <li key={er.line}>Line {er.line}: {er.reason}</li>)}</ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
