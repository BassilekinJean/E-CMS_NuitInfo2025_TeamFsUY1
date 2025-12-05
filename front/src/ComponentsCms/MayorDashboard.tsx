// ComponentsCms/MayorDashboard.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LeftNavigation } from './LeftNavigation';

export const MayorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-hidden">
      <LeftNavigation 
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Contenu principal décalé pour laisser la place à la barre latérale */}
      <div className="h-full flex ml-20 lg:ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default MayorDashboard;