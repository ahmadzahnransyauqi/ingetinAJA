import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(loginData);

      if (result.success) {
        onLoginSuccess?.();
        onClose();
      } else {
        setError(result.message || "Login gagal");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });

      if (result.success) {
        onLoginSuccess?.();
        onClose();
      } else {
        setError(result.message || "Registrasi gagal");
      }
    } catch (error) {
      console.error("Register error:", error);
      setError("Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {activeTab === "login" ? "Masuk ke Akun Anda" : "Daftar Akun Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            className={`flex-1 py-2 text-center rounded-md transition-all ${
              activeTab === "login"
                ? "bg-white text-indigo-600 font-semibold shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Masuk
          </button>
          <button
            className={`flex-1 py-2 text-center rounded-md transition-all ${
              activeTab === "register"
                ? "bg-white text-indigo-600 font-semibold shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Daftar
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username atau Email
              </label>
              <input
                type="text"
                placeholder="Masukkan username atau email"
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <div className="text-center text-sm text-slate-500 mt-4">
              Belum punya akun?
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className="text-indigo-600 hover:text-indigo-500 font-medium ml-1 transition"
              >
                Daftar di sini
              </button>
            </div>

            {/* Demo credentials */}
            <div className="text-xs text-slate-400 text-center mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold">Demo Credentials:</p>
              <p>
                Username: <span className="font-mono">demo</span>
              </p>
              <p>
                Password: <span className="font-mono">demo123</span>
              </p>
            </div>
          </form>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Pilih username"
                value={registerData.username}
                onChange={(e) =>
                  setRegisterData({ ...registerData, username: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Masukkan email Anda"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Buat password (minimal 6 karakter)"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Konfirmasi Password
              </label>
              <input
                type="password"
                placeholder="Ulangi password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </button>

            <div className="text-center text-sm text-slate-500 mt-4">
              Sudah punya akun?
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-indigo-600 hover:text-indigo-500 font-medium ml-1 transition"
              >
                Masuk di sini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
