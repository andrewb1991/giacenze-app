// components/admin/sections/AdminCreaOrdiniSection.js
import React from 'react';
import Navigation, { SidebarProvider } from '../../shared/Navigation';
import SidebarMenu from '../../shared/SidebarMenu';
import CreaOrdini from '../CreaOrdini';

const AdminCreaOrdiniSection = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Sidebar Menu */}
        <SidebarMenu />

        {/* Navigation */}
        <Navigation title="📊 Crea Ordini" showBackToDashboard={true} showSidebarToggle={true} />

        {/* Content */}
        <div className="relative z-10 w-full mx-auto pt-20 pb-6 px-4 sm:px-6 lg:px-8">
          <CreaOrdini />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminCreaOrdiniSection;