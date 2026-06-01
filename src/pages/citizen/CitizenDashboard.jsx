import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Phone, FileText } from 'lucide-react';

export default function CitizenDashboard() {
  const { currentUser } = useAuth();

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
    </div>
  );
}
