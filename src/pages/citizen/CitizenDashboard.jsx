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
    <div className="dashboard animate-fade-in" style={{ padding: '0 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Premium Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        padding: '40px',
        color: 'white',
        boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.5)',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '400px', height: '400px', background: 'rgba(139, 92, 246, 0.3)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 10 }}>
          <div style={{ 
            width: '90px', height: '90px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            border: '2px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            👤
          </div>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', backdropFilter: 'blur(5px)' }}>
              Verified Citizen
            </div>
            <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              Welcome, {currentUser?.name}
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <MapPin size={18} /> {currentUser?.area || 'Citizen Area'} {currentUser?.panchayat ? `• ${currentUser?.panchayat}` : ''}
            </p>
          </div>
        </div>

        {/* Quick Stats / Right side of hero */}
        <div style={{ 
          background: 'rgba(255,255,255,0.15)', 
          backdropFilter: 'blur(12px)', 
          padding: '20px', 
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          zIndex: 10,
          minWidth: '200px'
        }}>
          <div style={{ fontSize: '13px', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700, marginBottom: 8 }}>Profile Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>100% Complete</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Ready for services</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* Main Content Area (Quick Actions & Announcements) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: '1 1 600px' }}>
          
          {/* Quick Actions Grid */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--gray-800)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 24, background: 'var(--primary)', borderRadius: 4 }}></div>
              Citizen Services
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <a href="/citizen/locator" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--gray-200)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'all 0.3s ease', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16
                }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.15)'; e.currentTarget.style.borderColor = 'var(--primary)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}>
                  <div style={{ width: 50, height: 50, borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: 'var(--gray-900)' }}>Nearby Facilities</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-500)', lineHeight: 1.4 }}>Find and navigate to amenities in your area.</p>
                  </div>
                </div>
              </a>

              <a href="/citizen/surveys" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--gray-200)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'all 0.3s ease', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16
                }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(245, 158, 11, 0.15)'; e.currentTarget.style.borderColor = '#f59e0b'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}>
                  <div style={{ width: 50, height: 50, borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: 'var(--gray-900)' }}>Active Surveys</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-500)', lineHeight: 1.4 }}>Participate in government data collection.</p>
                  </div>
                </div>
              </a>

              <div style={{
                background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--gray-200)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'all 0.3s ease', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16
              }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.15)'; e.currentTarget.style.borderColor = '#10b981'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}>
                <div style={{ width: 50, height: 50, borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <User size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: 'var(--gray-900)' }}>Update Details</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-500)', lineHeight: 1.4 }}>Keep your profile and records up to date.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements Feed (Inline) */}
          {activeAnnouncements.length > 0 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--gray-800)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 24, background: '#f97316', borderRadius: 4 }}></div>
                Notice Board
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeAnnouncements.map(a => {
                  const tc = {
                    announcement: { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5', icon: '📢' },
                    news: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '📰' },
                    event: { bg: '#f0fdf4', color: '#047857', border: '#bbf7d0', icon: '📅' },
                    notice: { bg: '#fefce8', color: '#a16207', border: '#fef08a', icon: '⚠️' }
                  }[a.type || 'announcement'] || { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5', icon: '📢' };

                  return (
                    <div key={a.id} style={{ padding: '20px', background: 'white', border: `1px solid var(--gray-200)`, borderLeft: `4px solid ${tc.color}`, borderRadius: '12px', display: 'flex', gap: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: 28 }}>{tc.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: tc.color, background: tc.bg, padding: '2px 8px', borderRadius: 12 }}>{a.type || 'Announcement'}</span>
                          {a.priority === 'High' && <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>HIGH PRIORITY</span>}
                        </div>
                        <h3 style={{ margin: '8px 0 6px 0', fontSize: 17, color: 'var(--gray-900)', fontWeight: 700 }}>{a.title}</h3>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>{a.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Profile Card */}
        <div style={{ flex: '1 1 300px', width: '100%' }}>
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--gray-200)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', position: 'sticky', top: 24 }}>
            <div style={{ background: 'var(--gray-50)', padding: '24px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color="var(--primary)" /> Profile Details
              </h2>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name</span>
                <span style={{ fontSize: 15, color: 'var(--gray-900)', fontWeight: 500 }}>{currentUser?.name}</span>
              </div>
              <div style={{ height: 1, background: 'var(--gray-100)' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mobile Number</span>
                <span style={{ fontSize: 15, color: 'var(--gray-900)', fontWeight: 500 }}>{currentUser?.mobile}</span>
              </div>
              <div style={{ height: 1, background: 'var(--gray-100)' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Area / Village</span>
                <span style={{ fontSize: 15, color: 'var(--gray-900)', fontWeight: 500 }}>{currentUser?.area}</span>
              </div>
              <div style={{ height: 1, background: 'var(--gray-100)' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Panchayat</span>
                <span style={{ fontSize: 15, color: 'var(--gray-900)', fontWeight: 500 }}>{currentUser?.panchayat || 'Not specified'}</span>
              </div>
              <div style={{ height: 1, background: 'var(--gray-100)' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Migrant Status</span>
                <span style={{ fontSize: 15, color: 'var(--gray-900)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {currentUser?.is_migrated === 'yes' ? (
                    <><span style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: '50%' }}></span> Migrated from here</>
                  ) : (
                    <><span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }}></span> Local Resident</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Popup Modal (Keeping it for backward compatibility and extreme priority, but feed is above) */}
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
