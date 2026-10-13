function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const s = value instanceof Date ? value.toISOString() : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCSV(rows, columns) {
  const lines = rows.map((r) => columns.map((c) => escapeCell(r[c])).join(','));
  return [columns.join(','), ...lines].join('\n');
}

// Parses CSV text (with quoted fields) into an array of objects keyed by lower-cased header.
function parseCSV(input) {
  const text = String(input || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }

  const filled = rows.filter((r) => r.some((c) => c.trim() !== ''));
  if (filled.length < 2) return [];
  const headers = filled[0].map((h) => h.trim().toLowerCase());
  return filled.slice(1).map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, (r[i] || '').trim()]))
  );
}

module.exports = { toCSV, parseCSV };
