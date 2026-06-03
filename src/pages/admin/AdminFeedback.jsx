import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { Star, CheckCircle2, MessageSquare, Clock, Filter, Check } from 'lucide-react';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, unread, reviewed
  const [filterRating, setFilterRating] = useState('all'); // all, 5, 4, 3, 2, 1

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      // FORCE DEMO MODE to prevent red 404 errors in console during dev
      const forceDemoMode = true; // Change to false after uploading citizen_feedback.php to live server
      
      if (forceDemoMode) {
        let saved = localStorage.getItem('demo_feedbacks');
        if (!saved) {
          saved = JSON.stringify([
            { id: 1, citizen_name: 'Rahul Sharma', category: 'Platform UI/UX', rating: 5, message: 'Very easy to use portal.', status: 'unread', created_at: new Date().toISOString() }
          ]);
          localStorage.setItem('demo_feedbacks', saved);
        }
        setFeedbacks(JSON.parse(saved));
        setLoading(false);
        return;
      }

      const data = await apiFetch('/citizen_feedback.php');
      setFeedbacks(data || []);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (id) => {
    try {
      const forceDemoMode = true;
      if (forceDemoMode) {
        const updated = feedbacks.map(f => f.id === id ? { ...f, status: 'reviewed' } : f);
        setFeedbacks(updated);
        localStorage.setItem('demo_feedbacks', JSON.stringify(updated));
        return;
      }

      await apiFetch(`/citizen_feedback.php?id=${id}`, {
        method: 'PUT',
        body: { status: 'reviewed' }
      });
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: 'reviewed' } : f));
    } catch (err) {
      alert('Failed to mark as reviewed');
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={16} 
            fill={rating >= star ? '#f59e0b' : 'none'} 
            color={rating >= star ? '#f59e0b' : '#d1d5db'} 
          />
        ))}
      </div>
    );
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (filterRating !== 'all' && parseInt(f.rating) !== parseInt(filterRating)) return false;
    return true;
  });

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--gray-900)' }}>Citizen Feedback Viewer</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--gray-500)' }}>Read and manage feedback submitted by citizens</p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
            <Filter size={16} color="var(--gray-500)" />
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontWeight: 500, color: 'var(--gray-700)' }}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
            <Star size={16} color="var(--gray-500)" />
            <select 
              value={filterRating} 
              onChange={e => setFilterRating(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontWeight: 500, color: 'var(--gray-700)' }}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>Loading feedback...</div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
          <MessageSquare size={48} color="var(--gray-300)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: 0, color: 'var(--gray-700)' }}>No feedback found</h3>
          <p style={{ margin: '8px 0 0' }}>Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredFeedbacks.map(f => (
            <div key={f.id} className="card animate-slideUp" style={{ padding: 20, borderLeft: f.status === 'unread' ? '4px solid var(--primary)' : '4px solid transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {renderStars(f.rating)}
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 8px', borderRadius: 20, backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                      {f.category}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>{f.citizen_name || 'Unknown Citizen'}</h3>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Clock size={14} /> {new Date(f.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {f.citizen_mobile && <span>• 📞 {f.citizen_mobile}</span>}
                  </div>
                </div>
                
                {f.status === 'unread' ? (
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => markAsReviewed(f.id)}
                  >
                    <Check size={14} /> Mark as Reviewed
                  </button>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#10b981' }}>
                    <CheckCircle2 size={16} /> Reviewed
                  </span>
                )}
              </div>
              
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 8, fontSize: 14, color: 'var(--gray-800)', lineHeight: 1.6, border: '1px solid var(--gray-200)' }}>
                "{f.message}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
