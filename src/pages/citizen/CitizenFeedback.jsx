import { useState } from 'react';
import { apiFetch } from '../../config/api';
import { Star, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function CitizenFeedback() {
  const [formData, setFormData] = useState({
    category: 'General',
    rating: 5,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'General Experience',
    'Platform UI/UX',
    'Infrastructure Quality',
    'Government Schemes',
    'Officer Conduct',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      setError('Please write a feedback message.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiFetch('/citizen_feedback.php', {
        method: 'POST',
        body: formData
      });

      setSuccess(true);
      setFormData({ category: 'General Experience', rating: 5, message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--gray-900)' }}>Citizen Feedback</h1>
        <p style={{ margin: 0, color: 'var(--gray-500)' }}>We value your opinion. Let us know how we can improve our services.</p>
      </div>

      <div className="card animate-slideUp" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'linear-gradient(135deg, var(--primary) 0%, transparent 100%)', opacity: 0.05, borderRadius: '50%' }}></div>

        {success ? (
          <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircle2 size={64} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 10px', color: 'var(--gray-900)' }}>Thank You!</h2>
            <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: 16 }}>Your feedback has been submitted successfully and will be reviewed by our team.</p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: 24, padding: '10px 24px' }}
              onClick={() => setSuccess(false)}
            >
              Submit Another Feedback
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
            {error && (
              <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)' }}>Feedback Category</label>
              <select 
                className="form-control" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ padding: '12px', fontSize: 15, borderRadius: 12, border: '1px solid var(--gray-300)' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label" style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 12 }}>Rate your Experience</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, rating: star})}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: 0, 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      transform: formData.rating >= star ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = formData.rating >= star ? 'scale(1.1)' : 'scale(1)'}
                  >
                    <Star 
                      size={36} 
                      fill={formData.rating >= star ? '#f59e0b' : 'none'} 
                      color={formData.rating >= star ? '#f59e0b' : '#d1d5db'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label" style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={18} /> Detailed Comments
              </label>
              <textarea 
                className="form-control" 
                rows="5"
                placeholder="Tell us what you liked, or what we can improve..."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                style={{ padding: '16px', fontSize: 15, borderRadius: 12, border: '1px solid var(--gray-300)', resize: 'vertical' }}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 700, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
            >
              {loading ? 'Submitting...' : <><Send size={18} /> Submit Feedback</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
