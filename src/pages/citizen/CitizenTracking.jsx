import { useState } from 'react';
import { apiFetch } from '../../config/api';
import { 
  Search, ShieldAlert, FileText, Clock, MapPin, 
  Phone, User, CheckCircle2, AlertTriangle, ArrowRight 
} from 'lucide-react';

export default function CitizenTracking() {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    setError('');
    setTicket(null);

    try {
      // Fetch by ticket_id string
      const data = await apiFetch(`/complaints.php?ticket_id=${ticketId.trim()}`);
      if (data && data.id) {
        setTicket(data);
      } else {
        setError('No ticket found with this ID. Please check the spelling.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch ticket. Please verify connection.');
    } finally {
      setLoading(false);
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
      case 'work_started': return 'Work In Progress';
      case 'assigned': return 'Assigned to Officer';
      case 'ticket_generated': return 'Ticket Generated';
      default: return 'Under Review';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'completed': return { bg: '#dcfce7', text: '#15803d' };
      case 'work_started': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'assigned': return { bg: '#faf5ff', text: '#7e22ce' };
      default: return { bg: '#fff7ed', text: '#c2410c' };
    }
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60 }}>
      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>Track Ticket</h1>
        <p style={{ margin: 0, color: 'var(--gray-500)' }}>Enter your ticket ID below to track real-time resolution status and timeline</p>
      </div>

      {/* Search Input Bar */}
      <div className="card animate-slideUp" style={{ padding: 24, marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Enter Ticket ID (e.g. GRV-2026-123456)" 
              value={ticketId}
              onChange={e => setTicketId(e.target.value)}
              style={{ paddingLeft: 40, height: 48, fontSize: 16 }}
              required
            />
            <Search size={18} color="var(--gray-400)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ height: 48, padding: '0 24px', flexShrink: 0, fontSize: 15, fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Track Status'}
          </button>
        </form>
      </div>

      {/* Error View */}
      {error && (
        <div className="card animate-fadeIn" style={{ padding: 28, textAlign: 'center', borderColor: 'var(--danger)', background: 'var(--danger-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <ShieldAlert size={40} color="var(--danger)" />
          <h3 style={{ margin: 0, color: 'var(--danger)' }}>Ticket Not Found</h3>
          <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 14 }}>{error}</p>
        </div>
      )}

      {/* Ticket Details Panel */}
      {ticket && (
        <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card Info */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--gray-200)', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tracked Ticket</span>
                <h2 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, fontFamily: 'monospace' }}>{ticket.ticket_id}</h2>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 20, backgroundColor: getStatusColor(ticket.status).bg, color: getStatusColor(ticket.status).text }}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Date Submitted</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>
                  {new Date(ticket.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Department Assigned</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>
                  {ticket.department_name || 'Awaiting Routing'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Assigned Officer</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>
                  {ticket.officer_name || 'Under Review'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Officer Contact</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {ticket.officer_mobile ? (
                    <><Phone size={14} /> {ticket.officer_mobile}</>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Complaint Title</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-900)' }}>{ticket.title}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Category</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-800)' }}>{ticket.category} ({ticket.sub_category || 'N/A'})</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Ward / Area</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-800)' }}>{ticket.ward}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
                <div style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.6 }}>{ticket.description}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Address / Landmark</div>
                <div style={{ fontSize: 14, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} color="var(--primary)" style={{ flexShrink: 0 }} /> {ticket.address}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>Resolution Progress</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 12, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ 
                  width: `${ticket.progress || 0}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--orange-400) 100%)',
                  borderRadius: 10,
                  transition: 'width 0.4s ease-in-out'
                }}></div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', minWidth: 50, textAlign: 'right' }}>
                {ticket.progress || 0}%
              </div>
            </div>
            
            <div style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Current Stage: <strong>{getStatusLabel(ticket.status)}</strong></span>
              {ticket.expected_completion_date && (
                <span>Expected Completion: <strong>{new Date(ticket.expected_completion_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
              )}
            </div>
          </div>

          {/* Timeline Tracking */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>Ticket Tracking Timeline</h3>
            
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24, paddingLeft: 16 }}>
              {/* Timeline vertical line */}
              <div style={{ position: 'absolute', top: 12, bottom: 12, left: 4, width: 2, background: 'var(--gray-200)' }}></div>
              
              {ticket.timeline && ticket.timeline.map((event, index) => (
                <div key={event.id} style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Timeline bullet */}
                  <div style={{ 
                    position: 'absolute', 
                    left: -20, 
                    top: 4, 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    background: 'var(--primary)',
                    border: '2px solid white',
                    boxShadow: '0 0 0 3px var(--orange-100)'
                  }}></div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>{event.status_event}</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{event.event_description}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6, fontWeight: 500 }}>
                      {new Date(event.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {ticket.status !== 'completed' && (
                <div style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'flex-start', opacity: 0.5 }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: -20, 
                    top: 4, 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    background: 'var(--gray-300)',
                    border: '2px solid white'
                  }}></div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-500)' }}>Resolution Completed</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>Final field inspection and feedback signoff.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
