import React, { useState } from 'react';
import SidebarAdmin from './SidebarAdmin';
import HeaderAdmin from './HeaderAdmin';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <SidebarAdmin
        isOpen={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <HeaderAdmin toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 px-8 py-6 overflow-auto">
        <section className="max-w-8xl mx-auto mt-4">
          <Outlet />
        </section>
        </main>
      </div>
    </div>
  );
};

export default Layout;