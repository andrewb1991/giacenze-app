// components/admin/sections/AdminOperatoriSection.js
import React from 'react';
import Navigation, { SidebarProvider } from '../../shared/Navigation';
import SidebarMenu from '../../shared/SidebarMenu';
import OperatoriManagement from '../OperatoriManagement';

const AdminOperatoriSection = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Sidebar Menu */}
        <SidebarMenu />
        
        {/* Navigation */}
        <div className="relative z-10">
          <Navigation title="👥 Gestione Operatori" showBackToDashboard={true} showSidebarToggle={true} />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <OperatoriManagement />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminOperatoriSection;