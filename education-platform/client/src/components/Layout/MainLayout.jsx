import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Topbar } from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-wrapper">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="app-body">
        <Topbar onMenuClick={() => setMobileOpen((v) => !v)} />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
