import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, BarChart3, Megaphone,
  ClipboardList, PlusCircle, Phone, BookOpen, ChevronLeft,
  ChevronRight, Activity, Shield, Search, MapPin, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { label: 'Overview', items: [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', perm: 'view_main_dashboard' },
  ]},
  { label: 'Grievance Management', items: [
    { path: '/admin/complaints', icon: FileText, label: 'Complaints', perm: 'view_raw_complaints' },
    { path: '/admin/tickets', icon: Activity, label: 'Complaints Desk', perm: 'manage_complaints_desk' },
  ]},
  { label: 'Surveys & Reports', items: [
    { path: '/admin/custom-surveys', icon: ClipboardList, label: 'Custom Surveys', perm: 'manage_custom_surveys' },
    { path: '/migrated-survey', icon: FileText, label: 'Migrated Survey', perm: 'view_migrated_survey_form' },
    { path: '/migration-reports', icon: BarChart3, label: 'Migrated Reports', perm: 'view_migrated_reports' },
    { path: '/admin/reports', icon: BarChart3, label: 'System Reports', perm: 'view_system_reports' },
    { path: '/admin/records', icon: FileText, label: 'All Records', perm: 'view_all_records' },
  ]},
  { label: 'Nearby Finder', items: [
    { path: '/admin/map-dashboard', icon: MapPin, label: 'Nearby Dashboard', perm: 'view_nearby_dashboard' },
  ]},
  { label: 'Engagement & Feedback', items: [
    { path: '/admin/feedback', icon: MessageSquare, label: 'Citizen Feedback', perm: 'view_citizen_feedback' },
    { path: '/admin/advertisements', icon: Megaphone, label: 'Advertisements', perm: 'manage_advertisements' },
    { path: '/communication', icon: Phone, label: 'Communication', perm: 'manage_communication' },
  ]},
  { label: 'System Admin', items: [
    { path: '/admin/system', icon: Users, label: 'Admin Hub', perm: 'view_admin_hub' },
  ]},
];

const citizenNav = [
  { label: 'Overview', items: [
    { path: '/citizen', icon: LayoutDashboard, label: 'My Dashboard' },
  ]},
  { label: 'Grievance Services', items: [
    { path: '/citizen/grievances', icon: PlusCircle, label: 'Lodge Complaint' },
    { path: '/citizen/tracking', icon: Search, label: 'Complaint Tracking' },
  ]},
  { label: 'City Services', items: [
    { path: '/citizen/locator', icon: MapPin, label: 'Nearby Finder' },
    { path: '/citizen/surveys', icon: ClipboardList, label: 'Available Surveys' },
    { path: '/migrated-survey', icon: FileText, label: 'Migrated Survey' },
  ]},
  { label: 'Connect & Engage', items: [
    { path: '/citizen/feedback', icon: MessageSquare, label: 'Give Feedback' },
    { path: '/communication', icon: Phone, label: 'Communication' },
  ]},
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { currentUser, isAdmin, hasPermission } = useAuth();
  const location = useLocation();
  
  let navGroups = citizenNav;
  if (isAdmin) {
    // Dynamically filter admin groups based on permissions
    navGroups = adminNav.map(group => {
      const filteredItems = group.items.filter(item => {
        if (!item.perm) return true; // Items like Dashboard are always visible to admins
        return hasPermission(item.perm);
      });
      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);
  }

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
