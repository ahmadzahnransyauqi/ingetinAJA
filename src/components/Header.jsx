import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <span className="text-indigo-600 text-xl">📝</span>
            </div>
            <h1 className="text-2xl font-bold">IngetinAja</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6" />
              <div className="notification-badge">0</div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <div
                className="flex items-center space-x-2 cursor-pointer bg-white/20 hover:bg-white/30 p-2 rounded-lg"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <UserCircle className="w-6 h-6" />
                <span>{user?.username || "Guest"}</span>
                <ChevronDown className="w-4 h-4" />
              </div>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-10">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-semibold">
                      {user?.username || "Guest"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || "Belum login"}
                    </p>
                  </div>
                  <div className="py-1">
                    {user ? (
                      <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    ) : (
                      <>
                        <button className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </button>
                        <button className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
