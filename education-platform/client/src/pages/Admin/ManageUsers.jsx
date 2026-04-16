import { useEffect, useState } from 'react';
import { FiUserCheck, FiUserX, FiShield } from 'react-icons/fi';
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../api/adminApi';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const limit = 20;

  const load = (p = page) => {
    setLoading(true);
    getAdminUsers({ page: p, limit })
      .then((res) => {
        setUsers(res.data.users);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const toggleActive = async (user) => {
    setActionId(user.id);
    try {
      if (!user.is_active) {
        await updateAdminUser(user.id, { is_active: true });
      } else {
        await deleteAdminUser(user.id);
      }
      load();
    } finally {
      setActionId(null);
    }
  };

  const toggleRole = async (user) => {
    setActionId(user.id);
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    try {
      await updateAdminUser(user.id, { role: newRole });
      load();
    } finally {
      setActionId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Quản lý Users</h2>
        <span className="admin-badge">{total} người dùng</span>
      </div>

      {loading ? (
        <div className="admin-loading">Đang tải...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Tên hiển thị</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={!u.is_active ? 'admin-row--inactive' : ''}>
                    <td className="admin-td-id">{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.display_name || <span className="admin-empty">—</span>}</td>
                    <td>
                      <span className={`badge badge--${u.role === 'admin' ? 'blue' : 'green'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${u.is_active ? 'green' : 'gray'}`}>
                        {u.is_active ? 'Hoạt động' : 'Đã khoá'}
                      </span>
                    </td>
                    <td className="admin-td-date">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn admin-btn--icon"
                          title={u.role === 'admin' ? 'Hạ về student' : 'Nâng lên admin'}
                          onClick={() => toggleRole(u)}
                          disabled={actionId === u.id}
                        >
                          <FiShield size={15} />
                        </button>
                        <button
                          className={`admin-btn admin-btn--icon ${u.is_active ? 'admin-btn--danger' : 'admin-btn--success'}`}
                          title={u.is_active ? 'Khoá tài khoản' : 'Mở khoá'}
                          onClick={() => toggleActive(u)}
                          disabled={actionId === u.id}
                        >
                          {u.is_active ? <FiUserX size={15} /> : <FiUserCheck size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                className="btn btn--outline btn--sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </button>
              <span>Trang {page} / {totalPages}</span>
              <button
                className="btn btn--outline btn--sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageUsers;
