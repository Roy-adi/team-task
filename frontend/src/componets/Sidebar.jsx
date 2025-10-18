import { Globe, Home, MessageCircle, User, X, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router';
import useAuthUser from '../hooks/useAuthUser';

const Sidebar = ({ isOpen, onClose, collapsed, onToggle }) => {
  const location = useLocation();
   const { authUser } = useAuthUser();
  
  const sidebarItems = [
    { name: 'Dashboard', icon: Home, link: '/' },
    { name: 'Projects', icon: User, link: '/projects' },
    { name: 'Tasks', icon: MessageCircle, link: '/tasks' }, 
  ];

  // Function to check if the current route matches the sidebar item
  const isActiveItem = (itemLink) => {
    if (itemLink === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(itemLink);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:fixed inset-y-0 left-0 z-50 bg-base-200 
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-all duration-300 ease-in-out
        border-r border-base-300
        ${collapsed ? 'lg:w-20' : 'w-64 lg:w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className={`flex items-center justify-between p-6 border-b border-base-300 ${collapsed ? 'lg:px-4' : ''}`}>
            <Link 
              to="/" 
              className={`flex items-center space-x-3 ${collapsed ? 'lg:justify-center lg:space-x-0' : ''}`} 
              onClick={onClose}
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-primary-content" />
              </div>
              {!collapsed && (
                <div className="lg:block">
                  <h1 className="text-xl font-bold text-base-content">LinguaConnect</h1>
                  <p className="text-xs text-base-content/60">Learn Together</p>
                </div>
              )}
            </Link>
            
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="lg:hidden btn btn-ghost btn-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Collapse toggle for desktop */}
          <div className="hidden lg:block px-4 py-2">
            <button
              onClick={onToggle}
              className={`btn btn-ghost btn-sm w-full flex items-center ${
                collapsed ? 'justify-center' : 'justify-start'
              }`}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  <span className="text-sm">Collapse</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 p-4 space-y-2 ${collapsed ? 'lg:px-2' : ''}`}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveItem(item.link);
              
              return (
                <Link
                  key={item.name}
                  to={item.link}
                  onClick={onClose} // Close sidebar on mobile when item is clicked
                  className={`
                    w-full flex items-center rounded-xl
                    transition-all duration-200
                    ${collapsed ? 'lg:justify-center lg:px-4 lg:py-3' : 'space-x-3 px-4 py-3'}
                    ${isActive 
                      ? 'bg-primary text-primary-content shadow-lg' 
                      : 'text-base-content hover:text-primary'
                    }
                  `}
                  title={collapsed ? item.name : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium lg:block">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section - User info or additional items */}
          <div className={`p-4 border-t border-base-300 ${collapsed ? 'lg:px-2' : ''}`}>
            <div className={`
              flex items-center p-3 rounded-xl bg-base-300/50 cursor-pointer
              transition-all duration-200
              ${collapsed ? 'lg:justify-center' : 'space-x-3'}
            `}>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <img src={authUser.profilePic} alt={authUser.fullName} />
              </div>
              {!collapsed && (
                <div className="lg:block min-w-0 flex-1">
                  <p className="text-sm font-medium text-base-content truncate">{authUser.fullName}</p>
                  <p className="text-xs text-base-content/60 truncate">{authUser.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;