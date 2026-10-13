export default function DataTable({ columns, rows, loading, onEdit, onDelete, rowActions }) {
  const hasActions = onEdit || onDelete || rowActions;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key}>{c.label}</th>)}
            {hasActions && <th aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? <span className="muted">—</span>}</td>
              ))}
              {hasActions && (
                <td className="row-actions">
                  {rowActions && rowActions(row)}
                  {onEdit && <button className="btn btn-ghost" onClick={() => onEdit(row)}>Edit</button>}
                  {onDelete && <button className="btn btn-ghost danger" onClick={() => onDelete(row)}>Delete</button>}
                </td>
              )}
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={columns.length + (hasActions ? 1 : 0)} className="muted table-empty">
              {loading ? 'Loading…' : 'No records match. Try a different search or add a new one.'}
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
