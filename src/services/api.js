import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR REQUEST - menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("🔄 Interceptor: Token =", token ? "ADA" : "TIDAK ADA");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Header Authorization ditambahkan");
    } else {
      console.warn("⚠️ Token tidak ditemukan, request akan gagal");
    }

    return config;
  },
  (error) => {
    console.error("❌ Error interceptor:", error);
    return Promise.reject(error);
  }
);

// INTERCEPTOR RESPONSE - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("🔄 Response interceptor:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.log("🔒 401 Unauthorized - Hapus token dan redirect");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect ke halaman login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Tasks API
export const tasksAPI = {
  getAllTasks: () => api.get("/tasks"),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post("/tasks", taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  updateTaskStatus: (id, status) =>
    api.patch(`/tasks/${id}/status`, { status }),
  updateChecklistItem: (taskId, itemId, completed) =>
    api.patch(`/tasks/${taskId}/checklist/${itemId}`, { completed }),
  getTasksWithFilter: (filter) => api.get(`/tasks/filter?filter=${filter}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get("/notifications"),
};

export default api;
