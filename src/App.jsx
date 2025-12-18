import React, { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { TaskProvider } from "./contexts/TaskContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TaskList from "./components/TaskList";
import TaskModal from "./components/TaskModal";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./contexts/AuthContext";
import { useTask } from "./contexts/TaskContext";
import { CheckCircle } from "lucide-react";

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  
  //ngambil data pas login
  const { createTask, updateTask, setCurrentFilter, loadTasks } = useTask();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [authMode, setAuthMode] = useState("login");


  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, loadTasks]);

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
    } else {
      await createTask(taskData);
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-6 flex-grow">
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Sidebar 
              onAddTask={handleAddTask} 
              onFilterChange={setCurrentFilter} 
            />
            <TaskList onEditTask={handleEditTask} />
          </div>
        ) : (
          //tampilan depan 
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <CheckCircle className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Selamat Datang di IngetinAja
              </h1>
              <p className="text-gray-600 mb-8">
                Aplikasi pengelola tugas harian yang membantu Anda mengatur
                pekerjaan, berkolaborasi dengan tim, dan tidak pernah melewatkan
                deadline.
              </p>

              {/* Grid fitur yg di depan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-indigo-50 rounded-lg">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-bold text-gray-800 mb-2">Kelola Tugas</h3>
                  <p className="text-sm text-gray-600">Buat, edit, dan pantau tugas dengan mudah</p>
                </div>
                <div className="p-6 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">👥</div>
                  <h3 className="font-bold text-gray-800 mb-2">Kolaborasi</h3>
                  <p className="text-sm text-gray-600">Bagikan tugas dengan tim dan kerjakan bersama</p>
                </div>
                <div className="p-6 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-2">⏰</div>
                  <h3 className="font-bold text-gray-800 mb-2">Pengingat</h3>
                  <p className="text-sm text-gray-600">Dapatkan notifikasi sebelum deadline tiba</p>
                </div>
              </div>

              <div className="space-x-4">
                <button
                  onClick={() => handleOpenAuthModal("login")}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => handleOpenAuthModal("register")}
                  className="bg-white hover:bg-gray-50 text-indigo-600 font-medium py-3 px-6 rounded-lg border border-indigo-600 transition duration-200"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">📝 IngetinAja - Pengelola Tugas Harian</p>
          <p className="text-gray-400 text-xs mt-1">© {new Date().getFullYear()} Dibuat oleh tim RAR aja</p>
        </div>
      </footer>

      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          task={editingTask}
          onSave={handleSaveTask}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
        />
      )}
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