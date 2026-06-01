import { useState } from 'react';
import { allSchemes } from '../data/schemes.js';
import { X, Search } from 'lucide-react';

export default function SchemeSelector({ selected = [], onChange, label }) {
  const [search, setSearch] = useState('');

  const filtered = allSchemes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    const isSelected = selected.includes(id);
    onChange(isSelected ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const remove = (id) => onChange(selected.filter(s => s !== id));

  const selectedSchemes = allSchemes.filter(s => selected.includes(s.id));

  return (
    <div className="scheme-picker">
      {/* Selected tags */}
      {selectedSchemes.length > 0 && (
        <div className="scheme-tags">
          {selectedSchemes.map(s => (
            <span key={s.id} className="scheme-tag">
              {s.name}
              <button type="button" onClick={() => remove(s.id)}>×</button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="search-bar scheme-picker-search">
        <Search size={13} className="search-icon" />
        <input
          type="text"
          placeholder={`Search ${label || 'schemes'}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 13 }}
        />
      </div>

      {/* List */}
      <div className="scheme-list">
        {filtered.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
            No schemes found
          </div>
        ) : filtered.map(scheme => (
          <label key={scheme.id} className="scheme-item" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selected.includes(scheme.id)}
              onChange={() => toggle(scheme.id)}
            />
            <div className="scheme-item-info">
              <div className="scheme-item-name">{scheme.name}</div>
              <div className="scheme-item-cat">{scheme.category}</div>
            </div>
          </label>
        ))}
      </div>

      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
        {selected.length} scheme{selected.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
}
