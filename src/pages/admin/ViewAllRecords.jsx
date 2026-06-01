import { useState } from 'react';
import { useData } from '../../context/DataContext';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import { Eye, Trash2, ClipboardList } from 'lucide-react';
import { apiFetch } from '../../config/api';

const PAGE_SIZE = 10;

export default function ViewAllRecords() {
  const { surveyResponses, loading } = useData();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewRecord, setViewRecord] = useState(null);
  
  // We don't have a direct delete function in context for responses, so we'll handle it here if needed, 
  // or just disable delete for now if the API doesn't support it.
  
  // Wait, let's just make it read-only for now, or add a simple delete API call if necessary.
  
  const filtered = (surveyResponses || []).filter(r => {
    const q = search.toLowerCase();
    return !search ||
      r.survey_title?.toLowerCase().includes(q) ||
      r.citizen_phone?.includes(q);
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="p-8 text-center" style={{ color: 'var(--gray-500)' }}>Loading survey records...</div>;

  return (
    <div className="animate-fadeIn">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Survey Records</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{total} responses found</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ClipboardList size={20} color="var(--primary)" />
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', gap: 12 }}>
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by survey title or phone..." style={{ flex: 1, maxWidth: 400 }} />
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Survey Title</th>
                <th>Submitted By (Phone)</th>
                <th>Submitted On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{r.survey_title || 'Unknown Survey'}</div>
                  </td>
                  <td style={{ fontSize: 13, fontFamily: 'monospace' }}>{r.citizen_phone || 'Anonymous'}</td>
                  <td style={{ fontSize: 13 }}>{new Date(r.submitted_at).toLocaleString('en-IN')}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewRecord(r)} title="View Responses">
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <ClipboardList size={40} className="empty-state-icon" />
                      <h3>No survey records found</h3>
                      <p>{search ? 'Try adjusting your search' : 'No surveys submitted yet'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </div>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* View Record Modal */}
      <Modal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="Survey Response Details" size="modal-lg"
        footer={<button className="btn btn-secondary" onClick={() => setViewRecord(null)}>Close</button>}
      >
        {viewRecord && (
          <div>
            <div style={{ padding: '0 0 20px', borderBottom: '1px solid var(--gray-100)', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px', color: 'var(--gray-900)' }}>{viewRecord.survey_title}</h3>
              <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--gray-500)' }}>
                <span>Phone: <strong>{viewRecord.citizen_phone || 'N/A'}</strong></span>
                <span>Submitted: <strong>{new Date(viewRecord.submitted_at).toLocaleString('en-IN')}</strong></span>
              </div>
            </div>
            
            <div className="form-section">
              <div className="form-section-title">📝 Answers provided</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {viewRecord.responses_json && typeof viewRecord.responses_json === 'object' ? 
                  Object.entries(viewRecord.responses_json).map(([question, answer], idx) => (
                    <div key={idx} style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid var(--gray-100)' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 6 }}>{question}</div>
                      <div style={{ fontSize: 15, color: 'var(--primary-dark)', fontWeight: 500 }}>
                        {Array.isArray(answer) ? answer.join(', ') : (answer || '—')}
                      </div>
                    </div>
                  ))
                : <p style={{ color: 'var(--gray-500)' }}>No readable answers found.</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
