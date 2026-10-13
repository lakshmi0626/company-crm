export default function SearchBar({ value, onChange, placeholder = 'Search' }) {
  return (
    <input
      className="input search"
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
