export default function Pagination({ page, pages, total, onChange }) {
  return (
    <div className="pagination">
      <span className="muted">{total} {total === 1 ? 'record' : 'records'}</span>
      <div className="pagination-buttons">
        <button className="btn btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button className="btn btn-ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}
