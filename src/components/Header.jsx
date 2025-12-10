import React from "react";
import { useAuth } from "../context/AuthContext";

const Header = ({ onLoginClick }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
          IA
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">IngetinAja</h1>
          <p className="text-sm text-slate-500">
            Catatan, pengingat, dan kolaborasi — semua simpel.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isAuthenticated ? (
          <button
            onClick={onLoginClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Masuk
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-700">
              Hi, <span className="font-semibold">{user?.username}</span>
            </div>
            <button
              onClick={logout}
              className="px-3 py-2 border rounded-lg hover:bg-slate-50 transition"
            >
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
