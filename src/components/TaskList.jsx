import React, { useState } from "react";
import { useTask } from "../contexts/TaskContext";
import TaskItem from "./TaskItem";
import { Search, Filter, ArrowUpDown } from "lucide-react";

const TaskList = ({ onEditTask }) => {
  const {
    getAllTasks,
    currentFilter,
    currentSort,
    setCurrentSort,
  } = useTask();
  const [searchTerm, setSearchTerm] = useState("");

  const allTasks = getAllTasks();

  //Logika Filtering 
  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      searchTerm === "" ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

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

  //Logika Sorting (Deadline & Prioritas)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (currentSort === "deadline") {
      // Urutkan dari tanggal paling dekat
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (currentSort === "priority") {
      // Urutkan dari High ke Low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  //Fungsi Klik Logo Filter untuk Ganti Urutan
  const handleSortToggle = () => {
    const nextSort = currentSort === "deadline" ? "priority" : "deadline";
    setCurrentSort(nextSort);
  };

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl shadow">
        <div className="p-5 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Daftar Tugas</h2>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari tugas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm w-full"
                />
              </div>

              {/* Tombol Sort (Logo Filter) */}
              <button
                onClick={handleSortToggle}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-all ${
                  currentSort === "priority" 
                  ? "bg-amber-50 border-amber-200 text-amber-700" 
                  : "bg-indigo-50 border-indigo-200 text-indigo-700"
                }`}
                title="Ganti urutan"
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs font-bold whitespace-nowrap">
                  {currentSort === "deadline" ? "Deadline" : "Prioritas"}
                </span>
                <ArrowUpDown className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-500">
                {searchTerm ? "Tugas tidak ditemukan" : "Tidak ada tugas"}
              </h3>
              <p className="text-gray-400 mt-2">
                {searchTerm ? "Coba kata kunci lain" : "Mulai dengan menambah tugas baru"}
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