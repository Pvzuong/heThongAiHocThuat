import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiLogOut, FiSearch, FiMenu,
  FiUser, FiSettings, FiBookOpen, FiCode, FiCpu, FiBarChart2, FiGrid,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { useState, useEffect, useRef } from 'react';

const getInitial = (u) => (u.display_name ? u.display_name[0] : u.email[0]).toUpperCase();
const getDisplayName = (u) => u.display_name || u.email.split('@')[0];

const NAV_LINKS = [
  { to: '/dashboard',              label: 'Dashboard',    icon: <FiGrid      size={19} /> },
  { to: '/pho-thong',             label: 'Phổ thông',    icon: <FiBookOpen  size={19} /> },
  { to: '/skill-paths',           label: 'Kỹ năng',      icon: <FiCode      size={19} /> },
  { to: '/practice/ai-generator', label: 'AI Luyện tập', icon: <FiCpu       size={19} /> },
  { to: '/profile',               label: 'Tiến độ',      icon: <FiBarChart2 size={19} /> },
];

/* ── SIDEBAR ─────────────────────────────────────── */
export const Sidebar = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  useEffect(() => { onClose?.(); }, [location.pathname]);

  const handleLogout = async () => {
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
          <div className="sidebar-logo-avatar">LH</div>
          <div>
            <div className="sidebar-logo-text">LearnHub</div>
            <div className="sidebar-logo-tagline">Vibrant Learning</div>
          </div>
        </Link>

        {/* Nav items */}
        <nav className="sidebar-nav">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-nav-item${isActive(to) ? ' sidebar-nav-item--active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-nav-icon">{icon}</span>
              <span className="sidebar-nav-label">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        {user && (
          <div className="sidebar-footer">
            <button className="sidebar-footer-item" onClick={handleLogout}>
              <FiLogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

/* ── TOPBAR ──────────────────────────────────────── */
export const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="topbar">
      {/* Hamburger — mobile only */}
      <button className="topbar-hamburger" onClick={onMenuClick} aria-label="Menu">
        <FiMenu size={22} />
      </button>

      {/* Logo mobile */}
      <Link to="/" className="topbar-logo-mobile">
        <span className="sidebar-logo-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>LH</span>
        <span className="sidebar-logo-text">LearnHub</span>
      </Link>

      {/* Search */}
      <form className="topbar-search" onSubmit={handleSearch}>
        <FiSearch className="topbar-search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm bài học, lộ trình..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {/* Auth */}
      <div className="topbar-auth">
        {user ? (
          <div className="topbar-user" ref={dropdownRef}>
            <button
              className="topbar-avatar"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="Tài khoản"
            >
              {getInitial(user)}
            </button>

            {dropdownOpen && (
              <div className="user-dropdown topbar-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar">{getInitial(user)}</div>
                  <div className="user-dropdown-info">
                    <span className="user-dropdown-name">{getDisplayName(user)}</span>
                    <span className="user-dropdown-email">{user.email}</span>
                  </div>
                </div>
                <div className="user-dropdown-divider" />
                {user.role === 'admin' && (
                  <Link to="/admin" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiSettings size={15} /> Admin
                  </Link>
                )}
                <Link to="/profile" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <FiUser size={15} /> Trang cá nhân
                </Link>
                <Link to="/settings" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <FiSettings size={15} /> Cài đặt
                </Link>
                <div className="user-dropdown-divider" />
                <button className="user-dropdown-item user-dropdown-item--danger" onClick={handleLogout}>
                  <FiLogOut size={15} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="topbar-auth-btns">
            <Link to="/register" className="btn btn--outline btn--sm">Đăng ký</Link>
            <Link to="/login"    className="btn btn--primary btn--sm">Đăng nhập</Link>
          </div>
        )}
      </div>
    </header>
  );
};

/* default export vẫn giữ để không break import cũ */
export default Sidebar;
