import axios from "axios";

// Konfigurasi API
const API_URL = "http://localhost:5000/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan token ke setiap request
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

// Interceptor untuk menangani response error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau tidak valid
      localStorage.removeItem("token");
      localStorage.removeItem("ingetinaja_user");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem(
          "ingetinaja_user",
          JSON.stringify(response.data.data.user)
        );
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem(
          "ingetinaja_user",
          JSON.stringify(response.data.data.user)
        );
      }

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  async getProfile() {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("ingetinaja_user");
  },
};

// Notes Service
export const notesService = {
  async getAllNotes(filter = "all") {
    try {
      const response = await api.get("/notes");
      return response.data.data || [];
    } catch (error) {
      console.error("Get all notes error:", error);
      throw error;
    }
  },

  async getNoteById(noteId) {
    try {
      const response = await api.get(`/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error("Get note by ID error:", error);
      throw error;
    }
  },

  async createNote(noteData) {
    try {
      const response = await api.post("/notes", noteData);
      return response.data;
    } catch (error) {
      console.error("Create note error:", error);
      throw error;
    }
  },

  async updateNote(noteId, noteData) {
    try {
      const response = await api.put(`/notes/${noteId}`, noteData);
      return response.data;
    } catch (error) {
      console.error("Update note error:", error);
      throw error;
    }
  },

  async deleteNote(noteId) {
    try {
      const response = await api.delete(`/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error("Delete note error:", error);
      throw error;
    }
  },

  async getNotesWithReminders() {
    try {
      const response = await api.get("/notes/filter/reminder");
      return response.data.data || [];
    } catch (error) {
      console.error("Get notes with reminders error:", error);
      throw error;
    }
  },

  async updateReminder(noteId, reminder) {
    try {
      const response = await api.patch(`/notes/${noteId}/reminder`, {
        reminder,
      });
      return response.data;
    } catch (error) {
      console.error("Update reminder error:", error);
      throw error;
    }
  },

  async getNoteCollaborators(noteId) {
    try {
      const response = await api.get(`/notes/${noteId}/collaborators`);
      return response.data.data || [];
    } catch (error) {
      console.error("Get note collaborators error:", error);
      throw error;
    }
  },

  async addCollaborator(noteId, collaboratorUsername) {
    try {
      const response = await api.post(`/notes/${noteId}/collaborators`, {
        collaboratorUsername,
      });
      return response.data;
    } catch (error) {
      console.error("Add collaborator error:", error);
      throw error;
    }
  },

  async removeCollaborator(noteId, collaboratorId) {
    try {
      const response = await api.delete(
        `/notes/${noteId}/collaborators/${collaboratorId}`
      );
      return response.data;
    } catch (error) {
      console.error("Remove collaborator error:", error);
      throw error;
    }
  },

  async shareNote(noteId, usernames) {
    try {
      const response = await api.patch(`/notes/${noteId}/share`, {
        collaborators: usernames
      });
      console.log("Share note response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Share note error:", error);
      throw error;
    }
  },
};

// Users Service - PERBAIKAN
export const usersService = {
  async searchUsers(query) {
    try {
      console.log("Searching users with query:", query);
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      console.log("Search response:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("Search users error:", error);
      // Fallback ke endpoint alternatif jika endpoint utama gagal
      try {
        const allUsersResponse = await api.get("/users");
        const allUsers = allUsersResponse.data.data || [];
        return allUsers.filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
        throw error;
      }
    }
  },

  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error("Get user by ID error:", error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const response = await api.get("/users");
      return response.data.data || [];
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  },
};

// Upload Service
export const uploadService = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Upload image error:", error);
      throw error;
    }
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "file");

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Upload file error:", error);
      throw error;
    }
  },

  async uploadVoice(file, duration) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "voice");

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Tambahkan durasi ke response
      return {
        ...response.data,
        data: {
          ...response.data.data,
          duration: duration,
        },
      };
    } catch (error) {
      console.error("Upload voice error:", error);
      throw error;
    }
  },
};

// Health Check
export const healthService = {
  async check() {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check error:", error);
      throw error;
    }
  },
};

// Export default API instance
export default api;
