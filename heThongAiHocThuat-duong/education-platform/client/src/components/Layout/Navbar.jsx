import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiMenu, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

/* ── Nav items ─────────────────────────────────────────── */
const STUDENT_NAV = [
  { to: '/dashboard',   label: 'Dashboard',     icon: '🏠' },
  { to: '/skill-paths', label: 'Learning Path',  icon: '🎯' },
  { to: '/pho-thong',   label: 'Học bài',        icon: '📚' },
  { to: '/practice',    label: 'Luyện tập',       icon: '⚡' },
  { to: '/ai-coach',    label: 'AI Coach',        icon: '🤖', highlight: true },
  { to: '/ranking',     label: 'Ranking',          icon: '🏆' },
  { to: '/profile',     label: 'Profile',          icon: '👤' },
];

const ADMIN_NAV = [
  { to: '/dashboard',   label: 'Dashboard',     icon: '🏠' },
  { to: '/admin',       label: 'Admin Panel',    icon: '⚙️' },
  { to: '/profile',     label: 'Profile',         icon: '👤' },
];

const getInitial = (u) => (u?.display_name?.[0] || u?.email?.[0] || 'U').toUpperCase();
const getDisplayName = (u) => u?.display_name || u?.email?.split('@')[0] || 'Học sinh';

/* ── SIDEBAR ─────────────────────────────────────────────── */
export const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const nav = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === path
      : location.pathname.startsWith(path);

  // Streak & XP từ localStorage (sẽ được cập nhật từ Dashboard)
  const streak = parseInt(localStorage.getItem('lh_streak') || '0');
  const xp     = parseInt(localStorage.getItem('lh_xp') || '0');

  useEffect(() => { onClose?.(); }, [location.pathname]);

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    onClose?.();
    await logout();
    navigate('/');
  };

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}>
        {/* Logo */}
        <Link to="/" className="sidebar-logo" onClick={onClose}>
          <div className="sidebar-logo-icon">L</div>
          <div>
            <div className="sidebar-logo-name">LearnHub</div>
            <div className="sidebar-logo-tagline">AI Learning Companion</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="sidebar-nav">
          {nav.map(({ to, label, icon, highlight }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={`sidebar-nav-item${isActive(to) ? ' sidebar-nav-item--active' : ''}${highlight ? ' sidebar-nav-item--highlight' : ''}`}
            >
              <span className="sidebar-nav-icon">{icon}</span>
              <span className="sidebar-nav-label">{label}</span>
              {highlight && <span className="sidebar-nav-badge">AI</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer: streak/XP + user */}
        <div className="sidebar-footer">
          {!isAdmin && (
            <div className="sidebar-gamebar">
              <div className="sidebar-gamebar-item">
                <span className="sidebar-gamebar-icon">🔥</span>
                <div>
                  <div className="sidebar-gamebar-num">{streak}</div>
                  <div className="sidebar-gamebar-lbl">Streak</div>
                </div>
              </div>
              <div className="sidebar-gamebar-item">
                <span className="sidebar-gamebar-icon">⭐</span>
                <div>
                  <div className="sidebar-gamebar-num">{xp}</div>
                  <div className="sidebar-gamebar-lbl">XP</div>
                </div>
              </div>
            </div>
          )}

          {user && (
            <div className="sidebar-user" ref={menuRef} onClick={() => setUserMenuOpen(v => !v)}>
              <div className="sidebar-user-avatar">{getInitial(user)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sidebar-user-name truncate">{getDisplayName(user)}</div>
                <div className="sidebar-user-role">{isAdmin ? 'Admin' : 'Học sinh'}</div>
              </div>
              <span style={{ color: 'var(--text-light)', fontSize: 12 }}>⋮</span>

              {userMenuOpen && (
                <div className="sidebar-user-menu">
                  {isAdmin && (
                    <Link to="/admin" className="sidebar-user-menu-item" onClick={() => setUserMenuOpen(false)}>
                      <FiSettings size={15} /> Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" className="sidebar-user-menu-item" onClick={() => setUserMenuOpen(false)}>
                    <FiUser size={15} /> Trang cá nhân
                  </Link>
                  <div className="sidebar-user-menu-divider" />
                  <button className="sidebar-user-menu-item sidebar-user-menu-item--danger" onClick={handleLogout}>
                    <FiLogOut size={15} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

/* ── TOPBAR ──────────────────────────────────────────────── */
export const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="topbar">
      <button className="topbar-hamburger" onClick={onMenuClick} aria-label="Menu">
        <FiMenu size={22} />
      </button>

      <Link to="/" className="topbar-logo-mobile">LearnHub</Link>

      <form className="topbar-search" onSubmit={handleSearch}>
        <FiSearch className="topbar-search-icon" size={16} />
        <input
          type="text"
          placeholder="Tìm bài học, lộ trình..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="topbar-right">
        {user ? (
          <Link to="/profile" className="topbar-avatar" title="Profile">
            {getInitial(user)}
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/register" className="btn btn--outline btn--sm">Đăng ký</Link>
            <Link to="/login"    className="btn btn--primary btn--sm">Đăng nhập</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Sidebar;
