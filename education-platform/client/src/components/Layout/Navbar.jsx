import { Link, useNavigate } from 'react-router-dom';
import { FiBook, FiUser, FiLogOut, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="navbar" ref={menuRef}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
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
            <div className="navbar-user">
              <Link to="/dashboard" className="nav-link">
                <FiUser size={16} />
                <span>{user.display_name || user.email}</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link nav-link--admin">Admin</Link>
              )}
              <button className="btn-icon" onClick={handleLogout} title="Đăng xuất">
                <FiLogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn--primary">Đăng nhập</Link>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
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
          <Link to="/pho-thong" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Phổ thông</Link>
          <Link to="/skill-paths" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Kỹ năng</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <button className="mobile-nav-link mobile-nav-link--logout" onClick={handleLogout}>
                <FiLogOut size={16} /> Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn--primary" style={{ margin: '8px 0' }} onClick={() => setMenuOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
