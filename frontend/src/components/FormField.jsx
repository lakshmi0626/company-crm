export default function FormField({ field, value, onChange, options = [] }) {
  const { name, label, type = 'text', required, hint, rows = 4 } = field;
  const id = `f-${name}`;
  const opts = (field.options || options).map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

  let control;
  if (type === 'textarea') {
    control = <textarea id={id} className="input" rows={rows} value={value ?? ''} required={required} onChange={(e) => onChange(name, e.target.value)} />;
  } else if (type === 'select') {
    control = (
      <select id={id} className="input" value={value ?? ''} required={required} onChange={(e) => onChange(name, e.target.value)}>
        <option value="">{required ? 'Select…' : 'None'}</option>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else if (type === 'checkbox') {
    return (
      <label className="check-field" htmlFor={id}>
        <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(name, e.target.checked)} />
        <span>{label}</span>
      </label>
    );
  } else {
    control = <input id={id} className="input" type={type} value={value ?? ''} required={required} min={type === 'number' ? 0 : undefined} onChange={(e) => onChange(name, e.target.value)} />;
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}{required && <span className="req"> *</span>}</label>
      {control}
      {hint && <small className="muted">{hint}</small>}
    </div>
  );
}
