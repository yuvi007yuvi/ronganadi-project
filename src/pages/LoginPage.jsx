import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Hard redirect used instead in handleSubmit

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleAutofill = () => {
    if (role === 'admin') {
      setEmail('admin@ronganadi.gov.in');
      setPassword('admin123');
    } else {
      setEmail('9999999999');
      setPassword('citizen123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    
    setLoading(true);
    setError('');
    console.log('Login attempt starting...', { email, role });
    
    await new Promise(r => setTimeout(r, 600));
    
    try {
      console.log('Calling login function...');
      const result = await login(email, password, role);
      console.log('Login function returned:', result);
      
      setLoading(false);
      
      if (result && result.success) {
        console.log('Login successful! Hard redirecting to dashboard...');
        window.location.href = role === 'admin' ? '/admin' : '/citizen';
      } else {
        console.log('Login failed, setting error:', result?.message);
        setError(result?.message || 'Login failed completely. Result was undefined.');
      }
    } catch (err) {
      console.error('Crash inside handleSubmit:', err);
      setLoading(false);
      setError('An unexpected app crash occurred during login.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="login-card animate-slideUp">
        {/* Logo */}
        <div className="login-logo">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', width: '100%' }}>
            <img src="/logo2.jpeg" alt="Ranganadibeta Logo" style={{ width: '100%', maxWidth: '200px', height: 'auto', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
          <h1>Ranganadibeta</h1>
          <p>Digital Survey & Citizen Engagement Platform</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {['admin', 'citizen'].map(r => (
            <button
              key={r}
              type="button"
              className={`role-btn ${role === r ? 'active' : ''}`}
              onClick={() => handleRoleSwitch(r)}
            >
              <div style={{ fontSize: 22 }}>{r === 'admin' ? '🏛️' : '👤'}</div>
              <span>{r === 'admin' ? 'Admin' : 'Citizen'}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{role === 'citizen' ? 'Mobile Number' : 'Email Address'}</label>
            <input
              type={role === 'citizen' ? 'tel' : 'email'}
              className="form-control"
              placeholder={role === 'citizen' ? "Enter your mobile number" : "Enter your email"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: 44 }}
                autoComplete="current-password"
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <button
              type="button"
              onClick={handleAutofill}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              Autofill {role === 'admin' ? 'Admin' : 'Citizen'} Demo Credentials
            </button>
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
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '14px', color: 'var(--gray-600)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
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
