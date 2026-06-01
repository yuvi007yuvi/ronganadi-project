import { useState } from 'react';
import { useData } from '../context/DataContext';
import { allSchemes, centralSchemes, assamSchemes } from '../data/schemes.js';
import { ExternalLink, Search, BookOpen } from 'lucide-react';

const categoryColors = {
  Agriculture: '#10b981',
  Housing: '#3b82f6',
  Health: '#ef4444',
  Employment: '#f59e0b',
  Energy: '#8b5cf6',
  Finance: '#06b6d4',
  Food: '#f97316',
  Education: '#ec4899',
  Insurance: '#6366f1',
  Pension: '#64748b',
  Water: '#0ea5e9',
  'Social Welfare': '#e11d48',
  'Women Empowerment': '#d946ef',
  'Rural Development': '#84cc16',
  Environment: '#22c55e',
  Youth: '#f97316',
  Infrastructure: '#78716c',
};

export default function Awareness() {
  const { announcements } = useData();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCat, setSelectedCat] = useState('');

  const publishedAnn = announcements.filter(a => a.published);

  const schemesToShow = activeTab === 'central' ? centralSchemes : activeTab === 'assam' ? assamSchemes : allSchemes;
  const categories = [...new Set(schemesToShow.map(s => s.category))].sort();

  const filtered = schemesToShow.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
    const matchCat = !selectedCat || s.category === selectedCat;
    return matchSearch && matchCat;
  });

  const schemeLinks = {
    'cs1': 'https://pmkisan.gov.in',
    'cs4': 'https://pmjay.gov.in',
    'cs5': 'https://nrega.nic.in',
    'cs6': 'https://pmuy.gov.in',
    'cs7': 'https://pmjdy.gov.in',
    'cs8': 'https://pmfby.gov.in',
    'cs9': 'https://mudra.org.in',
  };

  const priorityColor = {
    high: 'var(--danger)',
    medium: 'var(--warning)',
    low: '#10b981',
  };

  return (
    <div className="animate-fadeIn">
      {/* Ticker */}
      {publishedAnn.length > 0 && (
        <div className="announcement-ticker">
          🔔 &nbsp;
          <span className="ticker-inner">
            {publishedAnn.map(a => `📢 ${a.title}`).join('  ·  ')}
          </span>
        </div>
      )}

      {/* Announcements */}
      {publishedAnn.length > 0 && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="card-header">
            <div className="card-title">📢 Latest Announcements</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {publishedAnn.slice(0, 4).map(a => (
              <div key={a.id} style={{
                display: 'flex',
                gap: 16,
                padding: '14px 16px',
                borderRadius: 12,
                background: 'var(--gray-50)',
                borderLeft: `4px solid ${priorityColor[a.priority] || 'var(--primary)'}`,
              }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>
                  {a.type === 'event' ? '🎪' : a.type === 'news' ? '📰' : a.type === 'notice' ? '📋' : '📣'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>{a.content}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>📅 {a.publishedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schemes Section */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="card-title">🏛️ Supported Schemes</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
              Central & Assam State schemes – {filtered.length} shown
            </div>
          </div>
          {/* Search */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, maxWidth: 360 }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedCat(''); }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all', 'All Schemes'], ['central', '🇮🇳 Central'], ['assam', '🌿 Assam']].map(([v, l]) => (
              <button
                key={v}
                className={`btn btn-sm ${activeTab === v ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setActiveTab(v); setSelectedCat(''); }}
              >
                {l}
              </button>
            ))}
          </div>
          <select
            className="filter-select"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="card-body">
          <div className="grid-cols-3" style={{ gap: 16 }}>
            {filtered.map(scheme => {
              const color = categoryColors[scheme.category] || 'var(--primary)';
              return (
                <div key={scheme.id} className="scheme-card" style={{ borderTopColor: color }}>
                  <div className="scheme-cat-badge" style={{ background: `${color}18`, color }}>
                    {scheme.category}
                  </div>
                  <h3>{scheme.name}</h3>
                  <p>{scheme.description}</p>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                      {scheme.id.startsWith('cs') ? '🇮🇳 Central' : '🌿 Assam State'}
                    </span>
                    {schemeLinks[scheme.id] && (
                      <a
                        href={schemeLinks[scheme.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: color, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                      >
                        Learn More <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <BookOpen size={40} className="empty-state-icon" />
                <h3>No schemes found</h3>
                <p>Try a different search term or category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
