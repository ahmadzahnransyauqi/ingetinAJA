import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTask } from "../contexts/TaskContext"; // Import useTask untuk ambil data asli
import {
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Clock,
  X
} from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const { notifications } = useTask();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <span className="text-indigo-600 text-xl">📝</span>
            </div>
            <h1 className="text-2xl font-bold">IngetinAja</h1>
          </div>

          <div className="flex items-center space-x-4">
            
           
            <div className="relative">
              <div 
                className="relative cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
              >
                <Bell className="w-6 h-6" />
             
                {notifications.length > 0 && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-indigo-500">
                    {notifications.length}
                  </div>
                )}
              </div>

          
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-xl shadow-2xl z-[60] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Notifikasi</h3>
                    <button onClick={() => setShowNotifications(false)}>
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-gray-300 text-3xl mb-2">🔔</div>
                        <p className="text-xs text-gray-500 italic">Belum ada pengingat tugas</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-4 border-b hover:bg-indigo-50 transition-colors cursor-default">
                          <div className="flex gap-3">
                            <div className="bg-amber-100 p-2 rounded-full h-fit">
                              <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-grow">
                              <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 bg-gray-50 text-center border-t">
                      <p className="text-[10px] text-indigo-600 font-medium italic">
                        Cek tugasmu secara berkala!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

        
            <div className="relative">
              <div
                className="flex items-center space-x-2 cursor-pointer bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
              >
                <UserCircle className="w-6 h-6" />
                <span className="hidden sm:inline font-medium">{user?.username || "Guest"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </div>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white text-gray-800 rounded-xl shadow-2xl z-[60] border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-bold truncate">{user?.username || "Guest"}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    {user ? (
                      <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Keluar
                      </button>
                    ) : (
                      <div className="p-2 space-y-1">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 rounded-lg">Login</button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 rounded-lg">Register</button>
                      </div>
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