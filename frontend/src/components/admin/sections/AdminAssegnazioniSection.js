// components/admin/sections/AdminAssegnazioniSection.js
import React from 'react';
import Navigation, { SidebarProvider } from '../../shared/Navigation';
import SidebarMenu from '../../shared/SidebarMenu';
import AssignmentsManagement from '../AssigmentsManagement';

const AdminAssegnazioniSection = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Sidebar Menu */}
        <SidebarMenu />

        {/* Navigation */}
        <Navigation title="📋 Gestione Assegnazioni" showBackToDashboard={true} showSidebarToggle={true} />

        {/* Content */}
        <div className="relative z-10 w-full mx-auto pt-20 pb-6 px-4 sm:px-6 lg:px-8">
          <AssignmentsManagement />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminAssegnazioniSection;