import React, { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { TaskProvider } from "./contexts/TaskContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TaskList from "./components/TaskList";
import TaskModal from "./components/TaskModal";
import AuthModal from "./components/AuthModal";
import Notification from "./components/Notification";
import { useAuth } from "./contexts/AuthContext";
import { useTask } from "./contexts/TaskContext";
import { CheckCircle } from "lucide-react";

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  const { createTask, updateTask, setCurrentFilter, loadTasks, loadNotifications } = useTask();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    if (user) {
      loadTasks();
      loadNotifications(); 
    }
  }, [user, loadTasks, loadNotifications]);

  const handleAddTask = () => {
    if (!user) {
      setAuthMode("login");
      setShowAuthModal(true);
      return;
    }
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleSaveTask = async (taskData, taskId) => {
    if (taskId) {
      await updateTask(taskId, taskData);
    
      await loadNotifications(); 
      await loadTasks();
    } else {
      await createTask(taskData);
    }
    setShowTaskModal(false);
  };

  const handleOpenAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Sidebar onAddTask={handleAddTask} onFilterChange={setCurrentFilter} />
            <TaskList onEditTask={handleEditTask} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <CheckCircle className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">IngetinAja</h1>
              <p className="text-gray-600 mb-8">Kelola tugas harian dan kolaborasi tim Anda dengan mudah.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
                <div className="p-6 bg-indigo-50 rounded-lg">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-bold text-gray-800">Kelola Tugas</h3>
                  <p className="text-xs text-gray-600 mt-1">Buat, edit, dan pantau tugas harian.</p>
                </div>
                <div className="p-6 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">👥</div>
                  <h3 className="font-bold text-gray-800">Kolaborasi</h3>
                  <p className="text-xs text-gray-600 mt-1">Bagikan tugas dengan tim.</p>
                </div>
                <div className="p-6 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-2">⏰</div>
                  <h3 className="font-bold text-gray-800">Pengingat</h3>
                  <p className="text-xs text-gray-600 mt-1">Notifikasi otomatis sebelum deadline.</p>
                </div>
              </div>
              <div className="space-x-4">
                <button onClick={() => handleOpenAuthModal("login")} className="bg-indigo-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-600 transition">Login</button>
                <button onClick={() => handleOpenAuthModal("register")} className="bg-white text-indigo-600 py-3 px-6 rounded-lg border border-indigo-600 font-medium hover:bg-gray-50 transition">Register</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Notification />
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Dibuat oleh tim RAR aja</p>
        </div>
      </footer>
      {showTaskModal && <TaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} task={editingTask} onSave={handleSaveTask} />}
      {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode={authMode} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <MainApp />
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;