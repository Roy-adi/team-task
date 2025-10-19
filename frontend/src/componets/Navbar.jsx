import React, { useState } from "react";
import { useThemeStore } from "../store/useTheme";
import { Bell, LogIn, LogOut, Menu, Search } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";

const themes = [
  "light",
  "dark",
  "cupcake",
  "emerald",
  "corporate",
  "garden",
  "forest",
  "business",
  "dim",
  "nord",
  "coffee"
];

const Navbar = ({ onMenuClick, onSidebarToggle, showSidebar }) => {
  const { theme, setTheme } = useThemeStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  

  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  const handleLogout = () => {
    logoutMutation();
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
  };

  return (
    <div className="bg-base-100 border-b border-base-300 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden btn btn-ghost btn-sm"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar toggle */}
          {showSidebar && (
            <button
              onClick={onSidebarToggle}
              className="hidden lg:flex btn btn-ghost btn-sm"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo for mobile */}
          <div className="lg:hidden">
            <div className="lg:block leading-tight">
                  <h1 className="text-2xl font-extrabold tracking-tight text-base-content select-none">
                    Team<span className="font-light italic opacity-80">Up</span>
                  </h1>
                  <p className="text-[0.7rem] uppercase tracking-widest font-semibold opacity-70">
                    Build Together
                  </p>
                </div>
          </div>
        </div>

        {/* Right section (desktop only layout) */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search - desktop */}
          {/* <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <input
              type="text"
              placeholder="Search conversations, friends..."
              className="input input-bordered pl-10 w-64 lg:w-80 bg-base-200 focus:bg-base-100 text-sm"
            />
          </div> */}

          {/* Mobile search button */}

          {/* Theme selector */}
          <div className="dropdown dropdown-end hidden sm:block">
            <label tabIndex={0} className="btn btn-ghost btn-sm">
              <span className="hidden md:inline mr-2">Theme</span>
              <div className="w-4 h-4 bg-primary rounded-full"></div>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-200 rounded-box w-52 max-h-100 overflow-y-auto"
            >
              {themes.map((themeName) => (
                <li key={themeName}>
                  <button
                    onClick={() => setTheme(themeName)}
                    className={`capitalize ${
                      theme === themeName ? "active" : ""
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full bg-primary mr-2"
                      data-theme={themeName}
                    ></div>
                    {themeName}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Login/Logout */}
          <button
            onClick={handleLogout}
            className={`btn btn-sm ${
              isLoggedIn ? "btn-outline" : "btn-primary"
            }`}
          >
            {isLoggedIn ? (
              <>
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Login</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECOND ROW (Mobile only) */}
      <div className="mt-3 flex flex-row-1 gap-5 sm:hidden">
        {/* Theme selector */}
        <div className="dropdown">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-sm w-full justify-between"
          >
            <span>Theme</span>
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-200 rounded-box w-52 max-h-80 overflow-y-auto"
          >
            {themes.map((themeName) => (
              <li key={themeName}>
                <button
                  onClick={() => setTheme(themeName)}
                  className={`capitalize ${
                    theme === themeName ? "active" : ""
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full bg-primary mr-2"
                    data-theme={themeName}
                  ></div>
                  {themeName}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Search input */}
        {/* <div className="relative basis-2/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50 z-40" />
          <input
            type="text"
            placeholder="Search conversations, friends..."
            className="input input-bordered pl-10 w-full bg-base-200 focus:bg-base-100 text-sm"
          />
        </div> */}
      </div>
    </div>
  );
};

export default Navbar;
