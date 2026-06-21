import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User, MapPin, Phone, FileText, X, Megaphone } from 'lucide-react';

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const { announcements } = useData();
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  
  const activeAnnouncements = announcements?.filter(a => a.published) || [];

  useEffect(() => {
    const hasSeenAnnouncements = sessionStorage.getItem('dashboard_announcements_seen');
    const hasSeenSurvey = sessionStorage.getItem('dashboard_survey_popup');

    const timer = setTimeout(() => {
      if (activeAnnouncements.length > 0 && !hasSeenAnnouncements) {
        setShowAnnouncements(true);
        sessionStorage.setItem('dashboard_announcements_seen', 'true');
      } else if (!hasSeenSurvey) {
        setShowSurveyPopup(true);
        sessionStorage.setItem('dashboard_survey_popup', 'true');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activeAnnouncements.length]);

  const closeAnnouncements = () => {
    setShowAnnouncements(false);
    const hasSeenSurvey = sessionStorage.getItem('dashboard_survey_popup');
    if (!hasSeenSurvey) {
      setTimeout(() => {
        setShowSurveyPopup(true);
        sessionStorage.setItem('dashboard_survey_popup', 'true');
      }, 500);
    }
  };

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
            <a href="/citizen/locator" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#2563eb', color: 'white', border: 'none', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>
              <MapPin size={18} /> Find Nearby Facilities & Navigation
            </a>
            <a href="/citizen/surveys" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FileText size={16} /> Join the Movement
            </a>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" style={{ flex: 1, background: 'white', color: 'var(--primary-dark)', border: '1px solid var(--primary)' }}>Update Details</button>
              <button className="btn" style={{ flex: 1, background: 'white', color: 'var(--primary-dark)', border: '1px solid var(--primary)' }}>View Schemes</button>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Popup Modal */}
      {showAnnouncements && activeAnnouncements.length > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card animate-slideUp" style={{ background: 'white', padding: '30px 40px', borderRadius: 16, maxWidth: 600, width: '100%', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={closeAnnouncements}
              style={{ position: 'absolute', top: 16, right: 16, background: 'var(--gray-100)', border: 'none', cursor: 'pointer', color: 'var(--gray-600)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
            >
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--gray-200)' }}>
              <div style={{ width: 48, height: 48, background: 'var(--orange-100)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Megaphone size={24} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>Latest Announcements</h2>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeAnnouncements.map(a => {
                const tc = {
                  announcement: { bg: 'var(--orange-50)', color: 'var(--orange-700)', border: 'var(--orange-200)' },
                  news: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                  event: { bg: '#f0fdf4', color: '#047857', border: '#bbf7d0' },
                  notice: { bg: '#fefce8', color: '#a16207', border: '#fef08a' }
                }[a.type || 'announcement'] || { bg: 'var(--orange-50)', color: 'var(--orange-700)', border: 'var(--orange-200)' };

                return (
                  <div key={a.id} style={{ padding: 16, background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: tc.color }}>{a.type || 'Announcement'}</span>
                      {a.priority === 'High' && <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>HIGH PRIORITY</span>}
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: 'var(--gray-900)', fontWeight: 700 }}>{a.title}</h3>
                    <p style={{ margin: 0, fontSize: 15, color: 'var(--gray-700)', lineHeight: 1.5 }}>{a.content}</p>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--gray-200)', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={closeAnnouncements}>
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survey Popup Modal */}
      {showSurveyPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card animate-slideUp" style={{ background: 'white', padding: 40, borderRadius: 16, maxWidth: 500, width: '100%', textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={() => setShowSurveyPopup(false)}
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
                onClick={() => setShowSurveyPopup(false)}
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
