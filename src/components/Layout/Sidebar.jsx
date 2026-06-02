import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, BarChart3, Megaphone,
  ClipboardList, PlusCircle, Phone, BookOpen, ChevronLeft,
  ChevronRight, Activity, Shield, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { label: 'Overview', items: [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { label: 'Grievances', items: [
    { path: '/admin/complaints', icon: FileText, label: 'Complaints' },
    { path: '/admin/tickets', icon: Activity, label: 'Complaints Desk' },
    { path: '/admin/ticket-admin', icon: ClipboardList, label: 'Complaints Admin Module' },
  ]},
  { label: 'Management', items: [
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/records', icon: FileText, label: 'All Records' },
    { path: '/admin/custom-surveys', icon: ClipboardList, label: 'Custom Surveys' },
    { path: '/migrated-survey', icon: FileText, label: 'Migrated Survey' },
    { path: '/migration-reports', icon: BarChart3, label: 'Migrated Reports' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/advertisements', icon: Megaphone, label: 'Advertisements' },
  ]},
  { label: 'Modules', items: [
    { path: '/communication', icon: Phone, label: 'Communication' },
    { path: '/awareness', icon: BookOpen, label: 'Awareness' },
  ]},
];

const citizenNav = [
  { label: 'Overview', items: [
    { path: '/citizen', icon: LayoutDashboard, label: 'My Dashboard' },
  ]},
  { label: 'Grievances', items: [
    { path: '/citizen/grievances', icon: PlusCircle, label: 'Lodge Complaint' },
    { path: '/citizen/tracking', icon: Search, label: 'Complaint Tracking' },
  ]},
  { label: 'Surveys', items: [
    { path: '/citizen/surveys', icon: ClipboardList, label: 'Available Surveys' },
    { path: '/migrated-survey', icon: FileText, label: 'Migrated Survey' },
  ]},
  { label: 'Modules', items: [
    { path: '/communication', icon: Phone, label: 'Communication' },
    { path: '/awareness', icon: BookOpen, label: 'Awareness' },
  ]},
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { currentUser, isAdmin } = useAuth();
  const navGroups = isAdmin ? adminNav : citizenNav;
  const location = useLocation();

  const isExactActive = (path) => {
    if (path === '/admin' || path === '/citizen') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99, background: 'rgba(0,0,0,0.4)', backdropFilter: 'none' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <img src="/logo2.jpeg" alt="Ranganadibeta Logo" style={{ width: '100%', maxHeight: collapsed ? '32px' : '64px', borderRadius: '4px', objectFit: 'contain', transition: 'max-height 0.3s' }} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && <div className="nav-section-label">{group.label}</div>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isExactActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${active ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon size={18} className="nav-icon" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / Toggle */}
        <div className="sidebar-footer">
          {!collapsed && (
            <Link to="/profile" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
              <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--orange-50)', borderRadius: 10, cursor: 'pointer', transition: 'var(--transition)' }} className="sidebar-user-block">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--orange-700))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {currentUser?.profile_photo ? (
                      <img src={currentUser.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 16, fontWeight: 'bold' }}>{(currentUser?.name || 'G').charAt(0)}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 2 }}>Logged in as</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser?.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, textTransform: 'capitalize', marginTop: 2 }}>
                      {currentUser?.role}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
          {!collapsed && (
            <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--gray-400)', fontWeight: 600, margin: '8px 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Created by YUVRAJ SINGH TOMAR
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
