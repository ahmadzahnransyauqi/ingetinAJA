import React, { useState } from "react";
import { useTask } from "../contexts/TaskContext";
import TaskItem from "./TaskItem";
import { Search, Filter, Clock } from "lucide-react";

const TaskList = ({ onEditTask }) => {
  const {
    getAllTasks,
    currentFilter,
  } = useTask();
  const [searchTerm, setSearchTerm] = useState("");

  const allTasks = getAllTasks();

  // 1. Logika Filter (Berdasarkan Search & Sidebar)
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

  // Logika Smart Sort: TANGGAL DULU, baru PRIORITAS
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    //TANGGAL (Deadline)
    const dateA = new Date(a.deadline || 0).setHours(0, 0, 0, 0);
    const dateB = new Date(b.deadline || 0).setHours(0, 0, 0, 0);

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    //PRIORITAS (High > Med > Low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const pA = priorityOrder[a.priority] || 0;
    const pB = priorityOrder[b.priority] || 0;

    return pB - pA;
  });

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl shadow">
        <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Daftar Tugas</h2>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Pencarian */}
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
            
            {/* Indikator Urutan Aktif */}
            <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200 text-xs font-bold whitespace-nowrap">
              <Clock className="w-3 h-3 mr-1" />
              Urutan: Waktu & Prioritas
            </div>
          </div>
        </div>

        <div className="p-5">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-500">
                {searchTerm ? "Pencarian tidak ditemukan" : "Semua tugas selesai!"}
              </h3>
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