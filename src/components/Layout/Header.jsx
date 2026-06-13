import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User, Settings, ChevronDown, Check } from 'lucide-react';
import { apiFetch } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import packageJson from '../../../package.json';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/surveyors': 'Manage Surveyors',
  '/admin/records': 'All Records',
  '/admin/reports': 'Reports & Analytics',
  '/admin/advertisements': 'Advertisements',
  '/surveyor': 'My Dashboard',
  '/surveyor/add': 'New Survey',
  '/surveyor/records': 'My Records',
  '/citizen/locator': 'Nearby Finder',
  '/communication': 'Communication',
  '/profile': 'My Profile'
};

export default function Header({ collapsed, setCollapsed, setMobileOpen, pageTitle }) {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (currentUser) {
      apiFetch('/notifications.php')
        .then(data => setNotifications(data || []))
        .catch(err => console.error('Failed to fetch notifications:', err));
    }
  }, [currentUser]);

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications.php', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error('Failed to mark notifications as read', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <header className={`header ${collapsed ? 'collapsed' : ''}`}>
      <div className="header-left">
        <button className="header-icon-btn" onClick={() => {
          if (window.innerWidth <= 768) {
            setMobileOpen(true);
          } else {
            setCollapsed(prev => !prev);
          }
        }}>
          <Menu size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 className="page-title">{pageTitle}</h1>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '12px', letterSpacing: '0.5px' }}>
            v{packageJson.version}
          </span>
        </div>
      </div>

      <div className="header-right">

        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            className="header-icon-btn" 
            title="Notifications"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell size={16} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="user-menu animate-slideUp" style={{ width: 320, right: 0, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)' }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--gray-500)', fontSize: 13 }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)', background: notif.is_read ? '#fff' : '#f0f9ff', transition: 'background 0.2s', cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, color: 'var(--gray-800)', lineHeight: 1.5, fontWeight: notif.is_read ? 500 : 600 }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 8 }}>
                        {new Date(notif.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
