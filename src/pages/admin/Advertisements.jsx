import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2, Eye, EyeOff, Megaphone, Calendar } from 'lucide-react';

const emptyForm = {
  title: '',
  content: '',
  type: 'announcement',
  priority: 'medium',
  expiresAt: '',
  published: true,
};

const typeColors = {
  announcement: { bg: 'var(--orange-100)', color: 'var(--orange-700)' },
  news: { bg: 'var(--info-bg)', color: '#1d4ed8' },
  event: { bg: 'var(--success-bg)', color: '#047857' },
  notice: { bg: 'var(--warning-bg)', color: '#92400e' },
};

export default function Advertisements() {
  const { announcements, addAnnouncement, updateAnnouncement, toggleAnnouncement, deleteAnnouncement } = useData();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? announcements : announcements.filter(a =>
    filter === 'published' ? a.published : !a.published
  );

  const openAdd = () => { setEditId(null); setForm(emptyForm); setErrors({}); setShowModal(true); };
  const openEdit = (a) => {
    setEditId(a.id);
    setForm({ title: a.title, content: a.content, type: a.type, priority: a.priority, expiresAt: a.expiresAt || '', published: a.published });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editId) {
      updateAnnouncement(editId, form);
    } else {
      addAnnouncement({ ...form, createdBy: currentUser.id });
    }
    setShowModal(false);
  };

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  return (
    <div className="animate-fadeIn">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Advertisements & Announcements</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
              {announcements.filter(a => a.published).length} published · {announcements.filter(a => !a.published).length} draft
            </div>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="add-announcement-btn">
            <Plus size={15} />New Post
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', gap: 8 }}>
          {[['all', 'All'], ['published', 'Published'], ['draft', 'Drafts']].map(([v, l]) => (
            <button
              key={v}
              className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(v)}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(a => {
              const tc = typeColors[a.type] || typeColors.announcement;
              return (
                <div key={a.id} style={{
                  border: `1px solid ${a.published ? 'var(--orange-100)' : 'var(--gray-200)'}`,
                  borderLeft: `4px solid ${a.published ? 'var(--primary)' : 'var(--gray-300)'}`,
                  borderRadius: 12, padding: 20,
                  background: a.published ? 'var(--orange-50)' : 'var(--gray-50)',
                  transition: 'var(--transition)',
                  opacity: a.published ? 1 : 0.7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className="pill" style={{ background: tc.bg, color: tc.color }}>
                          {a.type}
                        </span>
                        <span className={`pill ${a.priority === 'high' ? 'pill-danger' : a.priority === 'medium' ? 'pill-warning' : 'pill-gray'}`}>
                          {a.priority} priority
                        </span>
                        {!a.published && <span className="pill pill-gray">draft</span>}
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>{a.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 8 }}>{a.content}</p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--gray-500)' }}>
                        <span>📅 Published: {a.publishedAt}</span>
                        {a.expiresAt && <span>⏰ Expires: {a.expiresAt}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        className={`btn btn-sm ${a.published ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => toggleAnnouncement(a.id)}
                        title={a.published ? 'Unpublish' : 'Publish'}
                      >
                        {a.published ? <EyeOff size={13} /> : <Eye size={13} />}
                        {a.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(a)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="empty-state">
                <Megaphone size={40} className="empty-state-icon" />
                <h3>No posts found</h3>
                <p>Create your first announcement</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Edit Announcement' : 'New Announcement'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editId ? 'Save Changes' : 'Post'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label required">Title</label>
          <input className={`form-control ${errors.title ? 'error' : ''}`} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Announcement title..." />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>
        <div className="form-group">
          <label className="form-label required">Content</label>
          <textarea className={`form-control ${errors.content ? 'error' : ''}`} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Announcement details..." rows={4} />
          {errors.content && <div className="form-error">{errors.content}</div>}
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="announcement">Announcement</option>
              <option value="news">News</option>
              <option value="event">Event</option>
              <option value="notice">Notice</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-control" value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="form-group form-col-span-2">
            <label className="form-label">Expiry Date (optional)</label>
            <input type="date" className="form-control" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
          <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
          <span style={{ fontWeight: 500, color: 'var(--gray-700)', fontSize: 14 }}>Publish immediately</span>
        </label>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Announcement"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => { deleteAnnouncement(deleteConfirm.id); setDeleteConfirm(null); }}>Delete</button>
          </>
        }
      >
        <p style={{ color: 'var(--gray-700)' }}>Delete "<strong>{deleteConfirm?.title}</strong>"? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
