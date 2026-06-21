import { useState } from 'react';
import { apiFetch } from '../../config/api';
import { ShieldAlert, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function KycPromptModal({ onClose }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ id_type: '', id_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_type || !formData.id_number) {
      setError('Please select an ID type and enter the ID number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiFetch('/citizen_kyc.php', {
        method: 'POST',
        body: formData
      });

      if (response && response.token) {
        setSuccess(true);
        // Update auth context with new token/user data which has kyc_status='completed'
        setTimeout(() => {
          login(response.user, response.token);
          if (onClose) onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal animate-slideUp" style={{ maxWidth: '500px', width: '90%' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--gray-200)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: 10, borderRadius: 12 }}>
              {success ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: 'var(--gray-900)' }}>
                {success ? 'Verification Successful!' : 'KYC Verification Required'}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
                {success ? 'Your account is now verified.' : 'Please verify your identity to access all features.'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ alignSelf: 'flex-start' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ color: 'var(--success)', fontSize: 48, marginBottom: 16 }}>✓</div>
              <h3 style={{ color: 'var(--gray-900)', marginBottom: 8 }}>Identity Verified</h3>
              <p style={{ color: 'var(--gray-500)' }}>Thank you for completing your KYC verification.</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Select ID Type</label>
                <select
                  className="form-control"
                  value={formData.id_type}
                  onChange={e => setFormData({ ...formData, id_type: e.target.value })}
                >
                  <option value="">Choose an ID...</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Aadhaar No.">Aadhaar No.</option>
                  <option value="PAN">PAN</option>
                  <option value="Ration Card No">Ration Card No</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Enter ID Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ABC1234567"
                  value={formData.id_number}
                  onChange={e => setFormData({ ...formData, id_number: e.target.value })}
                />
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
                  Skip for Now
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                  {loading ? 'Verifying...' : 'Verify Now'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
