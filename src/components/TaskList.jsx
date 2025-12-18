import React from "react";
import { useTask } from "../contexts/TaskContext";
import { List, Calendar, AlertCircle, Users, CheckCircle, Clock } from "lucide-react";

const Sidebar = ({ onAddTask, onFilterChange }) => {
  
  const { getStatistics, sharedTasks, currentFilter } = useTask();
  const stats = getStatistics();

  const getButtonClass = (filterType) => {
    const baseClass = "filter-btn w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors duration-200 ";

    if (currentFilter === filterType) {
      return baseClass + "bg-indigo-100 text-indigo-700 font-bold border-l-4 border-indigo-500";
    }
    
    // Kalau tidak -> Warna Biasa (Inactive)
    return baseClass + "text-gray-700 hover:bg-gray-100";
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Statistik Tugas
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats.todoCount}
            </p>
            <p className="text-xs text-blue-800 font-medium mt-1">To Do</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.inProgressCount}
            </p>
            <p className="text-xs text-yellow-800 font-medium mt-1">On Progress</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.doneCount}
            </p>
            <p className="text-xs text-green-800 font-medium mt-1">Done</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2 text-sm">
            Progress Keseluruhan
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-right text-xs text-gray-500 mt-2">
            {stats.progressPercentage}% selesai
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wider">Filter Tugas</h3>
          <div className="space-y-1">
            {/* Tombol Semua Tugas */}
            <button
              onClick={() => onFilterChange("all")}
              className={getButtonClass("all")}
            >
              <List className="w-4 h-4 mr-2" />
              Semua Tugas
            </button>

            {/* Tombol Hari Ini */}
            <button
              onClick={() => onFilterChange("today")}
              className={getButtonClass("today")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Deadline Hari Ini
            </button>

            {/* Tombol Prioritas Tinggi */}
            <button
              onClick={() => onFilterChange("high")}
              className={getButtonClass("high")}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Prioritas Tinggi
            </button>

            {/* Tombol Sedang Dikerjakan (Baru) */}
            <button
              onClick={() => onFilterChange("in-progress")}
              className={getButtonClass("in-progress")}
            >
              <Clock className="w-4 h-4 mr-2" />
              Sedang Dikerjakan
            </button>

             {/* Tombol Selesai (Baru) */}
             <button
              onClick={() => onFilterChange("done")}
              className={getButtonClass("done")}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Selesai
            </button>
          </div>
        </div>

        <button
          onClick={onAddTask}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-lg shadow-indigo-200"
        >
          <span className="mr-2 text-xl">+</span>
          Tambah Tugas Baru
        </button>
      </div>

      {/* Shared Tasks Panel */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Tugas Dibagikan
        </h2>
        <div className="space-y-3">
          {sharedTasks.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm text-gray-500 italic">
                Belum ada tugas kolaborasi
                </p>
            </div>
          ) : (
            sharedTasks.map((task) => (
              <div key={task.id} className="bg-gray-50 p-3 rounded-lg border hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm text-gray-800 line-clamp-1">
                    {task.title}
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {task.priority === "high" ? "High" : task.priority === "medium" ? "Med" : "Low"}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500 flex items-center">
                     👤 {task.User?.username || "Teman"}
                  </span>
                  <span className="text-xs text-gray-500">
                    📅{" "}
                    {new Date(task.deadline).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;