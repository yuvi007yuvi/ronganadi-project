import { Link } from 'react-router-dom';
import { Users, Clipboard, Shield, MapPin, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SystemAdmin() {
  const { hasPermission, isSuperAdmin } = useAuth();

  return (
    <div className="animate-fadeIn">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">System Administration</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Core system modules and configurations</div>
          </div>
          <Settings size={20} color="var(--primary)" />
        </div>

        <div className="card-body" style={{ padding: '32px 24px' }}>
          <div className="premium-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {hasPermission('manage_users') && (
              <Link to="/admin/users" className="glass-card stat-showcase" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', transition: 'all 0.3s' }}>
                <div style={{ width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Users size={32} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>User Management</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6 }}>Manage citizens and staff</div>
              </Link>
            )}

            {isSuperAdmin && (
              <Link to="/admin/ticket-admin" className="glass-card stat-showcase" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', transition: 'all 0.3s' }}>
                <div style={{ width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Clipboard size={32} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>Complaints Admin</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6 }}>System grievance oversight</div>
              </Link>
            )}

            {(isSuperAdmin || hasPermission('manage_users')) && (
              <Link to="/admin/roles" className="glass-card stat-showcase" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', transition: 'all 0.3s' }}>
                <div style={{ width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Shield size={32} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>Roles & Permissions</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6 }}>Access control policies</div>
              </Link>
            )}

            {hasPermission('manage_facilities') && (
              <Link to="/admin/facilities" className="glass-card stat-showcase" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', transition: 'all 0.3s' }}>
                <div style={{ width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <MapPin size={32} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>Manage Nearby</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6 }}>City locator facilities</div>
              </Link>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
