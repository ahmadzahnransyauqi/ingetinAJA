import React from "react";
import { useTask } from "../contexts/TaskContext";
import { List, Calendar, AlertCircle, Users } from "lucide-react";

const Sidebar = ({ onAddTask, onFilterChange }) => {
  const { getStatistics, sharedTasks } = useTask();
  const stats = getStatistics();

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
            <p className="text-sm text-blue-800">To Do</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.inProgressCount}
            </p>
            <p className="text-sm text-yellow-800">In Progress</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.doneCount}
            </p>
            <p className="text-sm text-green-800">Done</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">
            Progress Keseluruhan
          </h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${stats.progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-gray-600 mt-1">
            {stats.progressPercentage}% selesai
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Filter Tugas</h3>
          <div className="space-y-2">
            <button
              onClick={() => onFilterChange("all")}
              className="filter-btn w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center"
            >
              <List className="w-4 h-4 mr-2" />
              Semua Tugas
            </button>
            <button
              onClick={() => onFilterChange("today")}
              className="filter-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800 flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Deadline Hari Ini
            </button>
            <button
              onClick={() => onFilterChange("high")}
              className="filter-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800 flex items-center"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Prioritas Tinggi
            </button>
          </div>
        </div>

        <button
          onClick={onAddTask}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <span className="mr-2">+</span>
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
            <p className="text-sm text-gray-500 italic">
              Belum ada tugas yang dibagikan dengan Anda
            </p>
          ) : (
            sharedTasks.map((task) => (
              <div key={task.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm text-gray-800">
                    {task.title}
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.priority === "high"
                      ? "Tinggi"
                      : task.priority === "medium"
                      ? "Sedang"
                      : "Rendah"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full mr-2 ${
                        task.status === "todo"
                          ? "bg-gray-100 text-gray-800"
                          : task.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.status === "todo"
                        ? "To Do"
                        : task.status === "in-progress"
                        ? "In Progress"
                        : "Done"}
                    </span>
                    <span className="text-xs text-gray-600">
                      📅{" "}
                      {new Date(task.deadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Dibagikan oleh: {task.User?.email || "Pengguna lain"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
