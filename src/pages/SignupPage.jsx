import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    password: '',
    address: '',
    area: '',
    panchayat: '',
    is_migrated: 'no'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.mobile || !formData.password || !formData.address || !formData.area) { 
      setError('Please fill in all fields.'); 
      return; 
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/signup.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      setLoading(false);
      
      if (response.ok) {
        // Automatically log them in if the signup endpoint returns a token
        if (result.token) {
           localStorage.setItem('auth_token', result.token);
           localStorage.setItem('user', JSON.stringify(result.user));
           window.location.href = '/citizen';
        } else {
           navigate('/login');
        }
      } else {
        setError(result.error || 'Signup failed.');
      }
    } catch (err) {
      console.error('Crash inside handleSubmit:', err);
      setLoading(false);
      setError('An unexpected app crash occurred during signup.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="login-card animate-slideUp">
        <div className="login-logo">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', width: '100%' }}>
            <img src="/logo2.jpeg" alt="Ranganadibeta Logo" style={{ width: '100%', maxWidth: '200px', height: 'auto', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
          <h1>Ranganadibeta</h1>
          <p>Citizen Registration</p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="form-control"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              className="form-control"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="Enter your full address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Area / Ward / Village</label>
            <input
              type="text"
              name="area"
              className="form-control"
              placeholder="Enter your area"
              value={formData.area}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Panchayat</label>
            <input 
              type="text"
              name="panchayat"
              className="form-control"
              placeholder="Enter your Panchayat name"
              value={formData.panchayat}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Are you a migrated person from here?</label>
            <select
              name="is_migrated"
              value={formData.is_migrated}
              onChange={handleChange}
              className="form-control"
            >
              <option value="no">No, I live here</option>
              <option value="yes">Yes, I have migrated from here</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', display: 'flex' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
            {loading ? (
              <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <>Sign Up <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '14px', color: 'var(--gray-600)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '11px', color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', borderTop: '1.5px solid var(--gray-200)', paddingTop: 16 }}>
          Created by YUVRAJ SINGH TOMAR
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
