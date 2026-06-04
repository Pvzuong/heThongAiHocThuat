import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { FiUsers, FiBookOpen, FiSettings, FiGrid } from 'react-icons/fi';
import ManageUsers from './ManageUsers';
import ManageLessons from './ManageLessons';
import GeminiSettings from './GeminiSettings';

const NAV_ITEMS = [
  { to: '/admin/users',   label: 'Quản lý Users',   icon: <FiUsers /> },
  { to: '/admin/content', label: 'Nội dung bài học', icon: <FiBookOpen /> },
  { to: '/admin/gemini',  label: 'Cài đặt Gemini',  icon: <FiSettings /> },
];

const AdminLayout = () => (
  <div className="admin-layout">
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <FiGrid size={20} />
        <span>Admin Panel</span>
      </div>
      <nav className="admin-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>

    <main className="admin-content">
      <Routes>
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="content" element={<ManageLessons />} />
        <Route path="gemini" element={<GeminiSettings />} />
      </Routes>
    </main>
  </div>
);

export default AdminLayout;
