import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusCircle, FileText, MapPin, Phone, Clock, AlertTriangle, 
  CheckCircle, ChevronRight, Upload, Video, Navigation, ShieldAlert,
  ArrowLeft, CheckSquare, Bell
} from 'lucide-react';

export default function CitizenGrievance() {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'new', 'notifications'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [subCategories, setSubCategories] = useState([]);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || '');
  const [gpsSimulated, setGpsSimulated] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [ward, setWard] = useState('Ward 01');

  const categories = {
    'Water Supply': ['Water Leakage', 'No Water Supply', 'Contaminated Water', 'Low Pressure'],
    'Roads & Infrastructure': ['Potholes', 'Broken Street Lights', 'Road Blockage', 'Footpath Damaged'],
    'Electricity': ['Power Outage', 'Transformer Issue', 'Sparking Wires', 'New connection query'],
    'Sanitation & Solid Waste': ['Garbage Overflow', 'No Door-to-Door Collection', 'Dead Animal Disposal'],
    'Sewer & Drainage': ['Drain Clogged', 'Sewer Overflow', 'Missing Manhole Cover']
  };

  useEffect(() => {
    fetchComplaints();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (category) {
      setSubCategories(categories[category] || []);
      setSubCategory('');
    } else {
      setSubCategories([]);
    }
  }, [category]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/complaints.php');
      setComplaints(data || []);
    } catch (e) {
      console.error('Failed to fetch complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/notifications.php');
      const list = data || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.is_read).length);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  const fetchSingleComplaint = async (id) => {
    try {
      const data = await apiFetch(`/complaints.php?id=${id}`);
      setSelectedComplaint(data);
    } catch (e) {
      console.error('Failed to fetch complaint details:', e);
    }
  };

  const handleSimulateGPS = () => {
    setSubmitting(true);
    setTimeout(() => {
      setLat((27.2415 + (Math.random() - 0.5) * 0.02).toFixed(6));
      setLng((94.1032 + (Math.random() - 0.5) * 0.02).toFixed(6));
      setGpsSimulated(true);
      setSubmitting(false);
    }, 800);
  };

  const handleViewNotifications = async () => {
    setActiveTab('notifications');
    setSelectedComplaint(null);
    try {
      // Mark all as read
      await apiFetch('/notifications.php', { method: 'PUT' });
      setUnreadCount(0);
      fetchNotifications();
    } catch (e) {
      console.error('Failed to mark notifications as read:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || !address || !description || !contactNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title,
        category,
        sub_category: subCategory,
        priority,
        address,
        description,
        contact_number: contactNumber,
        location_lat: lat,
        location_lng: lng,
        ward
      };

      const result = await apiFetch('/complaints.php', {
        method: 'POST',
        body
      });

      if (result && result.id) {
        alert('Complaint Logged Successfully! Admin will review it and raise a ticket soon.');
        setTitle('');
        setCategory('');
        setSubCategory('');
        setPriority('medium');
        setAddress('');
        setDescription('');
        setGpsSimulated(false);
        setLat('');
        setLng('');
        setWard('Ward 01');
        
        fetchComplaints();
        setActiveTab('list');
      }
    } catch (e) {
      alert(e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'emergency': return { bg: '#fee2e2', text: '#ef4444', border: '#fca5a5' };
      case 'high': return { bg: '#ffedd5', text: '#f97316', border: '#fed7aa' };
      case 'medium': return { bg: '#fef9c3', text: '#ca8a04', border: '#fef08a' };
      default: return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
    }
  };

  const getStatusLabel = (s) => {
    switch (s) {
      case 'completed': return 'Completed';
      case 'ground_inspection': return 'Ground Inspection';
      case 'action_taken': return 'Action Taken';
      case 'officer_assigned': return 'Assigned to Officer';
      case 'dept_assigned': return 'Assigned to Department';
      case 'ticket_generated': return 'Ticket Generated';
      default: return 'Under Review';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'completed': return { bg: '#dcfce7', text: '#15803d' };
      case 'ground_inspection': return { bg: '#cffafe', text: '#0e7490' };
      case 'action_taken': return { bg: '#fef08a', text: '#854d0e' };
      case 'officer_assigned': return { bg: '#e0e7ff', text: '#4338ca' };
      case 'dept_assigned': return { bg: '#faf5ff', text: '#7e22ce' };
      case 'ticket_generated': return { bg: '#f3f4f6', text: '#4b5563' };
      default: return { bg: '#fff7ed', text: '#c2410c' }; // Orange for under review/submitted
    }
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>Grievance Desk</h1>
          <p style={{ margin: 0, color: 'var(--gray-500)' }}>Lodge complaints and track status updates directly with the Jan Pratinidhi</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('list'); setSelectedComplaint(null); }}
          >
            <FileText size={16} /> My Complaints ({complaints.length})
          </button>
          
          <button 
            className={`btn ${activeTab === 'new' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('new')}
          >
            <PlusCircle size={16} /> Lodge Complaint
          </button>

          <button 
            className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleViewNotifications}
            style={{ position: 'relative' }}
          >
            <Bell size={16} /> Notifications
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: '#ef4444',
                color: 'white',
                fontSize: 10,
                fontWeight: 900,
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="card animate-slideUp" style={{ padding: 32 }}>
          <div className="card-header" style={{ marginBottom: 24, borderBottom: '1px solid var(--gray-200)', paddingBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>Lodge New Complaint</h3>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Complaint Title *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Broken water pipe in Lane 3"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ward / Area *</label>
                <select 
                  className="form-control"
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  required
                >
                  <option value="Ward 01">Ward 01 - North Ronganadi</option>
                  <option value="Ward 02">Ward 02 - South Ronganadi</option>
                  <option value="Ward 03">Ward 03 - East Ronganadi</option>
                  <option value="Ward 04">Ward 04 - West Ronganadi</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Complaint Category *</label>
                <select 
                  className="form-control"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {Object.keys(categories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sub-Category</label>
                <select 
                  className="form-control"
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  disabled={!category}
                >
                  <option value="">Select Sub-Category</option>
                  {subCategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  {['low', 'medium', 'high', 'emergency'].map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, textTransform: 'capitalize' }}>
                      <input 
                        type="radio" 
                        name="priority"
                        value={p}
                        checked={priority === p}
                        onChange={() => setPriority(p)}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GPS Location Detect</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleSimulateGPS}
                    style={{ flexShrink: 0 }}
                  >
                    <Navigation size={16} /> Auto Detect Location
                  </button>
                  {gpsSimulated && (
                    <div style={{ fontSize: 13, background: 'var(--orange-50)', border: '1.5px solid var(--primary)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600 }}>
                      📍 {lat}, {lng}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Mobile Number *</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="e.g. 98XXXXXXXX"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Address / Landmark *</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="e.g. Near Shiv Mandir, Lane 3, House No. 24"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description of Problem *</label>
              <textarea 
                className="form-control" 
                rows="4" 
                placeholder="Describe your concern here..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, borderTop: '1px solid var(--gray-200)', paddingTop: 20 }}>
              <div style={{ padding: '16px', border: '2px dashed var(--gray-300)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Upload size={24} color="var(--gray-400)" />
                <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>Upload Photo</span>
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Max size 5MB (Optional)</span>
              </div>
              <div style={{ padding: '16px', border: '2px dashed var(--gray-300)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Video size={24} color="var(--gray-400)" />
                <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>Upload Video</span>
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Max size 15MB (Optional)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-lg" 
                onClick={() => setActiveTab('list')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg" 
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'list' && !selectedComplaint && (
        <div className="animate-fadeIn">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading your tickets...</div>
          ) : complaints.length === 0 ? (
            <div className="card" style={{ padding: 60, textAlign: 'center' }}>
              <ShieldAlert size={48} color="var(--gray-300)" style={{ marginBottom: 16 }} />
              <h3>No Tickets Generated</h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>You have not submitted any complaints yet. Feel free to register one if you face any issues in your locality.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('new')} style={{ margin: '0 auto' }}>
                <PlusCircle size={16} /> Lodge Complaint
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {complaints.map(item => {
                const prio = getPriorityColor(item.priority);
                const stat = getStatusColor(item.status);
                return (
                  <div 
                    key={item.id} 
                    className="card bento-item"
                    style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--gray-200)' }}
                    onClick={() => { setSelectedComplaint(item); fetchSingleComplaint(item.id); }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: item.ticket_id ? 'var(--gray-500)' : '#f97316', background: item.ticket_id ? 'var(--gray-100)' : '#ffedd5', padding: '4px 10px', borderRadius: 8 }}>
                          {item.ticket_id || 'Awaiting Review (No Ticket yet)'}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase', backgroundColor: prio.bg, color: prio.text, border: `1.5px solid ${prio.border}` }}>
                          {item.priority}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-500)' }}>
                        <Clock size={14} /> Submitted on {new Date(item.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h3 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--gray-900)' }}>{item.title}</h3>
                    <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--gray-600)' }}>{item.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: 14 }}>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                          Category: <strong style={{ color: 'var(--gray-800)' }}>{item.category}</strong>
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                          Dept: <strong style={{ color: 'var(--gray-800)' }}>{item.department_name || 'Unassigned'}</strong>
                        </span>
                        {item.officer_name && (
                          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                            Officer: <strong style={{ color: 'var(--gray-800)' }}>{item.officer_name}</strong>
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 20, backgroundColor: stat.bg, color: stat.text }}>
                          {getStatusLabel(item.status)}
                        </span>
                        <ChevronRight size={18} color="var(--gray-400)" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card animate-slideUp" style={{ padding: 28 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>My Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  style={{
                    padding: 16,
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 12,
                    background: n.is_read ? 'white' : 'var(--orange-50)',
                    borderColor: n.is_read ? 'var(--gray-200)' : 'var(--primary)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-800)' }}>Ticket: {n.ticket_id}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.5 }}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedComplaint && (
        <div className="animate-fadeIn">
          {/* Back Button */}
          <button 
            className="btn btn-secondary" 
            onClick={() => setSelectedComplaint(null)} 
            style={{ marginBottom: 20 }}
          >
            <ArrowLeft size={16} /> Back to My Complaints
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '3fr 2fr' : '1fr', gap: 24 }}>
            {/* Left: Ticket details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--gray-200)', paddingBottom: 16, marginBottom: 20 }}>
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ticket Details</span>
                    <h2 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800 }}>{selectedComplaint.ticket_id || 'Awaiting Review'}</h2>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 20, backgroundColor: getStatusColor(selectedComplaint.status).bg, color: getStatusColor(selectedComplaint.status).text }}>
                    {getStatusLabel(selectedComplaint.status)}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Date Submitted</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>
                      {new Date(selectedComplaint.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Ticket Generated</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>
                      {(() => {
                        let date = selectedComplaint.ticket_generated_at;
                        if (!date && selectedComplaint.ticket_id) {
                          const event = selectedComplaint.timeline?.find(t => t.status_event === 'Ticket Generated' || t.status_event === 'Assigned To Department');
                          if (event) date = event.created_at;
                        }
                        return date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Awaiting Review';
                      })()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Department Assigned</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>
                      {selectedComplaint.department_name || 'Awaiting Admin Review'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Assigned Officer</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>
                      {selectedComplaint.officer_name || 'Under Review'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Officer Contact</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {selectedComplaint.officer_mobile ? (
                        <><Phone size={14} /> {selectedComplaint.officer_mobile}</>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Title</div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>{selectedComplaint.title}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
                    <div style={{ fontSize: 15, color: 'var(--gray-700)', lineHeight: 1.6 }}>{selectedComplaint.description}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Address / Location</div>
                    <div style={{ fontSize: 15, color: 'var(--gray-700)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        {selectedComplaint.address}
                        {selectedComplaint.location_lat && (
                          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>GPS: {selectedComplaint.location_lat}, {selectedComplaint.location_lng}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Panel */}
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>Resolution Progress</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{ flex: 1, height: 12, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${selectedComplaint.progress || 0}%`, 
                      height: '100%', 
                      background: (() => {
                        const p = selectedComplaint.progress || 0;
                        if (p >= 100) return 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'; // Green
                        if (p >= 90) return 'linear-gradient(90deg, #a855f7 0%, #9333ea 100%)'; // Purple
                        if (p >= 70) return 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)'; // Indigo
                        if (p >= 50) return 'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)'; // Light Blue
                        if (p >= 30) return 'linear-gradient(90deg, #facc15 0%, #eab308 100%)'; // Yellow
                        if (p >= 10) return 'linear-gradient(90deg, #fb923c 0%, #f97316 100%)'; // Orange
                        return 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)'; // Red
                      })(),
                      borderRadius: 10,
                      transition: 'width 0.4s ease-in-out, background 0.4s ease-in-out'
                    }}></div>
                  </div>
                  <div style={{ 
                    fontSize: 18, 
                    fontWeight: 800, 
                    color: (() => {
                      const p = selectedComplaint.progress || 0;
                      if (p >= 100) return '#16a34a';
                      if (p >= 90) return '#9333ea';
                      if (p >= 70) return '#4f46e5';
                      if (p >= 50) return '#0ea5e9';
                      if (p >= 30) return '#eab308';
                      if (p >= 10) return '#f97316';
                      return '#ef4444';
                    })(), 
                    minWidth: 50, 
                    textAlign: 'right' 
                  }}>
                    {selectedComplaint.progress || 0}%
                  </div>
                </div>
                
                <div style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Status: <strong>{getStatusLabel(selectedComplaint.status)}</strong></span>
                  {selectedComplaint.expected_completion_date && (
                    <span>Expected Completion: <strong>{new Date(selectedComplaint.expected_completion_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></span>
                  )}
                </div>
              </div>

              {/* Admin Remarks Panel */}
              {selectedComplaint.timeline && selectedComplaint.timeline.filter(e => e.status_event === 'Admin Remark').length > 0 && (
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--primary)' }}>Admin Updates & Remarks</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedComplaint.timeline.filter(e => e.status_event === 'Admin Remark').map(remark => (
                      <div key={remark.id} style={{ padding: 16, background: 'var(--orange-50)', borderLeft: '4px solid var(--primary)', borderRadius: '4px 8px 8px 4px' }}>
                        <div style={{ fontSize: 14, color: 'var(--gray-800)', lineHeight: 1.5, marginBottom: 8 }}>"{remark.event_description}"</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>
                          {new Date(remark.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Ticket timeline */}
            <div className="card" style={{ padding: 24, height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>Ticket Timeline</h3>
              
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24, paddingLeft: 16 }}>
                {(() => {
                  const ALL_PHASES = [
                    { id: 'submitted', label: 'Complaint Logged', defaultDesc: 'Complaint registered successfully.' },
                    { id: 'ticket_generated', label: 'Ticket Generated', defaultDesc: 'Ticket generated by administration.' },
                    { id: 'dept_assigned', label: 'Assigned To Department', defaultDesc: 'Routed and assigned to department.' },
                    { id: 'officer_assigned', label: 'Assigned To Engineer', defaultDesc: 'Assigned to the execution engineer.' },
                    { id: 'action_taken', label: 'Action Taken', defaultDesc: 'Initial action has been taken.' },
                    { id: 'ground_inspection', label: 'Ground Inspection', defaultDesc: 'On-site inspection.' },
                    { id: 'completed', label: 'Work Completed', defaultDesc: 'Grievance resolved.' }
                  ];

                  const statusOrder = ['submitted', 'ticket_generated', 'dept_assigned', 'officer_assigned', 'action_taken', 'ground_inspection', 'completed'];
                  const currentIndex = Math.max(0, statusOrder.indexOf(selectedComplaint.status));

                  return ALL_PHASES.map((phase, index) => {
                    const isCompleted = index <= currentIndex;
                    const isLastPhase = index === ALL_PHASES.length - 1;
                    
                    let actualEvent = null;
                    if (isCompleted && selectedComplaint.timeline) {
                      actualEvent = [...selectedComplaint.timeline].reverse().find(e => {
                        const en = e.status_event.toLowerCase();
                        if (phase.id === 'submitted' && (en.includes('logged') || en.includes('submitted'))) return true;
                        if (phase.id === 'ticket_generated' && en.includes('ticket')) return true;
                        if (phase.id === 'dept_assigned' && en.includes('department')) return true;
                        if (phase.id === 'officer_assigned' && (en.includes('engineer') || en.includes('officer'))) return true;
                        if (phase.id === 'action_taken' && en.includes('action')) return true;
                        if (phase.id === 'ground_inspection' && en.includes('ground')) return true;
                        if (phase.id === 'completed' && en.includes('completed')) return true;
                        return false;
                      });
                    }

                    return (
                      <div key={phase.id} style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'flex-start', opacity: isCompleted ? 1 : 0.5 }}>
                        
                        {/* Connecting Line to next step */}
                        {!isLastPhase && (
                          <div style={{ 
                            position: 'absolute', 
                            left: -14, 
                            top: 18, 
                            bottom: -28, 
                            width: 2, 
                            background: index < currentIndex ? '#10b981' : 'var(--gray-200)',
                            zIndex: 1
                          }}></div>
                        )}

                        {/* Timeline bullet */}
                        <div style={{ 
                          position: 'absolute', 
                          left: -20, 
                          top: 4, 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          background: isCompleted ? '#10b981' : 'var(--gray-300)', 
                          border: isCompleted ? '2px solid white' : '2px solid white',
                          boxShadow: isCompleted ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
                          zIndex: 2
                        }}></div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: isCompleted ? 800 : 700, color: isCompleted ? 'var(--gray-900)' : 'var(--gray-500)' }}>
                            {actualEvent ? actualEvent.status_event : phase.label}
                          </div>
                          <div style={{ fontSize: 13, color: isCompleted ? 'var(--gray-600)' : 'var(--gray-400)', marginTop: 4, lineHeight: 1.4 }}>
                            {actualEvent ? actualEvent.event_description : phase.defaultDesc}
                          </div>
                          {actualEvent && (
                            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6, fontWeight: 600 }}>
                              {new Date(actualEvent.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
