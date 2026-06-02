import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Phone, FileText, X } from 'lucide-react';

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('dashboard_survey_popup');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem('dashboard_survey_popup', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="dashboard animate-fade-in">
      <div className="card dashboard-header" style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        color: 'white',
        borderRadius: '16px',
        padding: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ 
            width: '80px', height: '80px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px'
          }}>
            👤
          </div>
          <div>
            <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Welcome, {currentUser?.name}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} /> {currentUser?.area || 'Citizen Area'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--gray-800)' }}>
            <User size={20} style={{ color: 'var(--primary)' }} /> Profile Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--gray-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Name:</strong> <span>{currentUser?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Mobile:</strong> <span>{currentUser?.mobile}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Area:</strong> <span>{currentUser?.area}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Panchayat:</strong> <span>{currentUser?.panchayat || 'Not specified'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Migrated from here?</strong> <span>{currentUser?.is_migrated === 'yes' ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', background: 'var(--primary-light)' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--primary-dark)', marginBottom: '12px' }}>Citizen Services</h2>
          <p style={{ color: 'var(--primary-dark)', opacity: 0.8, marginBottom: '24px' }}>
            Your survey responses and interactions with the government will be displayed here soon.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <a href="/citizen/surveys" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FileText size={16} /> Join the Movement
            </a>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>Update Details</button>
              <button className="btn" style={{ flex: 1, background: 'white', color: 'var(--primary-dark)' }}>View Schemes</button>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Popup Modal */}
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card animate-slideUp" style={{ background: 'white', padding: 40, borderRadius: 16, maxWidth: 500, width: '100%', textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={() => setShowPopup(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}
            >
              <X size={24} />
            </button>
            <div style={{ width: 70, height: 70, background: 'var(--orange-100)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FileText size={36} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>Official Survey Available</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 30, fontSize: 16, lineHeight: 1.5 }}>
              We are currently collecting important migration and employment data. Your participation helps us serve you better. Would you like to fill out the survey now?
            </p>
            <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
              <button 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { window.location.href = '/migrated-survey'; }}
              >
                Yes, Start Survey Now
              </button>
              <button 
                className="btn btn-outline btn-lg" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setShowPopup(false)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
