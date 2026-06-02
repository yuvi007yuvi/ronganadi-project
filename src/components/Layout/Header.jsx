import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/surveyors': 'Manage Surveyors',
  '/admin/records': 'All Records',
  '/admin/reports': 'Reports & Analytics',
  '/admin/advertisements': 'Advertisements',
  '/surveyor': 'My Dashboard',
  '/surveyor/add': 'New Survey',
  '/surveyor/records': 'My Records',
  '/communication': 'Communication',
  '/awareness': 'Awareness',
};

export default function Header({ collapsed, setMobileOpen, pageTitle }) {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const backendMode = localStorage.getItem('ronganadi_backend_mode') || 'live';
  
  const toggleBackendMode = () => {
    const newMode = backendMode === 'live' ? 'local' : 'live';
    localStorage.setItem('ronganadi_backend_mode', newMode);
    window.location.reload();
  };

  return (
    <header className={`header ${collapsed ? 'collapsed' : ''}`}>
      <div className="header-left">
        {/* Mobile menu toggle */}
        <button className="header-icon-btn" style={{ display: 'none' }} id="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <Menu size={18} />
        </button>
        <button className="header-icon-btn" style={{ display: 'flex' }} onClick={() => setMobileOpen(prev => !prev)}
          id="hamburger-btn">
          <Menu size={18} />
        </button>
        <h1 className="page-title">{pageTitle}</h1>
      </div>

      <div className="header-right">
        {/* Backend Switcher */}
        <button 
          onClick={toggleBackendMode}
          title="Switch between Live Cloud API and Local Workbench API"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            marginRight: 8,
            background: backendMode === 'local' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #f97316, #c2410c)',
            color: 'white',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition)'
          }}
        >
          {backendMode === 'local' ? '💻 Local DB (Workbench)' : '🌐 Cloud API (Live)'}
        </button>

        <button className="header-icon-btn" title="Notifications">
          <Bell size={16} />
          <span className="badge">3</span>
        </button>

        {/* User menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', transition: 'var(--transition)' }}
          >
            <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11, background: currentUser?.profile_photo ? `url(${currentUser.profile_photo}) center/cover` : 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              {!currentUser?.profile_photo && initials}
            </div>
            <div style={{ textAlign: 'left', display: window.innerWidth > 640 ? 'block' : 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.2 }}>{currentUser?.name}</div>
              <div style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600, textTransform: 'capitalize' }}>{currentUser?.role}</div>
            </div>
            <ChevronDown size={14} color="var(--gray-500)" />
          </button>

          {menuOpen && (
            <div className="user-menu animate-slideUp">
              <div className="user-menu-header">
                <div className="user-menu-name">{currentUser?.name}</div>
                <div className="user-menu-role">{currentUser?.role}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>{currentUser?.email}</div>
              </div>
              <button className="user-menu-item" onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
                <User size={14} />Profile
              </button>
              <button className="user-menu-item danger" onClick={handleLogout}>
                <LogOut size={14} />Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
