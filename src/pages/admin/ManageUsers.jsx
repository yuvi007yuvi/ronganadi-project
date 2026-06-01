import { useState } from 'react';
import { useData } from '../../context/DataContext';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import { User, Edit2, Trash2, Key, Shield, UserX, UserCheck } from 'lucide-react';
import { apiFetch } from '../../config/api';

const PAGE_SIZE = 10;

export default function ManageUsers() {
  const { citizens, updateCitizen, deleteCitizen } = useData();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const [editRecord, setEditRecord] = useState(null);
  const [passwordRecord, setPasswordRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filtered = citizens.filter(c => {
    const q = search.toLowerCase();
    return !search ||
      c.fullName?.toLowerCase().includes(q) ||
      c.mobile?.includes(q) ||
      c.area?.toLowerCase().includes(q);
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCitizen(editRecord.id, formData);
      setEditRecord(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/citizens.php?id=${passwordRecord.id}`, {
        method: 'PUT',
        body: { password: newPassword }
      });
      setPasswordRecord(null);
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
    try {
      await updateCitizen(user.id, { status: newStatus });
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Have you run the DB cleanup script yet?");
    }
  };

  const handleDelete = (id) => {
    deleteCitizen(id);
    setDeleteConfirm(null);
  };

  const openEdit = (user) => {
    setEditRecord(user);
    setFormData({ ...user, is_migrated: user.is_migrated || 'no' });
  };

  return (
    <div className="animate-fadeIn">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Manage Citizens / Users</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{total} users found</div>
          </div>
          <Shield size={20} color="var(--primary)" />
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name, mobile, or area..." />
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Mobile</th>
                <th>Area</th>
                <th>Panchayat</th>
                <th>Status</th>
                <th>Migrated</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{user.fullName}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{user.mobile}</td>
                  <td style={{ fontSize: 13 }}>{user.area}</td>
                  <td style={{ fontSize: 13 }}>{user.panchayat || '-'}</td>
                  <td>
                    <span className={`pill ${user.status === 'inactive' ? 'pill-danger' : 'pill-success'}`} style={{ fontSize: 10 }}>
                      {user.status === 'inactive' ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>{user.is_migrated === 'yes' ? 'Yes' : 'No'}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                    {user.submittedAt ? new Date(user.submittedAt).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleStatusToggle(user)} title={user.status === 'inactive' ? "Unblock User" : "Block User"} style={{ color: user.status === 'inactive' ? 'var(--success)' : 'var(--danger)' }}>
                        {user.status === 'inactive' ? <UserCheck size={14} /> : <UserX size={14} />}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(user)} title="Edit User">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setPasswordRecord(user)} title="Reset Password" style={{ color: 'var(--warning)' }}>
                        <Key size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(user)} title="Delete User" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <User size={40} className="empty-state-icon" />
                      <h3>No users found</h3>
                      <p>{search ? 'Try adjusting your search' : 'No users registered yet'}</p>
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

      {/* Edit Modal */}
      <Modal isOpen={!!editRecord} onClose={() => setEditRecord(null)} title="Edit User Details">
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input className="form-control" value={formData.mobile || ''} onChange={e => setFormData({...formData, mobile: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Area</label>
            <input className="form-control" value={formData.area || ''} onChange={e => setFormData({...formData, area: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Panchayat</label>
            <input className="form-control" value={formData.panchayat || ''} onChange={e => setFormData({...formData, panchayat: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Migrated from old system?</label>
            <select className="form-control" value={formData.is_migrated || 'no'} onChange={e => setFormData({...formData, is_migrated: e.target.value})}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          
          {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={!!passwordRecord} onClose={() => { setPasswordRecord(null); setNewPassword(''); setError(null); }} title="Reset User Password">
        <form onSubmit={handlePasswordSubmit}>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 16 }}>
            Set a new password for <strong>{passwordRecord?.fullName}</strong>.
          </p>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="text" 
              className="form-control" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="e.g. Pass1234" 
              required 
              minLength={6}
            />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setPasswordRecord(null); setNewPassword(''); setError(null); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: 'var(--warning)', borderColor: 'var(--warning)', color: 'white' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete User"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
          </>
        }
      >
        <p style={{ color: 'var(--gray-700)' }}>
          Are you sure you want to delete user <strong>{deleteConfirm?.fullName}</strong>? This will remove their account and all associated records.
        </p>
      </Modal>
    </div>
  );
}
