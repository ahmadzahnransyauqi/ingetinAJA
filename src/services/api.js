import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://api-ingetin-aja.vercel.app/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
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
