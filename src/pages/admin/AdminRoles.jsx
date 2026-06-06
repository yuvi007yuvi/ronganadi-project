import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import Modal from '../../components/Modal';
import { Shield, Users, Plus, Edit2, CheckCircle2 } from 'lucide-react';

export default function AdminRoles() {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [admins, setAdmins] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, pRes, aRes] = await Promise.all([
        apiFetch('/rbac.php?action=get_roles'),
        apiFetch('/rbac.php?action=get_permissions'),
        apiFetch('/rbac.php?action=get_users_roles')
      ]);
      setRoles(rRes);
      setPermissions(pRes);
      setAdmins(aRes);
    } catch (err) {
      console.error(err);
      setError("Failed to load RBAC data. Make sure setup_rbac_module.php was run in the browser.");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id) => {
    setFormData(prev => {
      const perms = prev.permissions.includes(id) 
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id];
      return { ...prev, permissions: perms };
    });
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setSubmitting(true);
    try {
      await apiFetch('/rbac.php?action=create_role', {
        method: 'POST',
        body: formData
      });
      setCreateRoleModal(false);
      setFormData({ name: '', description: '', permissions: [] });
      await fetchData();
    } catch (err) {
      alert("Failed to create role");
    } finally {
      setSubmitting(false);
    }
  };

  const assignAdminRole = async (userId, userType, roleId) => {
    try {
      await apiFetch('/rbac.php?action=assign_role', {
        method: 'POST',
        body: { user_id: userId, user_type: userType, role_id: roleId }
      });
      await fetchData();
    } catch (err) {
      alert("Failed to assign role");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading RBAC data...</div>;
  if (error) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h3 style={{ color: 'red' }}>Database Tables Missing</h3>
      <p>{error}</p>
      <a href="/api/setup_rbac_module.php" target="_blank" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>
        Run Database Setup
      </a>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Roles & Permissions</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Manage system access levels</div>
          </div>
          <Shield size={24} color="var(--primary)" />
        </div>
        
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', background: '#fafbff' }}>
          <button 
            onClick={() => setActiveTab('roles')}
            style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'roles' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'roles' ? 'var(--primary)' : 'var(--gray-500)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Shield size={16} /> Manage Roles
          </button>
          <button 
            onClick={() => setActiveTab('assignments')}
            style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'assignments' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'assignments' ? 'var(--primary)' : 'var(--gray-500)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Users size={16} /> User Assignments
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {activeTab === 'roles' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>System Roles</h3>
                <button className="btn btn-primary" onClick={() => setCreateRoleModal(true)} style={{ padding: '8px 16px', gap: 6 }}>
                  <Plus size={16} /> Create Custom Role
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {roles.map(role => (
                  <div key={role.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: 20, background: role.is_system ? '#f8fafc' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h4 style={{ margin: 0, fontSize: 16, color: 'var(--gray-900)' }}>{role.name}</h4>
                      {role.is_system == 1 && <span style={{ fontSize: 10, background: '#e2e8f0', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>SYSTEM</span>}
                    </div>
                    <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--gray-500)', minHeight: 40 }}>{role.description}</p>
                    
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>Permissions:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {role.permissions?.map(p => (
                        <span key={p.id} style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: 4 }}>
                          {p.name}
                        </span>
                      ))}
                      {!role.permissions?.length && <span style={{ fontSize: 11, color: '#9ca3af' }}>No permissions assigned</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0' }}>Assign Roles to System Users</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>User Type</th>
                    <th>Designation</th>
                    <th>Current Role</th>
                    <th>Assign New Role</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={`${admin.user_type}-${admin.id}`}>
                      <td style={{ fontWeight: 600 }}>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>
                        <span style={{ fontSize: 11, background: '#f3f4f6', padding: '4px 8px', borderRadius: 4, textTransform: 'capitalize' }}>
                          {admin.user_type}
                        </span>
                      </td>
                      <td>{admin.designation || '-'}</td>
                      <td>
                        {admin.role_name ? (
                          <span style={{ background: '#dcfce7', color: '#059669', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                            {admin.role_name}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: 12 }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <select 
                          className="form-control" 
                          style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                          value={admin.role_id || ''}
                          onChange={(e) => assignAdminRole(admin.id, admin.user_type, e.target.value)}
                        >
                          <option value="">-- Select Role --</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={createRoleModal} onClose={() => setCreateRoleModal(false)} title="Create Custom Role" width={600}>
        <form onSubmit={handleCreateRole}>
          <div className="form-group">
            <label className="form-label">Role Name</label>
            <input className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Data Entry" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What can this role do?" rows={2}></textarea>
          </div>
          
          <div className="form-group" style={{ marginTop: 20 }}>
            <label className="form-label" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginBottom: 12 }}>Select Permissions</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {permissions.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', padding: 8, borderRadius: 8, background: formData.permissions.includes(p.id) ? '#eff6ff' : 'transparent' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.permissions.includes(p.id)}
                    onChange={() => togglePermission(p.id)}
                    style={{ marginTop: 4 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: formData.permissions.includes(p.id) ? '#1d4ed8' : 'var(--gray-800)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{p.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateRoleModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !formData.name}>
              {submitting ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
