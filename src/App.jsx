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
  
  // 1. Tambah 'loadTasks' di sini
  const { createTask, updateTask, setCurrentFilter, loadTasks } = useTask();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  // 2. Tambah useEffect ini biar data muncul!
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

  if (authLoading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Sidebar onAddTask={handleAddTask} onFilterChange={setCurrentFilter} />
            <TaskList onEditTask={handleEditTask} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center mt-10">
            <h1 className="text-3xl font-bold mb-4">Selamat Datang di IngetinAja</h1>
            <button onClick={() => handleOpenAuthModal("login")} className="bg-indigo-500 text-white px-6 py-3 rounded-lg mr-4">Login</button>
            <button onClick={() => handleOpenAuthModal("register")} className="border border-indigo-500 text-indigo-500 px-6 py-3 rounded-lg">Register</button>
          </div>
        )}
      </main>
      
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