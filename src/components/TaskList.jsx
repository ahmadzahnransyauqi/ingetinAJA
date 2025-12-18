import React, { useState } from "react";
import { useTask } from "../contexts/TaskContext";
import TaskItem from "./TaskItem";
import { Search, Filter } from "lucide-react";

const TaskList = ({ onEditTask }) => {
  const {
    getAllTasks,
    currentFilter,
    setCurrentFilter,
    currentSort,
    setCurrentSort,
  } = useTask();
  const [searchTerm, setSearchTerm] = useState("");

  const allTasks = getAllTasks();

  // Apply filters
  const filteredTasks = allTasks.filter((task) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    let matchesFilter = true;
    if (currentFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      
      matchesFilter = task.deadline?.split("T")[0] === today;
      
    } else if (currentFilter === "high") {
      matchesFilter = task.priority === "high";
    } else if (currentFilter === "in-progress") {
      matchesFilter = task.status === "in-progress";
    } else if (currentFilter === "done") {
      matchesFilter = task.status === "done";
    }

    return matchesSearch && matchesFilter;
  });

  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (currentSort === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (currentSort === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  const handleSortToggle = () => {
    setCurrentSort(currentSort === "deadline" ? "priority" : "deadline");
  };

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl shadow">
        <div className="p-5 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Daftar Tugas</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari tugas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm w-64"
                />
              </div>
              <button
                onClick={handleSortToggle}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title={`Urutkan berdasarkan ${
                  currentSort === "deadline" ? "prioritas" : "deadline"
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl text-gray-300 mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-500">
                {searchTerm ? "Tidak ditemukan tugas" : "Belum ada tugas"}
              </h3>
              <p className="text-gray-400 mt-2">
                {searchTerm
                  ? "Coba dengan kata kunci lain"
                  : 'Klik "Tambah Tugas Baru" untuk membuat tugas pertama Anda'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;