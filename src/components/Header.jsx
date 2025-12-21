import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTask } from "../contexts/TaskContext";
import { Bell, UserCircle, ChevronDown, LogOut, Clock, X } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const { notifications } = useTask();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

 
  const formatNotifTime = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) 
      ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3 font-bold text-2xl">
          <div className="bg-white p-2 rounded-lg text-indigo-600">📝</div>
          <h1>IngetinAja</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Lonceng */}
          <div className="relative">
            <div className="p-2 hover:bg-white/10 rounded-full cursor-pointer transition-colors relative" 
                 onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}>
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-indigo-500">
                  {notifications.length}
                </div>
              )}
            </div>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-xl shadow-2xl z-[60] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center font-bold text-sm">
                  <span>Notifikasi</span>
                  <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-200 rounded-full">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-8 text-center text-xs text-gray-500 italic">Belum ada pengingat tugas</p>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b hover:bg-indigo-50 flex gap-3 transition-colors">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold leading-tight text-gray-800">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{formatNotifTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative flex items-center space-x-2 cursor-pointer bg-white/20 p-2 rounded-lg" 
               onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}>
            <UserCircle className="w-6 h-6" />
            <span className="hidden sm:inline font-medium">{user?.username || "Guest"}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-3 w-48 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 font-bold text-sm truncate">{user?.username}</div>
                <button onClick={logout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;