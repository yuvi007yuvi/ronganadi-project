import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...', style }) {
  return (
    <div className="search-bar" style={style}>
      <Search size={15} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
