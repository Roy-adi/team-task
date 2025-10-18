import React, { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from './Sidebar';
import Navbar from "./Navbar";

const Layout = ({ showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop sidebar collapse state

  const handleMobileMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={handleMobileSidebarClose}
            collapsed={sidebarCollapsed}
            onToggle={handleSidebarToggle}
          />
        )}

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            showSidebar && !sidebarCollapsed 
              ? "lg:ml-64" 
              : showSidebar && sidebarCollapsed 
                ? "lg:ml-20" 
                : ""
          } overflow-hidden`}
        >
          {/* Navbar */}
          <Navbar 
            onMenuClick={handleMobileMenuClick} 
            onSidebarToggle={handleSidebarToggle}
            showSidebar={showSidebar}
          />

          {/* Content Area - This is where the routed pages will render */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-full mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;