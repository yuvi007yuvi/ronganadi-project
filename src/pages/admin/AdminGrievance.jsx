import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { 
  Activity, Users, Clipboard, CheckCircle, AlertOctagon, 
  Trash2, Edit, Plus, UserPlus, Sliders, ChevronDown, Check,
  Clock, ShieldAlert, Award, Grid, MapPin, Phone, RefreshCw,
  MessageSquare, Send, Bell, FileText, Building2
} from 'lucide-react';

export const getProgressForStatus = (status) => {
  switch (status) {
    case 'ticket_generated': return 10;
    case 'dept_assigned': return 30;
    case 'officer_assigned': return 50;
    case 'action_taken': return 70;
    case 'ground_inspection': return 90;
    case 'completed': return 100;
    default: return 0; // 'pending' or others
  }
};

export const getColorForProgress = (progress) => {
  if (progress >= 100) return '#16a34a'; // Green
  if (progress >= 90) return '#9333ea'; // Purple
  if (progress >= 70) return '#4f46e5'; // Indigo
  if (progress >= 50) return '#0ea5e9'; // Light Blue
  if (progress >= 30) return '#eab308'; // Yellow
  if (progress >= 10) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

export default function AdminGrievance({ viewMode }) {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    if (viewMode === 'complaints') return 'complaints';
    if (viewMode === 'ticket_admin') return 'departments';
    return 'dashboard';
  });
  const [deptFilter, setDeptFilter] = useState('all');
  
  // Ticket Admin Module States
  const [adminSubTab, setAdminSubTab] = useState('departments'); // 'departments', 'officers', 'bulk_update'
  const [bulkSelection, setBulkSelection] = useState([]);
  const [bulkFilterDepartment, setBulkFilterDepartment] = useState('');
  const [bulkFilterOfficer, setBulkFilterOfficer] = useState('');
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Complaint Types State
  const [complaintTypes, setComplaintTypes] = useState([
    { id: 1, name: 'Water Leakage', department_id: 1, status: 'active' },
    { id: 2, name: 'Street Light Issue', department_id: 2, status: 'active' },
    { id: 3, name: 'Potholes', department_id: 3, status: 'active' }
  ]);
  const [showComplaintTypeModal, setShowComplaintTypeModal] = useState(false);
  const [complaintTypeName, setComplaintTypeName] = useState('');
  const [complaintTypeDept, setComplaintTypeDept] = useState('');
  const [complaintTypeStatus, setComplaintTypeStatus] = useState('active');
  const [editingComplaintTypeId, setEditingComplaintTypeId] = useState(null);
  
  // Edit Complaint Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateDepartment, setUpdateDepartment] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateOfficer, setUpdateOfficer] = useState('');
  const [updateExpectedDate, setUpdateExpectedDate] = useState('');
  const [updateRemark, setUpdateRemark] = useState('');
  const [updatingGrievance, setUpdatingGrievance] = useState(false);
  const [complaintFilter, setComplaintFilter] = useState('all'); // 'all', 'raw', 'active', 'completed'
  const [listModalType, setListModalType] = useState(null); // null, 'total', 'generated', 'pending', 'solved'
  const [hoveredCard, setHoveredCard] = useState(null); // null, 'total', 'generated', 'pending', 'solved'
  const [viewDetailsType, setViewDetailsType] = useState(null); // for the detailed table popup

  // Status Update Modal State
  const [statusUpdateComplaint, setStatusUpdateComplaint] = useState(null);
  const [statusRemark, setStatusRemark] = useState('');
  const [statusActionTaken, setStatusActionTaken] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateProgress, setStatusUpdateProgress] = useState(0);

  useEffect(() => {
    if (statusUpdateComplaint) {
      setStatusUpdateProgress(statusUpdateComplaint.progress || 0);
    }
  }, [statusUpdateComplaint]);

  // CRUD States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptStatus, setDeptStatus] = useState('active');
  const [editingDeptId, setEditingDeptId] = useState(null);

  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [officerName, setOfficerName] = useState('');
  const [officerDept, setOfficerDept] = useState('');
  const [officerDesg, setOfficerDesg] = useState('');
  const [officerMobile, setOfficerMobile] = useState('');
  const [officerStatus, setOfficerStatus] = useState('active');
  const [editingOfficerId, setEditingOfficerId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (viewMode === 'complaints') setActiveTab('complaints');
    else if (viewMode === 'ticket_admin') setActiveTab('departments');
    else setActiveTab('dashboard');
  }, [viewMode]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [compData, deptData, offData] = await Promise.all([
        apiFetch('/complaints.php'),
        apiFetch('/departments.php'),
        apiFetch('/officers.php')
      ]);
      setComplaints(compData || []);
      setDepartments(deptData || []);
      setOfficers(offData || []);
    } catch (e) {
      console.error('Failed to load initial admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  // --- Department CRUD Handlers ---
  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!deptName) return;
    try {
      const body = { name: deptName, head_officer: deptHead, status: deptStatus };
      if (editingDeptId) {
        await apiFetch(`/departments.php?id=${editingDeptId}`, { method: 'PUT', body });
        alert('Department updated');
      } else {
        await apiFetch('/departments.php', { method: 'POST', body });
        alert('Department added');
      }
      setDeptName('');
      setDeptHead('');
      setEditingDeptId(null);
      setShowDeptModal(false);
      fetchInitialData();
    } catch (e) {
      alert(e.message || 'Action failed');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await apiFetch(`/departments.php?id=${id}`, { method: 'DELETE' });
      alert('Department deleted');
      fetchInitialData();
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  // --- Officer CRUD Handlers ---
  const handleSaveOfficer = async (e) => {
    e.preventDefault();
    if (!officerName || !officerDept) return;
    try {
      const body = { 
        name: officerName, 
        department_id: officerDept, 
        designation: officerDesg, 
        mobile: officerMobile, 
        status: officerStatus 
      };
      if (editingOfficerId) {
        await apiFetch(`/officers.php?id=${editingOfficerId}`, { method: 'PUT', body });
        alert('Officer updated');
      } else {
        await apiFetch('/officers.php', { method: 'POST', body });
        alert('Officer added');
      }
      setOfficerName('');
      setOfficerDept('');
      setOfficerDesg('');
      setOfficerMobile('');
      setEditingOfficerId(null);
      setShowOfficerModal(false);
      fetchInitialData();
    } catch (e) {
      alert(e.message || 'Action failed');
    }
  };

  const handleDeleteOfficer = async (id) => {
    if (!confirm('Are you sure you want to remove this officer?')) return;
    try {
      await apiFetch(`/officers.php?id=${id}`, { method: 'DELETE' });
      alert('Officer removed');
      fetchInitialData();
    } catch (e) {
      alert(e.message || 'Action failed');
    }
  };

  // --- Complaint Status Update ---
  const handleOpenGrievanceModal = (comp) => {
    setSelectedComplaint(comp);
    setUpdateDepartment(comp.department_id || '');
    setUpdateStatus(comp.status);
    setUpdateProgress(comp.progress || 0);
    setUpdateOfficer(comp.assigned_officer_id || '');
    setUpdateExpectedDate(comp.expected_completion_date || '');
    setUpdateRemark('');
  };

  const handleUpdateGrievance = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdatingGrievance(true);
    try {
      const body = {
        status: updateStatus,
        progress: updateProgress,
        assigned_officer_id: updateOfficer || null,
        department_id: updateDepartment || null,
        expected_completion_date: updateExpectedDate,
        remark: updateRemark || null
      };
      await apiFetch(`/complaints.php?id=${selectedComplaint.id}`, {
        method: 'PUT',
        body
      });
      alert(selectedComplaint.ticket_id ? 'Ticket details updated successfully' : 'Ticket raised successfully!');
      setSelectedComplaint(null);
      fetchInitialData();
    } catch (e) {
      alert(e.message || 'Failed to update grievance');
    } finally {
      setUpdatingGrievance(false);
    }
  };

  const handleSaveComplaintType = (e) => {
    e.preventDefault();
    if (editingComplaintTypeId) {
      setComplaintTypes(complaintTypes.map(ct => 
        ct.id === editingComplaintTypeId ? { ...ct, name: complaintTypeName, department_id: complaintTypeDept, status: complaintTypeStatus } : ct
      ));
    } else {
      setComplaintTypes([...complaintTypes, { 
        id: Date.now(), 
        name: complaintTypeName, 
        department_id: complaintTypeDept, 
        status: 'active' 
      }]);
    }
    setShowComplaintTypeModal(false);
  };

  const handleDeleteComplaintType = (id) => {
    if (window.confirm('Are you sure you want to delete this complaint type?')) {
      setComplaintTypes(complaintTypes.filter(ct => ct.id !== id));
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    if (bulkSelection.length === 0) {
      alert("Please select at least one ticket to update.");
      return;
    }
    if (!bulkUpdateStatus) {
      alert("Please select a status to update.");
      return;
    }
    
    setBulkLoading(true);
    try {
      const body = { 
        status: bulkUpdateStatus,
        progress: getProgressForStatus(bulkUpdateStatus)
      };

      // We'll update each selected complaint sequentially
      for (let id of bulkSelection) {
        await apiFetch(`/complaints.php?id=${id}`, {
          method: 'PUT',
          body
        });
      }
      alert(`Successfully updated ${bulkSelection.length} tickets!`);
      setBulkSelection([]);
      setBulkUpdateStatus('');
      setShowBulkUpdateModal(false);
      fetchInitialData();
    } catch (e) {
      alert(e.message || 'Failed to apply bulk update');
    } finally {
      setBulkLoading(false);
    }
  };

  // --- Stats & Math ---
  const generatedComplaints = complaints.filter(c => c.ticket_id);
  const stats = {
    total: generatedComplaints.length,
    open: generatedComplaints.filter(c => c.status === 'ticket_generated').length,
    inProcess: generatedComplaints.filter(c => ['dept_assigned', 'officer_assigned', 'action_taken', 'ground_inspection'].includes(c.status)).length,
    resolved: generatedComplaints.filter(c => c.status === 'completed').length,
    escalated: Math.floor(generatedComplaints.length * 0.05), // Simulate 5% escalation
    
    // New global counts (both raw complaints and tickets)
    totalComplaints: complaints.length,
    ticketsGenerated: complaints.filter(c => c.ticket_id).length,
    pending: complaints.filter(c => c.status !== 'completed').length,
    solved: complaints.filter(c => c.status === 'completed').length
  };

  // Department-wise counts
  const deptPerformance = {};
  departments.forEach(d => {
    deptPerformance[d.name] = generatedComplaints.filter(c => c.department_id === d.id).length;
  });

  const wardAnalysis = {
    'Ward 01': generatedComplaints.filter(c => c.ward === 'Ward 01').length,
    'Ward 02': generatedComplaints.filter(c => c.ward === 'Ward 02').length,
    'Ward 03': generatedComplaints.filter(c => c.ward === 'Ward 03').length,
    'Ward 04': generatedComplaints.filter(c => c.ward === 'Ward 04').length
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'emergency': return <span className="pill pill-danger" style={{ fontSize: 11 }}>Emergency</span>;
      case 'high': return <span className="pill pill-orange" style={{ fontSize: 11 }}>High</span>;
      case 'medium': return <span className="pill pill-yellow" style={{ fontSize: 11 }}>Medium</span>;
      default: return <span className="pill pill-green" style={{ fontSize: 11 }}>Low</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'completed': return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Completed</span>;
      case 'ground_inspection': return <span style={{ background: '#cffafe', color: '#0e7490', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Ground Inspection</span>;
      case 'action_taken': return <span style={{ background: '#fef08a', color: '#854d0e', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Action Taken</span>;
      case 'officer_assigned': return <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Assigned (Officer)</span>;
      case 'dept_assigned': return <span style={{ background: '#faf5ff', color: '#7e22ce', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Assigned (Dept)</span>;
      case 'ticket_generated': return <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Ticket Generated</span>;
      case 'submitted': return <span style={{ background: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Submitted</span>;
      default: return <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Open</span>;
    }
  };

  const getModalComplaints = () => {
    switch (listModalType) {
      case 'total':
        return complaints;
      case 'generated':
        return complaints.filter(c => c.ticket_id);
      case 'pending':
        return complaints.filter(c => c.status !== 'completed');
      case 'solved':
        return complaints.filter(c => c.status === 'completed');
      default:
        return [];
    }
  };

  const getModalTitle = () => {
    switch (listModalType) {
      case 'total': return 'Total Registered Complaints';
      case 'generated': return 'Tickets Generated';
      case 'pending': return 'Pending Resolution';
      case 'solved': return 'Solved / Resolved Complaints';
      default: return '';
    }
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Sub Header Menu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>
            {viewMode === 'complaints' ? 'Grievance Complaints' : 'Ticket Control Desk'}
          </h1>
          <p style={{ margin: 0, color: 'var(--gray-500)' }}>
            {viewMode === 'complaints' 
              ? 'Review raw citizen complaints and raise official resolution tickets' 
              : 'Analyze generated tickets, assign officers, manage departments and escalation workflows'}
          </p>
        </div>
        
        {viewMode !== 'complaints' && (
          <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 12, padding: 4 }}>
            {(viewMode === 'tickets' 
              ? ['dashboard', 'complaints', 'bulk_update'] 
              : ['departments', 'officers', 'complaint_types']).map(tab => {
              let label = tab;
              if (tab === 'complaints') label = 'Tickets';
              if (tab === 'bulk_update') label = 'Bulk Update';
              if (tab === 'complaint_types') label = 'Complaint Types';
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    border: 'none',
                    background: activeTab === tab ? 'white' : 'none',
                    color: activeTab === tab ? 'var(--primary)' : 'var(--gray-600)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: activeTab === tab ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading Ticket Desk...</div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Counters */}
              <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                <div className="card bento-item" style={{ padding: 24, background: 'linear-gradient(135deg, var(--orange-50), white)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Total Tickets</span>
                    <Activity size={20} color="var(--primary)" />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--gray-900)' }}>{stats.total.toLocaleString()}</div>
                </div>

                <div className="card bento-item" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Open Complaints</span>
                    <ShieldAlert size={20} color="#ef4444" />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#ef4444' }}>{stats.open.toLocaleString()}</div>
                </div>

                <div className="card bento-item" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>In Process</span>
                    <Clock size={20} color="#3b82f6" />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#3b82f6' }}>{stats.inProcess.toLocaleString()}</div>
                </div>

                <div className="card bento-item" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Resolved</span>
                    <CheckCircle size={20} color="#16a34a" />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#16a34a' }}>{stats.resolved.toLocaleString()}</div>
                </div>

                <div className="card bento-item" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Escalated</span>
                    <AlertOctagon size={20} color="var(--primary)" />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)' }}>{stats.escalated.toLocaleString()}</div>
                </div>
              </div>

              {/* Performance and Ward Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: 24 }}>
                {/* Department Performance */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>Department Performance</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {Object.entries(deptPerformance).map(([name, count]) => (
                      <div key={name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{name}</span>
                          <span style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{count} Complaints</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`, 
                            height: '100%', 
                            background: 'var(--primary)',
                            borderRadius: 10
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ward Analysis */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>Area / Ward Analysis</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {Object.entries(wardAnalysis).map(([name, count]) => (
                      <div key={name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{name}</span>
                          <span style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{count} Complaints</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                            borderRadius: 10
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Escalation Workflow Diagram */}
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ margin: '0 0 24px', fontSize: 18 }}>Escalation Workflow</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                  {[
                    'Citizen Complaint', 'Assigned Officer', 'Junior Engineer', 
                    'Assistant Engineer', 'Executive Engineer', 'Department Head', 
                    'Jan Pratinidhi', 'Super Admin'
                  ].map((step, idx, arr) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        background: idx === arr.length - 2 ? 'var(--orange-50)' : 'white', 
                        border: idx === arr.length - 2 ? '2px solid var(--primary)' : '1.5px solid var(--gray-200)',
                        borderRadius: 12,
                        padding: '12px 18px',
                        fontSize: 13,
                        fontWeight: 700,
                        color: idx === arr.length - 2 ? 'var(--primary)' : 'var(--gray-700)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {step}
                      </div>
                      {idx < arr.length - 1 && (
                        <ChevronDown size={18} color="var(--gray-400)" style={{ transform: 'rotate(-90deg)' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Counters Grid */}
              <div className="bento-grid" style={{ 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: 20 
              }}>
                {/* Total Complaints */}
                <div 
                  className="card bento-item" 
                  onClick={() => setListModalType('total')}
                  onMouseEnter={() => setHoveredCard('total')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ 
                    padding: 20, 
                    background: 'linear-gradient(135deg, #eff6ff, white)', 
                    border: '1px solid #dbeafe', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transform: hoveredCard === 'total' ? 'translateY(-4px)' : 'none',
                    boxShadow: hoveredCard === 'total' ? '0 10px 25px rgba(59, 130, 246, 0.15)' : 'var(--shadow-sm)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Complaints</span>
                    <Activity size={20} color="#3b82f6" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#1e3a8a' }}>{stats.totalComplaints}</div>
                      <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 4, fontWeight: 600 }}>All user submissions</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setViewDetailsType('total'); }}
                      style={{ fontSize: 11, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >View Details</button>
                  </div>
                </div>

                {/* Tickets Generated */}
                <div 
                  className="card bento-item" 
                  onClick={() => setListModalType('generated')}
                  onMouseEnter={() => setHoveredCard('generated')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ 
                    padding: 20, 
                    background: 'linear-gradient(135deg, #fdf2f8, white)', 
                    border: '1px solid #fce7f3', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transform: hoveredCard === 'generated' ? 'translateY(-4px)' : 'none',
                    boxShadow: hoveredCard === 'generated' ? '0 10px 25px rgba(219, 39, 119, 0.15)' : 'var(--shadow-sm)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tickets Generated</span>
                    <Clipboard size={20} color="#db2777" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#831843' }}>{stats.ticketsGenerated}</div>
                      <div style={{ fontSize: 11, color: '#f472b6', marginTop: 4, fontWeight: 600 }}>Official tickets raised</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setViewDetailsType('generated'); }}
                      style={{ fontSize: 11, fontWeight: 700, background: '#fce7f3', color: '#be185d', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >View Details</button>
                  </div>
                </div>

                {/* Pending Resolution */}
                <div 
                  className="card bento-item" 
                  onClick={() => setListModalType('pending')}
                  onMouseEnter={() => setHoveredCard('pending')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ 
                    padding: 20, 
                    background: 'linear-gradient(135deg, #fff7ed, white)', 
                    border: '1px solid #ffedd5', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transform: hoveredCard === 'pending' ? 'translateY(-4px)' : 'none',
                    boxShadow: hoveredCard === 'pending' ? '0 10px 25px rgba(234, 88, 12, 0.15)' : 'var(--shadow-sm)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Complaints</span>
                    <Clock size={20} color="#ea580c" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#7c2d12' }}>{stats.pending}</div>
                      <div style={{ fontSize: 11, color: '#fb923c', marginTop: 4, fontWeight: 600 }}>Awaiting resolution</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setViewDetailsType('pending'); }}
                      style={{ fontSize: 11, fontWeight: 700, background: '#ffedd5', color: '#c2410c', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >View Details</button>
                  </div>
                </div>

                {/* Resolved Complaints */}
                <div 
                  className="card bento-item" 
                  onClick={() => setListModalType('solved')}
                  onMouseEnter={() => setHoveredCard('solved')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ 
                    padding: 20, 
                    background: 'linear-gradient(135deg, #f0fdf4, white)', 
                    border: '1px solid #dcfce7', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transform: hoveredCard === 'solved' ? 'translateY(-4px)' : 'none',
                    boxShadow: hoveredCard === 'solved' ? '0 10px 25px rgba(22, 163, 74, 0.15)' : 'var(--shadow-sm)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solved / Resolved</span>
                    <CheckCircle size={20} color="#16a34a" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#14532d' }}>{stats.solved}</div>
                      <div style={{ fontSize: 11, color: '#4ade80', marginTop: 4, fontWeight: 600 }}>Successfully closed</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setViewDetailsType('solved'); }}
                      style={{ fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >View Details</button>
                  </div>
                </div>
              </div>

              {/* Table Card - Premium UI */}
              <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                {/* Card Header with gradient */}
                <div style={{ background: viewMode === 'complaints' ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: viewMode === 'complaints' ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      <Clipboard size={18} color="white" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--gray-900)' }}>
                        {viewMode === 'complaints' ? 'Raw Grievance Complaints' : 'Grievance Ticket Desk'}
                      </h3>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                        {viewMode === 'complaints' ? 'Citizens submissions awaiting ticket generation' : 'Official tickets with resolution tracking'}
                      </p>
                    </div>
                  </div>
                  {/* Department filter */}
                  {viewMode !== 'complaints' && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        value={deptFilter}
                        onChange={e => setDeptFilter(e.target.value)}
                        style={{ height: 38, fontSize: 13, borderRadius: 10, padding: '0 12px', border: '1.5px solid #bfdbfe', background: 'white', color: 'var(--gray-700)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Filter Pills */}
                {viewMode !== 'complaints' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '14px 24px', background: '#fafbff', borderBottom: '1px solid var(--gray-100)' }}>
                    {[
                      { id: 'all', label: 'All Tickets', count: complaints.filter(c => c.ticket_id).length, color: '#3b82f6', bg: '#eff6ff', activeBg: '#3b82f6' },
                      { id: 'active', label: 'Active', count: complaints.filter(c => c.ticket_id && c.status !== 'completed').length, color: '#d97706', bg: '#fffbeb', activeBg: '#f59e0b' },
                      { id: 'completed', label: 'Completed', count: complaints.filter(c => c.status === 'completed').length, color: '#16a34a', bg: '#f0fdf4', activeBg: '#16a34a' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setComplaintFilter(f.id)}
                        style={{
                          padding: '7px 16px', fontSize: 13, borderRadius: 30, fontWeight: 700,
                          border: complaintFilter === f.id ? 'none' : `1.5px solid ${f.color}30`,
                          background: complaintFilter === f.id ? f.activeBg : f.bg,
                          color: complaintFilter === f.id ? 'white' : f.color,
                          cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        {f.label}
                        <span style={{ background: complaintFilter === f.id ? 'rgba(255,255,255,0.25)' : f.color + '18', color: complaintFilter === f.id ? 'white' : f.color, borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>{f.count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
                        {['Ticket ID', 'Complaint Info', 'Priority', 'Location / Ward', 'Department & Officer', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '13px 16px', fontSize: 11, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 48, fontSize: 14 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                              <Clipboard size={32} color="var(--gray-300)" />
                              <span>No complaints filed yet</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        (() => {
                          const filtered = complaints.filter(item => {
                            if (viewMode === 'complaints') {
                              return !item.ticket_id; // Show only complaints without ticket
                            } else {
                              if (!item.ticket_id) return false;
                              if (complaintFilter === 'active' && item.status === 'completed') return false;
                              if (complaintFilter === 'completed' && item.status !== 'completed') return false;
                              if (deptFilter !== 'all' && parseInt(item.department_id) !== parseInt(deptFilter)) return false;
                              return true;
                            }
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: 48 }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--gray-400)' }}>
                                    <Activity size={32} color="var(--gray-300)" />
                                    <span style={{ fontSize: 14 }}>{viewMode === 'complaints' ? 'No raw complaints waiting' : 'No tickets matching this filter'}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map((item, idx) => (
                            <tr key={item.id}
                              style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.15s', cursor: 'default' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                              onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafbfc'}
                            >
                              <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                                {item.ticket_id ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <span style={{ fontFamily: 'monospace', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#1e40af', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800, border: '1px solid #bfdbfe', letterSpacing: '0.3px' }}>
                                      {item.ticket_id}
                                    </span>
                                  </div>
                                ) : (
                                  <span style={{ color: '#c2410c', background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                                    <Clock size={10} /> No Ticket
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '14px 16px', maxWidth: 220 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.title}>{item.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Users size={10} /> Citizen #{item.citizen_id} &nbsp;·&nbsp; {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('en-IN') : ''}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>{getPriorityBadge(item.priority)}</td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
                                  <span style={{ background: '#fff1f2', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={10} color="#e11d48" /></span>
                                  {item.ward}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.address}>{item.address}</div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.department_name ? '#3b82f6' : '#d1d5db', display: 'inline-block', flexShrink: 0 }}></span>
                                  {item.department_name || 'Unassigned'}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3, paddingLeft: 12 }}>👷 {item.officer_name || 'No officer assigned'}</div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>{getStatusBadge(item.status)}</td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {item.ticket_id ? (
                                    <>
                                      <button
                                        onClick={() => handleOpenGrievanceModal(item)}
                                        style={{
                                          padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                          color: 'white', border: 'none', borderRadius: 8,
                                          boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                                          display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s', whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                      >
                                        <Edit size={11} /> Manage
                                      </button>
                                      <button
                                        onClick={() => { setStatusUpdateComplaint(item); setStatusRemark(''); setStatusActionTaken(''); }}
                                        style={{
                                          padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                          background: 'linear-gradient(135deg, #10b981, #059669)',
                                          color: 'white', border: 'none', borderRadius: 8,
                                          boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                                          display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s', whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                      >
                                        <Send size={11} /> Status Update
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenGrievanceModal(item)}
                                      style={{
                                        padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                        color: 'white', border: 'none', borderRadius: 8,
                                        boxShadow: '0 2px 8px rgba(234,88,12,0.3)',
                                        display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                    >
                                      <Plus size={11} /> Generate Ticket
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ));
                        })()
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
                <div className="card animate-fadeIn" style={{ padding: 24 }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Department Management</h3>
                    <button className="btn btn-primary" onClick={() => { setEditingDeptId(null); setDeptName(''); setDeptHead(''); setShowDeptModal(true); }}>
                      <Plus size={16} /> Add Department
                    </button>
                  </div>

                  <div className="table-wrapper" style={{ overflowX: 'auto', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Department Name</th>
                          <th>Head Officer</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map(dept => (
                          <tr key={dept.id}>
                            <td style={{ fontWeight: 600 }}>{dept.name}</td>
                            <td>{dept.head_officer || 'N/A'}</td>
                            <td>
                              <span className={`pill ${dept.status === 'active' ? 'pill-green' : 'pill-gray'}`} style={{ textTransform: 'capitalize' }}>
                                {dept.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: 6 }} 
                                  onClick={() => {
                                    setEditingDeptId(dept.id);
                                    setDeptName(dept.name);
                                    setDeptHead(dept.head_officer || '');
                                    setDeptStatus(dept.status);
                                    setShowDeptModal(true);
                                  }}
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: 6, color: 'var(--danger)' }}
                                  onClick={() => handleDeleteDept(dept.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

          {activeTab === 'officers' && (
                <div className="card animate-fadeIn" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Officer Directory</h3>
                    <button className="btn btn-primary" onClick={() => { setEditingOfficerId(null); setOfficerName(''); setOfficerDept(''); setOfficerDesg(''); setOfficerMobile(''); setShowOfficerModal(true); }}>
                      <UserPlus size={16} /> Add Officer
                    </button>
                  </div>

                  <div className="table-wrapper" style={{ overflowX: 'auto', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Officer Name</th>
                          <th>Department</th>
                          <th>Designation</th>
                          <th>Mobile</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {officers.map(off => (
                          <tr key={off.id}>
                            <td style={{ fontWeight: 600 }}>{off.name}</td>
                            <td>{off.department_name || 'N/A'}</td>
                            <td>{off.designation || 'N/A'}</td>
                            <td>{off.mobile || 'N/A'}</td>
                            <td>
                              <span className={`pill ${off.status === 'active' ? 'pill-green' : 'pill-gray'}`} style={{ textTransform: 'capitalize' }}>
                                {off.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: 6 }}
                                  onClick={() => {
                                    setEditingOfficerId(off.id);
                                    setOfficerName(off.name);
                                    setOfficerDept(off.department_id || '');
                                    setOfficerDesg(off.designation || '');
                                    setOfficerMobile(off.mobile || '');
                                    setOfficerStatus(off.status);
                                    setShowOfficerModal(true);
                                  }}
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: 6, color: 'var(--danger)' }}
                                  onClick={() => handleDeleteOfficer(off.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

          {activeTab === 'bulk_update' && (
                <div className="card animate-fadeIn" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Bulk Ticket Update</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <select className="form-control" style={{ width: 'auto' }} value={bulkFilterDepartment} onChange={e => setBulkFilterDepartment(e.target.value)}>
                        <option value="">Filter by Department...</option>
                        {departments.filter(d => d.status === 'active').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <select className="form-control" style={{ width: 'auto' }} value={bulkFilterOfficer} onChange={e => setBulkFilterOfficer(e.target.value)}>
                        <option value="">Filter by Officer...</option>
                        {officers.filter(o => o.status === 'active' && (!bulkFilterDepartment || o.department_id == bulkFilterDepartment)).map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                      <button 
                        className="btn btn-primary"
                        disabled={bulkSelection.length === 0}
                        onClick={() => setShowBulkUpdateModal(true)}
                      >
                        Apply Bulk Update ({bulkSelection.length})
                      </button>
                    </div>
                  </div>

                  <div className="table-wrapper" style={{ overflowX: 'auto', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', maxHeight: 500 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>
                            <input 
                              type="checkbox" 
                              onChange={(e) => {
                                const filteredComplaints = complaints.filter(c => {
                                  if (c.status === 'completed') return false;
                                  if (bulkFilterDepartment && c.department_id != bulkFilterDepartment) return false;
                                  if (bulkFilterOfficer && c.assigned_officer_id != bulkFilterOfficer) return false;
                                  return true;
                                });
                                if (e.target.checked) {
                                  setBulkSelection(filteredComplaints.map(c => c.id));
                                } else {
                                  setBulkSelection([]);
                                }
                              }}
                              checked={bulkSelection.length > 0 && 
                                       bulkSelection.length === complaints.filter(c => {
                                         if (c.status === 'completed') return false;
                                         if (bulkFilterDepartment && c.department_id != bulkFilterDepartment) return false;
                                         if (bulkFilterOfficer && c.assigned_officer_id != bulkFilterOfficer) return false;
                                         return true;
                                       }).length}
                            />
                          </th>
                          <th>Ticket ID</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Progress</th>
                          <th>Current Dept</th>
                          <th>Current Officer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.filter(c => {
                          if (c.status === 'completed') return false;
                          if (bulkFilterDepartment && c.department_id != bulkFilterDepartment) return false;
                          if (bulkFilterOfficer && c.assigned_officer_id != bulkFilterOfficer) return false;
                          return true;
                        }).map(comp => {
                          const prog = getProgressForStatus(comp.status);
                          return (
                            <tr key={comp.id}>
                              <td>
                                <input 
                                  type="checkbox" 
                                  checked={bulkSelection.includes(comp.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setBulkSelection([...bulkSelection, comp.id]);
                                    } else {
                                      setBulkSelection(bulkSelection.filter(id => id !== comp.id));
                                    }
                                  }}
                                />
                              </td>
                              <td style={{ fontWeight: 600 }}>{comp.ticket_id || 'N/A'}</td>
                              <td>{comp.category}</td>
                              <td>{getStatusBadge(comp.status)}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ flex: 1, height: 6, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
                                    <div style={{ height: '100%', width: `${prog}%`, background: getColorForProgress(prog), transition: 'all 0.3s' }}></div>
                                  </div>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: getColorForProgress(prog) }}>{prog}%</span>
                                </div>
                              </td>
                              <td>{comp.department_name || 'N/A'}</td>
                              <td>{comp.officer_name || 'N/A'}</td>
                            </tr>
                          );
                        })}
                        {complaints.filter(c => {
                          if (c.status === 'completed') return false;
                          if (bulkFilterDepartment && c.department_id != bulkFilterDepartment) return false;
                          if (bulkFilterOfficer && c.assigned_officer_id != bulkFilterOfficer) return false;
                          return true;
                        }).length === 0 && (
                          <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No pending tickets found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

          {activeTab === 'complaint_types' && (
            <div className="card animate-fadeIn" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Complaint Types Management</h3>
                <button className="btn btn-primary" onClick={() => { setEditingComplaintTypeId(null); setComplaintTypeName(''); setComplaintTypeDept(''); setShowComplaintTypeModal(true); }}>
                  <Plus size={16} /> Add Complaint Type
                </button>
              </div>

              <div className="table-wrapper" style={{ overflowX: 'auto', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Complaint Type Name</th>
                      <th>Mapped Department</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaintTypes.map(ct => {
                      const dept = departments.find(d => d.id === ct.department_id);
                      return (
                        <tr key={ct.id}>
                          <td style={{ fontWeight: 600 }}>{ct.name}</td>
                          <td>{dept ? dept.name : 'N/A'}</td>
                          <td>
                            <span className={`pill ${ct.status === 'active' ? 'pill-green' : 'pill-gray'}`} style={{ textTransform: 'capitalize' }}>
                              {ct.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: 6 }} 
                                onClick={() => {
                                  setEditingComplaintTypeId(ct.id);
                                  setComplaintTypeName(ct.name);
                                  setComplaintTypeDept(ct.department_id || '');
                                  setComplaintTypeStatus(ct.status);
                                  setShowComplaintTypeModal(true);
                                }}
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: 6, color: 'var(--danger)' }}
                                onClick={() => handleDeleteComplaintType(ct.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="card animate-fadeIn" style={{ padding: 32 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>Dynamic Master Configuration Checklist</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {[
                  'Departments Setup', 'Complaint Categories', 'Complaint Sub Categories',
                  'Wards Setup', 'Areas Definition', 'Districts Setup', 'States config',
                  'Officers Master', 'Designations Master', 'SLA Policy Rules',
                  'Escalation Matrix Rules', 'Notification Templates'
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: '#fafafa', borderRadius: 12, border: '1.5px solid var(--gray-200)' }}>
                    <div style={{ width: 24, height: 24, background: '#dcfce7', borderRadius: '50%', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* UPDATE COMPLAINT MODAL */}
      {selectedComplaint && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 500, padding: 32, position: 'relative' }}>
            <h3 style={{ margin: '0 0 20px' }}>
              {selectedComplaint.ticket_id ? `Manage Ticket: ${selectedComplaint.ticket_id}` : 'Raise Ticket for Complaint'}
            </h3>
            
            <form onSubmit={handleUpdateGrievance} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Assign Department *</label>
                <select 
                  className="form-control"
                  value={updateDepartment}
                  onChange={e => {
                    setUpdateDepartment(e.target.value);
                    setUpdateOfficer(''); // reset officer when department changes
                  }}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Department Officer</label>
                <select 
                  className="form-control"
                  value={updateOfficer}
                  onChange={e => setUpdateOfficer(e.target.value)}
                >
                  <option value="">Select Officer (Awaiting Officer Assignment)</option>
                  {officers.filter(o => o.department_id === parseInt(updateDepartment)).map(off => (
                    <option key={off.id} value={off.id}>{off.name} ({off.designation})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resolution Progress ({updateProgress}%)</label>
                <input 
                  type="range" 
                  min="0" max="100" step="5"
                  value={updateProgress}
                  onChange={e => setUpdateProgress(parseInt(e.target.value))}
                  style={{ width: '100%', margin: '8px 0' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ticket Status</label>
                <select 
                  className="form-control"
                  value={updateStatus}
                  onChange={e => {
                    const newStatus = e.target.value;
                    setUpdateStatus(newStatus);
                    const newProg = getProgressForStatus(newStatus);
                    if (newProg > 0) setUpdateProgress(newProg);
                  }}
                >
                  <option value="submitted">Submitted (Under Review)</option>
                  <option value="ticket_generated">Ticket Generated</option>
                  <option value="dept_assigned">Assigned To Dept</option>
                  <option value="officer_assigned">Assigned To Officer</option>
                  <option value="action_taken">Action Taken</option>
                  <option value="ground_inspection">Ground Inspection</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Completion Date</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={updateExpectedDate}
                  onChange={e => setUpdateExpectedDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Add Remark (Optional)</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  placeholder="Enter any note or remark for the citizen..."
                  value={updateRemark}
                  onChange={e => setUpdateRemark(e.target.value)}
                />
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>This remark will be visible to the citizen on their timeline.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedComplaint(null)} disabled={updatingGrievance}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    background: selectedComplaint.ticket_id ? undefined : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
                    borderColor: selectedComplaint.ticket_id ? undefined : '#ea580c' 
                  }} 
                  disabled={updatingGrievance}
                >
                  {updatingGrievance ? 'Processing...' : (selectedComplaint.ticket_id ? 'Save Updates' : 'Raise Ticket')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS UPDATE MODAL */}
      {statusUpdateComplaint && (
        <div
          className="modal-overlay"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(10px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, padding: 16 }}
          onClick={() => setStatusUpdateComplaint(null)}
        >
          <div
            className="card animate-slideUp"
            style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', padding: 0, borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Bell size={18} color="white" />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Citizen Status Update</span>
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'white' }}>Send Status to Citizen</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Ticket: {statusUpdateComplaint.ticket_id}</p>
              </div>
              <button
                onClick={() => setStatusUpdateComplaint(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold', flexShrink: 0 }}
              >&#x2715;</button>
            </div>

            {/* Scrollable Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Complaint Info */}
              <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px 20px', border: '1.5px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Complaint Details</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--gray-900)', marginBottom: 8 }}>{statusUpdateComplaint.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-600)' }}><MapPin size={12} color="#e11d48" /> {statusUpdateComplaint.ward}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-600)' }}><Users size={12} color="#6366f1" /> Citizen #{statusUpdateComplaint.citizen_id}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-600)' }}><Building2 size={12} color="#3b82f6" /> {statusUpdateComplaint.department_name || 'Dept: Unassigned'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-600)' }}>Officer: {statusUpdateComplaint.officer_name || 'Unassigned'}</span>
                </div>
              </div>

              {/* Current Status + Progress */}
              <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px 20px', border: '1.5px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Current Status</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>{getStatusBadge(statusUpdateComplaint.status)}</div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--gray-700)' }}>{statusUpdateProgress}% Complete</span>
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  className="form-range"
                  value={statusUpdateProgress}
                  onChange={e => setStatusUpdateProgress(parseInt(e.target.value))}
                  style={{ width: '100%', marginBottom: 10, accentColor: '#10b981' }}
                />

                {/* Status Timeline */}
                <div style={{ display: 'flex', marginTop: 20, justifyContent: 'space-between' }}>
                  {[
                    { label: 'Submitted', key: 'submitted' },
                    { label: 'Ticket', key: 'ticket_generated' },
                    { label: 'Dept', key: 'dept_assigned' },
                    { label: 'Officer', key: 'officer_assigned' },
                    { label: 'Action', key: 'action_taken' },
                    { label: 'Inspection', key: 'ground_inspection' },
                    { label: 'Completed', key: 'completed' }
                  ].map((step, idx, arr) => {
                    const order = ['submitted', 'ticket_generated', 'dept_assigned', 'officer_assigned', 'action_taken', 'ground_inspection', 'completed'];
                    const currentIdx = order.indexOf(statusUpdateComplaint.status);
                    const stepIdx = order.indexOf(step.key);
                    const isDone = stepIdx <= currentIdx;
                    return (
                      <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                        {idx < arr.length - 1 && (
                          <div style={{ position: 'absolute', top: 10, left: '50%', right: '-50%', height: 3, background: isDone && stepIdx < currentIdx ? '#10b981' : '#e2e8f0', zIndex: 0 }}></div>
                        )}
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: isDone ? '#10b981' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, border: isDone ? '3px solid #d1fae5' : '3px solid #f1f5f9', boxSizing: 'border-box' }}>
                          {isDone && <Check size={12} color="white" />}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: isDone ? '#059669' : 'var(--gray-400)', marginTop: 5, textAlign: 'center', lineHeight: 1.2 }}>{step.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Taken */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                  <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                  Department Action Taken
                </label>
                <input
                  type="text"
                  placeholder="e.g. Site inspection done, work order issued, materials ordered..."
                  value={statusActionTaken}
                  onChange={e => setStatusActionTaken(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: 'var(--gray-800)', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Message to Citizen */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                  <MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                  Message to Citizen <span style={{ color: '#10b981' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Write a message for the citizen explaining current status and progress..."
                  value={statusRemark}
                  onChange={e => setStatusRemark(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: 'var(--gray-800)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6, background: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--gray-400)' }}>This message will be visible to citizen on their complaint dashboard.</p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafcff', flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Bell size={12} /> Citizen will be notified on update
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setStatusUpdateComplaint(null)} disabled={statusUpdateLoading}>
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!statusRemark.trim()) { alert('Please write a message for the citizen'); return; }
                    setStatusUpdateLoading(true);
                    try {
                      await apiFetch(`/complaints.php?id=${statusUpdateComplaint.id}`, {
                        method: 'PUT',
                        body: {
                          status: statusUpdateComplaint.status,
                          progress: statusUpdateProgress,
                          assigned_officer_id: statusUpdateComplaint.assigned_officer_id || null,
                          department_id: statusUpdateComplaint.department_id || null,
                          expected_completion_date: statusUpdateComplaint.expected_completion_date || null,
                          action_taken: statusActionTaken,
                          admin_remark: statusRemark
                        }
                      });
                      alert('Status update sent to citizen successfully!');
                      setStatusUpdateComplaint(null);
                      fetchInitialData();
                    } catch (e) {
                      alert(e.message || 'Failed to send update');
                    } finally {
                      setStatusUpdateLoading(false);
                    }
                  }}
                  disabled={statusUpdateLoading || !statusRemark.trim()}
                  style={{
                    padding: '10px 24px', fontSize: 13, fontWeight: 800,
                    cursor: statusUpdateLoading || !statusRemark.trim() ? 'not-allowed' : 'pointer',
                    background: statusUpdateLoading || !statusRemark.trim() ? '#d1d5db' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white', border: 'none', borderRadius: 10,
                    boxShadow: !statusRemark.trim() ? 'none' : '0 4px 14px rgba(16,185,129,0.35)',
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                  }}
                >
                  <Send size={14} /> {statusUpdateLoading ? 'Sending...' : 'Send Update to Citizen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 450, padding: 32 }}>
            <h3 style={{ margin: '0 0 20px' }}>{editingDeptId ? 'Edit Department' : 'Add New Department'}</h3>
            <form onSubmit={handleSaveDept} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Department Name *</label>
                <input type="text" className="form-control" value={deptName} onChange={e => setDeptName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Head Officer Name</label>
                <input type="text" className="form-control" value={deptHead} onChange={e => setDeptHead(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={deptStatus} onChange={e => setDeptStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeptModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICER MODAL */}
      {showOfficerModal && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 450, padding: 32 }}>
            <h3 style={{ margin: '0 0 20px' }}>{editingOfficerId ? 'Edit Officer' : 'Add New Officer'}</h3>
            <form onSubmit={handleSaveOfficer} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Officer Name *</label>
                <input type="text" className="form-control" value={officerName} onChange={e => setOfficerName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select className="form-control" value={officerDept} onChange={e => setOfficerDept(e.target.value)} required>
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input type="text" className="form-control" value={officerDesg} onChange={e => setOfficerDesg(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input type="tel" className="form-control" value={officerMobile} onChange={e => setOfficerMobile(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={officerStatus} onChange={e => setOfficerStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOfficerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Officer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED TABLE VIEW MODAL (View Details button on cards) */}
      {showComplaintTypeModal && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, background: 'rgba(0,0,0,0.5)' }}>
          <div className="card animate-slideUp" style={{ width: 400, padding: 24 }}>
            <h3 style={{ margin: '0 0 20px' }}>{editingComplaintTypeId ? 'Edit Complaint Type' : 'Add Complaint Type'}</h3>
            <form onSubmit={handleSaveComplaintType}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Type Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={complaintTypeName}
                  onChange={e => setComplaintTypeName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Map to Department</label>
                <select 
                  className="form-control" 
                  value={complaintTypeDept}
                  onChange={e => setComplaintTypeDept(e.target.value)}
                >
                  <option value="">Select Department (Optional)...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Status</label>
                <select 
                  className="form-control" 
                  value={complaintTypeStatus}
                  onChange={e => setComplaintTypeStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowComplaintTypeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Type</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK UPDATE STATUS MODAL */}
      {showBulkUpdateModal && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, background: 'rgba(0,0,0,0.5)' }}>
          <div className="card animate-slideUp" style={{ width: 450, padding: 32 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 20 }}>Update Status for Selected Tickets</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>
              You have selected {bulkSelection.length} tickets to update. This will also update their Resolution Progress on the citizen portal.
            </p>
            
            <form onSubmit={handleBulkUpdate}>
              <div className="form-group" style={{ marginBottom: 30 }}>
                <label style={{ display: 'block', marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Select New Phase Status</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { value: 'ticket_generated', label: 'Ticket Generated', prog: 10 },
                    { value: 'dept_assigned', label: 'Assigned to Department', prog: 30 },
                    { value: 'officer_assigned', label: 'Assigned to Officer', prog: 50 },
                    { value: 'action_taken', label: 'Action Taken', prog: 70 },
                    { value: 'ground_inspection', label: 'Ground Inspection', prog: 90 },
                    { value: 'completed', label: 'Completed', prog: 100 }
                  ].map(phase => (
                    <label key={phase.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: bulkUpdateStatus === phase.value ? `2px solid ${getColorForProgress(phase.prog)}` : '1px solid var(--gray-200)', borderRadius: 8, cursor: 'pointer', background: bulkUpdateStatus === phase.value ? `${getColorForProgress(phase.prog)}10` : 'white', transition: 'all 0.2s' }}>
                      <input 
                        type="radio" 
                        name="bulkStatusRadio" 
                        value={phase.value} 
                        checked={bulkUpdateStatus === phase.value} 
                        onChange={e => setBulkUpdateStatus(e.target.value)}
                        style={{ margin: 0, accentColor: getColorForProgress(phase.prog) }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 15 }}>{phase.label}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: getColorForProgress(phase.prog), background: 'white', padding: '2px 8px', borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {phase.prog}%
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkUpdateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={bulkLoading || !bulkUpdateStatus}>
                  {bulkLoading ? 'Updating...' : `Confirm Update`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED TABLE VIEW MODAL (View Details button on cards) */}
      {viewDetailsType && (() => {
        const detailsData = {
          total: { title: 'Total Registered Complaints', items: complaints, color: '#1d4ed8', bg: '#dbeafe' },
          generated: { title: 'Tickets Generated', items: complaints.filter(c => c.ticket_id), color: '#be185d', bg: '#fce7f3' },
          pending: { title: 'Pending / Unresolved Complaints', items: complaints.filter(c => c.status !== 'completed'), color: '#c2410c', bg: '#ffedd5' },
          solved: { title: 'Solved / Resolved Complaints', items: complaints.filter(c => c.status === 'completed'), color: '#15803d', bg: '#dcfce7' },
        };
        const det = detailsData[viewDetailsType];
        return (
          <div
            className="modal-overlay"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(10px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, padding: 20 }}
            onClick={() => setViewDetailsType(null)}
          >
            <div
              className="card animate-slideUp"
              style={{ width: '100%', maxWidth: 900, maxHeight: '88vh', padding: 0, position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', border: '1px solid var(--gray-200)', overflow: 'hidden', borderRadius: 16 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: det.bg, flexShrink: 0 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: det.color }}>{det.title}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--gray-600)' }}>Total {det.items.length} records found</p>
                </div>
                <button
                  onClick={() => setViewDetailsType(null)}
                  style={{ background: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: 18, color: 'var(--gray-600)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.target.style.background = 'white'}
                >✕</button>
              </div>

              {/* Table */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '0 0 8px' }}>
                {det.items.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray-400)', fontSize: 15 }}>No records found in this category.</div>
                ) : (
                  <table className="table" style={{ margin: 0 }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                      <tr>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>Ticket ID</th>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)' }}>Complaint Title</th>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>Category</th>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>Priority</th>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>Ward</th>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>Department</th>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>Status</th>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>Date</th>
                        <th style={{ padding: '14px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--gray-500)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {det.items.map((comp, idx) => (
                        <tr key={comp.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-400)', fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            {comp.ticket_id ? (
                              <span style={{ fontFamily: 'monospace', background: 'var(--gray-100)', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, color: 'var(--gray-800)' }}>{comp.ticket_id}</span>
                            ) : (
                              <span style={{ background: '#fff7ed', color: '#c2410c', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: '1px solid #ffedd5' }}>No Ticket</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', maxWidth: 200 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={comp.title}>{comp.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>Citizen #{comp.citizen_id}</div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{comp.category || '—'}</td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{getPriorityBadge(comp.priority)}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', whiteSpace: 'nowrap' }}>{comp.ward || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-700)', whiteSpace: 'nowrap' }}>{comp.department_name || 'Unassigned'}</td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{getStatusBadge(comp.status)}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{comp.submitted_at ? new Date(comp.submitted_at).toLocaleDateString('en-IN') : '—'}</td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '5px 12px', fontSize: 12, background: comp.ticket_id ? undefined : 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none', fontWeight: 700 }}
                              onClick={() => { setViewDetailsType(null); handleOpenGrievanceModal(comp); }}
                            >
                              {comp.ticket_id ? 'Manage' : 'Generate Ticket'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 28px', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'flex-end', background: 'white', flexShrink: 0 }}>
                <button className="btn btn-secondary" onClick={() => setViewDetailsType(null)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* POPUP COMPLAINTS LIST MODAL */}
      {listModalType && (
        <div 
          className="modal-overlay" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: 20
          }}
          onClick={() => setListModalType(null)}
        >
          <div 
            className="card animate-slideUp" 
            style={{ 
              width: '100%', 
              maxWidth: 800, 
              maxHeight: '85vh',
              padding: 28, 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--gray-200)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--gray-200)', paddingBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, color: 'var(--gray-900)' }}>{getModalTitle()}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--gray-500)' }}>Showing {getModalComplaints().length} items matching this status</p>
              </div>
              <button 
                onClick={() => setListModalType(null)}
                style={{
                  background: 'var(--gray-100)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: 'var(--gray-600)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.target.style.background = 'var(--gray-200)'}
                onMouseLeave={e => e.target.style.background = 'var(--gray-100)'}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {getModalComplaints().length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                  No complaints found in this category.
                </div>
              ) : (
                getModalComplaints().map(comp => (
                  <div 
                    key={comp.id}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      border: '1.5px solid var(--gray-100)',
                      background: 'var(--gray-50)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, background: comp.ticket_id ? 'var(--gray-200)' : '#ffedd5', color: comp.ticket_id ? 'var(--gray-700)' : '#c2410c', padding: '2px 8px', borderRadius: 4 }}>
                          {comp.ticket_id || 'AWAITING TICKET'}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>
                          Ward: {comp.ward}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-800)', textAlign: 'left' }}>
                        {comp.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', gap: 12 }}>
                        <span>Category: <strong>{comp.category}</strong></span>
                        <span>Date: <strong>{new Date(comp.submitted_at).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {getStatusBadge(comp.status)}
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{
                          padding: '6px 12px',
                          fontSize: 12,
                          background: comp.ticket_id ? undefined : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          border: 'none',
                          color: 'white',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setListModalType(null); // Close popup list modal
                          handleOpenGrievanceModal(comp); // Open update grievance modal
                        }}
                      >
                        {comp.ticket_id ? 'Manage' : 'Generate Ticket'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setListModalType(null)}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
