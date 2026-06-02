import { useState } from 'react';
import { apiFetch } from '../../config/api';

const PANCHAYATS = [
  "BAGALIJAN", "DAKHIN LALUK", "DEEJO", "DIKRONG", "DOOLOHAT SONAPUR", 
  "HARMOTI", "NIZ LALUK", "NOWBOICHA", "PACHIM NOWBOICHA", "PAHUMORA", 
  "PHULBARI", "RAMPUR BOGIBIL", "SINGRA", "UTTAR LALUK", "YUBANAGAR"
];

export default function MigratedSurveyForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    village: '',
    panchayat: '',
    permanent_address: '',
    voter_id: '',
    current_residence: '',
    occupation: '',
    monthly_salary: '',
    in_hand_salary: '',
    willing_to_return: '',
    surveyor_name: '',
    remarks: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await apiFetch('/migrated_surveys.php', {
        method: 'POST',
        body: formData
      });
      setSuccess(true);
      setFormData({
        full_name: '', village: '', panchayat: '', permanent_address: '',
        voter_id: '', current_residence: '', occupation: '', monthly_salary: '',
        in_hand_salary: '', willing_to_return: '', surveyor_name: '', remarks: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to submit survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ maxWidth: 600, marginTop: '10vh', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: 40, borderRadius: 16 }}>
          <div style={{ width: 80, height: 80, background: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 40 }}>
            ✓
          </div>
          <h2 style={{ color: 'var(--gray-900)' }}>Survey Submitted Successfully!</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: 10 }}>Thank you for providing the migration and employment data.</p>
          <button className="btn btn-primary" style={{ marginTop: 30 }} onClick={() => setSuccess(false)}>
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '30px 40px', borderRadius: 16 }}>
        <h2 style={{ marginBottom: 20, color: 'var(--primary)', borderBottom: '2px solid var(--orange-100)', paddingBottom: 10 }}>
          Migrated Citizen Survey Form
        </h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: 30 }}>
          Please fill out the form below to help us collect migration and employment data. All fields marked with * are required.
        </p>

        {error && <div className="error-message" style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Voter ID Number *</label>
              <input type="text" className="form-control" name="voter_id" value={formData.voter_id} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label">Village/Place *</label>
              <input type="text" className="form-control" name="village" value={formData.village} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Panchayat *</label>
              <select className="form-control" name="panchayat" value={formData.panchayat} onChange={handleChange} required>
                <option value="">Select your Panchayat...</option>
                {PANCHAYATS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Permanent Address *</label>
            <textarea className="form-control" name="permanent_address" value={formData.permanent_address} onChange={handleChange} required rows={3}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label">Current Place of Residence (City/State) *</label>
              <input type="text" className="form-control" name="current_residence" value={formData.current_residence} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Current Occupation/Job *</label>
              <input type="text" className="form-control" name="occupation" value={formData.occupation} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label">Monthly Salary (CTC) *</label>
              <input type="number" className="form-control" name="monthly_salary" value={formData.monthly_salary} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Monthly In-Hand Salary (Take-Home) *</label>
              <input type="number" className="form-control" name="in_hand_salary" value={formData.in_hand_salary} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ background: 'var(--orange-50)', padding: 20, borderRadius: 12, border: '1px solid var(--orange-100)' }}>
            <label className="form-label" style={{ fontSize: 16, color: 'var(--primary)', marginBottom: 15 }}>
              Question: If suitable employment opportunities and better income prospects are provided in your native area, would you be willing to return and work there? *
            </label>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Yes', 'No', 'Maybe'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" name="willing_to_return" value={opt} checked={formData.willing_to_return === opt} onChange={handleChange} required />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label">Surveyor Name (Optional)</label>
              <input type="text" className="form-control" name="surveyor_name" value={formData.surveyor_name} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Remarks/Comments (Optional)</label>
              <input type="text" className="form-control" name="remarks" value={formData.remarks} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 15, fontSize: 16, marginTop: 10 }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Survey'}
          </button>
        </form>
      </div>
    </div>
  );
}
