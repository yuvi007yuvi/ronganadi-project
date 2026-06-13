import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import Modal from '../../components/Modal';
import { Shield, Users, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function AdminRoles() {
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'roles' : 'assignments');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
  
  const [adminModal, setAdminModal] = useState(false);
  const [editAdminMode, setEditAdminMode] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [adminFormData, setAdminFormData] = useState({ name: '', email: '', password: '', designation: '', department_ids: [] });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, pRes, aRes, dRes] = await Promise.all([
        apiFetch('/rbac.php?action=get_roles'),
        apiFetch('/rbac.php?action=get_permissions'),
        apiFetch('/rbac.php?action=get_users_roles'),
        apiFetch('/departments.php')
      ]);
      setRoles(rRes);
      setPermissions(pRes);
      setAdmins(aRes);
      setDepartments(dRes || []);
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
      if (editMode) {
        await apiFetch('/rbac.php?action=update_role', {
          method: 'POST',
          body: { ...formData, id: currentRoleId }
        });
      } else {
        await apiFetch('/rbac.php?action=create_role', {
          method: 'POST',
          body: formData
        });
      }
      setCreateRoleModal(false);
      setEditMode(false);
      setCurrentRoleId(null);
      setFormData({ name: '', description: '', permissions: [] });
      await fetchData();
    } catch (err) {
      alert(editMode ? "Failed to update role" : "Failed to create role");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (role) => {
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions?.map(p => p.id) || []
    });
    setEditMode(true);
    setCurrentRoleId(role.id);
    setCreateRoleModal(true);
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role? This cannot be undone.")) return;
    try {
      await apiFetch('/rbac.php?action=delete_role', {
        method: 'POST',
        body: { id }
      });
      await fetchData();
    } catch (err) {
      alert("Failed to delete role");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!adminFormData.name || !adminFormData.email || (!editAdminMode && !adminFormData.password)) return;
    
    setSubmitting(true);
    try {
      if (editAdminMode) {
        await apiFetch('/rbac.php?action=update_admin', {
          method: 'POST',
          body: { ...adminFormData, id: currentAdminId }
        });
      } else {
        await apiFetch('/rbac.php?action=create_admin', {
          method: 'POST',
          body: adminFormData
        });
      }
      setAdminModal(false);
      setEditAdminMode(false);
      setCurrentAdminId(null);
      setAdminFormData({ name: '', email: '', password: '', designation: '', department_ids: [] });
      await fetchData();
    } catch (err) {
      alert(editAdminMode ? "Failed to update admin" : "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditAdminModal = (admin) => {
    setAdminFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      designation: admin.designation || '',
      department_ids: admin.department_ids || []
    });
    setEditAdminMode(true);
    setCurrentAdminId(admin.id);
    setAdminModal(true);
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Admin?")) return;
    try {
      await apiFetch('/rbac.php?action=delete_admin', {
        method: 'POST',
        body: { id }
      });
      await fetchData();
    } catch (err) {
      alert("Failed to delete admin. (System Admin cannot be deleted)");
    }
  };

  const assignAdminRole = async (userId, roleId) => {
    try {
      await apiFetch('/rbac.php?action=assign_role', {
        method: 'POST',
        body: { user_id: userId, role_id: roleId }
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
          {isSuperAdmin && (
            <button 
              onClick={() => setActiveTab('roles')}
              style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'roles' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'roles' ? 'var(--primary)' : 'var(--gray-500)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Shield size={16} /> Manage Roles
            </button>
          )}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 16, color: 'var(--gray-900)' }}>{role.name}</h4>
                        {role.is_system == 1 && <span style={{ fontSize: 10, background: '#e2e8f0', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>SYSTEM</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {role.is_system != 1 && (
                          <>
                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => openEditModal(role)} title="Edit Role">
                              <Edit2 size={16} color="var(--gray-500)" />
                            </button>
                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => handleDeleteRole(role.id)} title="Delete Role">
                              <Trash2 size={16} color="#ef4444" />
                            </button>
                          </>
                        )}
                      </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>Assign Roles to Admins</h3>
                <button className="btn btn-primary" onClick={() => {
                  setAdminModal(true);
                  setEditAdminMode(false);
                  setCurrentAdminId(null);
                  setAdminFormData({ name: '', email: '', password: '', designation: '', department_ids: [] });
                }} style={{ padding: '8px 16px', gap: 6 }}>
                  <Plus size={16} /> Add Admin
                </button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Admin Name</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Current Role</th>
                    <th>Assign New Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin.id}>
                      <td style={{ fontWeight: 600 }}>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.designation || '-'}</td>
                      <td>
                        {admin.department_ids?.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {admin.department_ids.map(id => {
                              const dept = departments.find(d => d.id == id);
                              return dept ? <span key={id} style={{ fontSize: 11, background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '2px 6px', borderRadius: 4 }}>{dept.name}</span> : null;
                            })}
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: 12 }}>Global Access</span>
                        )}
                      </td>
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
                          onChange={(e) => assignAdminRole(admin.id, e.target.value)}
                        >
                          <option value="">-- Select Role --</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => openEditAdminModal(admin)} title="Edit Admin">
                            <Edit2 size={16} color="var(--gray-500)" />
                          </button>
                          {admin.id !== 1 && (
                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => handleDeleteAdmin(admin.id)} title="Delete Admin">
                              <Trash2 size={16} color="#ef4444" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={createRoleModal} onClose={() => { setCreateRoleModal(false); setEditMode(false); setCurrentRoleId(null); setFormData({ name: '', description: '', permissions: [] }); }} title={editMode ? "Edit Custom Role" : "Create Custom Role"} width={600}>
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
            <button type="button" className="btn btn-secondary" onClick={() => { setCreateRoleModal(false); setEditMode(false); setCurrentRoleId(null); setFormData({ name: '', description: '', permissions: [] }); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !formData.name}>
              {submitting ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={adminModal} onClose={() => { setAdminModal(false); setEditAdminMode(false); setCurrentAdminId(null); setAdminFormData({ name: '', email: '', password: '', designation: '', department_ids: [] }); }} title={editAdminMode ? "Edit Admin" : "Add Admin"} width={500}>
        <form onSubmit={handleCreateAdmin}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-control" value={adminFormData.name} onChange={e => setAdminFormData({...adminFormData, name: e.target.value})} required placeholder="Admin Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={adminFormData.email} onChange={e => setAdminFormData({...adminFormData, email: e.target.value})} required placeholder="admin@ronganadi.gov.in" />
          </div>
          <div className="form-group">
            <label className="form-label">Password {editAdminMode && <span style={{fontSize: 11, color: '#9ca3af'}}>(Leave blank to keep current)</span>}</label>
            <input type="password" className="form-control" value={adminFormData.password} onChange={e => setAdminFormData({...adminFormData, password: e.target.value})} required={!editAdminMode} placeholder={editAdminMode ? "Enter new password..." : "Password"} />
          </div>
          <div className="form-group">
            <label className="form-label">Designation</label>
            <input className="form-control" value={adminFormData.designation} onChange={e => setAdminFormData({...adminFormData, designation: e.target.value})} placeholder="e.g. District Coordinator" />
          </div>
          <div className="form-group">
            <label className="form-label">Assign Departments</label>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: '8px', padding: '12px', background: '#fff' }}>
              {departments.map(d => (
                <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={adminFormData.department_ids.includes(d.id.toString()) || adminFormData.department_ids.includes(d.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked 
                        ? [...adminFormData.department_ids, d.id]
                        : adminFormData.department_ids.filter(id => id != d.id);
                      setAdminFormData({ ...adminFormData, department_ids: newIds });
                    }}
                  />
                  <span>{d.name}</span>
                </label>
              ))}
              {departments.length === 0 && <span style={{color: 'var(--gray-500)', fontSize: 13}}>No departments found</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>Leave empty to make them a Global user (No department restrictions). Super Admins have global access by default.</div>
          </div>
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setAdminModal(false); setEditAdminMode(false); setCurrentAdminId(null); setAdminFormData({ name: '', email: '', password: '', designation: '', department_ids: [] }); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !adminFormData.name || !adminFormData.email}>
              {submitting ? (editAdminMode ? 'Updating...' : 'Adding...') : (editAdminMode ? 'Update Admin' : 'Add Admin')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
