import React from "react";
import { useTask } from "../contexts/TaskContext";
import { useAuth } from "../contexts/AuthContext";
import { Edit, Trash2, Users } from "lucide-react";
import {
  getDeadlineInfo,
  getPriorityInfo,
  getStatusInfo,
  getReminderInfo,
  calculateChecklistProgress,
} from "../utils/helpers";

const TaskItem = ({ task, onEdit }) => {
  const { updateTaskStatus, deleteTask, updateChecklistItem } = useTask();
  const { user } = useAuth();

  const isOwner = task.user_id === user?.id;
  const deadlineInfo = getDeadlineInfo(task.deadline);
  const priorityInfo = getPriorityInfo(task.priority);
  const statusInfo = getStatusInfo(task.status);
  const reminderInfo = getReminderInfo(task.reminder);
  const checklistProgress = calculateChecklistProgress(task.ChecklistItems);
  const sharedCount = task.SharedTasks?.length || 0;

  const handleStatusChange = async (newStatus) => {
    await updateTaskStatus(task.id, newStatus);
  };

  const handleChecklistChange = async (itemId, completed) => {
    await updateChecklistItem(task.id, itemId, completed);
  };

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      await deleteTask(task.id);
    }
  };

  return (
    <div
      className={`task-item bg-white border rounded-xl p-5 shadow-sm ${priorityInfo.badgeClass}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
          {sharedCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2 flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {sharedCount}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="edit-task p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="delete-task p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`text-xs ${deadlineInfo.className} px-3 py-1 rounded-full`}
        >
          📅 {deadlineInfo.text}
        </span>
        <span
          className={`text-xs ${priorityInfo.className} px-3 py-1 rounded-full`}
        >
          {priorityInfo.text}
        </span>
        <span
          className={`text-xs ${statusInfo.className} px-3 py-1 rounded-full`}
        >
          {statusInfo.text}
        </span>
        {reminderInfo.show && (
          <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            🔔 {reminderInfo.text}
          </span>
        )}
        <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
          {isOwner
            ? "Milik Anda"
            : `Dibagikan oleh: ${task.User?.email || "Pengguna lain"}`}
        </span>
      </div>

      {sharedCount > 0 && (
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700">
            Dibagikan dengan:
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {task.SharedTasks?.map((shared) => (
              <span key={shared.id} className="collaborator-tag">
                👤 {shared.collaborator_email}
              </span>
            ))}
          </div>
        </div>
      )}

      {task.ChecklistItems?.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Checklist:
            </span>
            <span className="text-xs text-gray-600">
              {checklistProgress}% selesai
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${checklistProgress}%` }}
            ></div>
          </div>
          <div className="mt-2 space-y-1">
            {task.ChecklistItems.map((item) => (
              <div key={item.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={(e) =>
                    handleChecklistChange(item.id, e.target.checked)
                  }
                  className="checkbox-custom mr-2"
                />
                <span
                  className={`text-sm ${
                    item.completed
                      ? "line-through text-gray-500"
                      : "text-gray-700"
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Dibuat: {new Date(task.created_at).toLocaleDateString("id-ID")}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusChange("todo")}
            className={`text-xs px-3 py-1 rounded-lg ${
              task.status === "todo"
                ? "bg-gray-100 text-gray-800"
                : "hover:bg-gray-100"
            }`}
          >
            To Do
          </button>
          <button
            onClick={() => handleStatusChange("in-progress")}
            className={`text-xs px-3 py-1 rounded-lg ${
              task.status === "in-progress"
                ? "bg-blue-100 text-blue-800"
                : "hover:bg-gray-100"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusChange("done")}
            className={`text-xs px-3 py-1 rounded-lg ${
              task.status === "done"
                ? "bg-green-100 text-green-800"
                : "hover:bg-gray-100"
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
