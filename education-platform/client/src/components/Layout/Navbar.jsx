import { Link, useNavigate } from 'react-router-dom';
import { FiBook, FiLogOut, FiSearch, FiMenu, FiX, FiUser, FiSettings } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { useState, useEffect, useRef } from 'react';

const getInitial = (user) => {
  if (user.display_name) return user.display_name.charAt(0).toUpperCase();
  return user.email.charAt(0).toUpperCase();
};

const getDisplayName = (user) => {
  return user.display_name || user.email.split('@')[0];
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const mobileRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => { setMobileOpen(false); setDropdownOpen(false); }}>
          <FiBook size={24} />
          <span>LearnHub</span>
        </Link>

        {/* Search — desktop */}
        <form className="navbar-search navbar-search--desktop" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học, lộ trình..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Nav links — desktop */}
        <div className="navbar-links navbar-links--desktop">
          <Link to="/pho-thong" className="nav-link">Phổ thông</Link>
          <Link to="/skill-paths" className="nav-link">Kỹ năng</Link>

          {user ? (
            <div className="navbar-user-wrap" ref={dropdownRef}>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link nav-link--admin">Admin</Link>
              )}
              {/* Avatar button */}
              <button
                className="navbar-avatar"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="Tài khoản"
              >
                {getInitial(user)}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="user-dropdown">
                  {/* Header: avatar + name + email */}
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">{getInitial(user)}</div>
                    <div className="user-dropdown-info">
                      <span className="user-dropdown-name">{getDisplayName(user)}</span>
                      <span className="user-dropdown-email">{user.email}</span>
                    </div>
                  </div>

                  <div className="user-dropdown-divider" />

                  <Link
                    to="/dashboard"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FiUser size={15} />
                    Trang cá nhân
                  </Link>
                  <Link
                    to="/settings"
                    className="user-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FiSettings size={15} />
                    Cài đặt
                  </Link>

                  <div className="user-dropdown-divider" />

                  <button className="user-dropdown-item user-dropdown-item--danger" onClick={handleLogout}>
                    <FiLogOut size={15} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn--primary">Đăng nhập</Link>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
          ref={mobileRef}
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          <form className="navbar-search" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <Link to="/pho-thong" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Phổ thông</Link>
          <Link to="/skill-paths" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Kỹ năng</Link>
          {user ? (
            <>
              {/* User info mobile */}
              <div className="mobile-user-info">
                <div className="navbar-avatar navbar-avatar--sm">{getInitial(user)}</div>
                <div>
                  <div className="mobile-user-name">{getDisplayName(user)}</div>
                  <div className="mobile-user-email">{user.email}</div>
                </div>
              </div>
              <div className="user-dropdown-divider" style={{ margin: '4px 0' }} />
              <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                <FiUser size={15} /> Trang cá nhân
              </Link>
              <Link to="/settings" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                <FiSettings size={15} /> Cài đặt
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Admin</Link>
              )}
              <button className="mobile-nav-link mobile-nav-link--logout" onClick={handleLogout}>
                <FiLogOut size={16} /> Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn--primary" style={{ margin: '8px 0' }} onClick={() => setMobileOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
