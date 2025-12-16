import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, User } from "lucide-react";
import { validateEmail } from "../utils/helpers";

const TaskModal = ({ isOpen, onClose, task, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "medium",
    status: "todo",
    reminder: "none",
    checklist: [],
    sharedWith: [],
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newCollaborator, setNewCollaborator] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        deadline: task.deadline ? task.deadline.split("T")[0] : "",
        priority: task.priority || "medium",
        status: task.status || "todo",
        reminder: task.reminder || "none",
        checklist:
          task.ChecklistItems?.map((item) => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
          })) || [],
        sharedWith: task.SharedTasks?.map((st) => st.collaborator_email) || [],
      });
    } else {
      // Set default deadline to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDeadline = tomorrow.toISOString().split("T")[0];

      setFormData({
        title: "",
        description: "",
        deadline: defaultDeadline,
        priority: "medium",
        status: "todo",
        reminder: "none",
        checklist: [],
        sharedWith: [],
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        checklist: [
          ...prev.checklist,
          {
            id: Date.now().toString(),
            text: newChecklistItem.trim(),
            completed: false,
          },
        ],
      }));
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklistItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }));
  };

  const handleToggleChecklistItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const handleAddCollaborator = () => {
    if (!validateEmail(newCollaborator)) {
      setErrors((prev) => ({ ...prev, collaborator: "Email tidak valid" }));
      return;
    }

    if (formData.sharedWith.includes(newCollaborator)) {
      setErrors((prev) => ({
        ...prev,
        collaborator: "Email sudah ditambahkan",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      sharedWith: [...prev.sharedWith, newCollaborator],
    }));
    setNewCollaborator("");
    setErrors((prev) => ({ ...prev, collaborator: null }));
  };

  const handleRemoveCollaborator = (email) => {
    setFormData((prev) => ({
      ...prev,
      sharedWith: prev.sharedWith.filter((e) => e !== email),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Judul tugas harus diisi";
    if (!formData.deadline) newErrors.deadline = "Deadline harus diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData, task?.id);
    onClose();
  };

  const calculateChecklistProgress = () => {
    if (formData.checklist.length === 0) return 0;
    const completed = formData.checklist.filter(
      (item) => item.completed
    ).length;
    return Math.round((completed / formData.checklist.length) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {task ? "Edit Tugas" : "Tambah Tugas Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {/* Title */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Judul Tugas *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Misal: Membuat laporan keuangan"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Deskripsi Tugas
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Deskripsi detail tentang tugas ini..."
              />
            </div>

            {/* Deadline & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.deadline ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.deadline && (
                  <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Prioritas
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
            </div>

            {/* Status & Reminder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Pengingat
                </label>
                <select
                  name="reminder"
                  value={formData.reminder}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="none">Tidak ada</option>
                  <option value="1-hour">1 jam sebelum deadline</option>
                  <option value="1-day">1 hari sebelum deadline</option>
                  <option value="same-day">Pada hari deadline</option>
                </select>
              </div>
            </div>

            {/* Checklist */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-medium">
                  Checklist Subtugas (Opsional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddChecklistItem()
                    }
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    placeholder="Tambah item checklist"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                {formData.checklist.length > 0 ? (
                  <>
                    <div className="space-y-2 mb-3">
                      {formData.checklist.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => handleToggleChecklistItem(index)}
                              className="checkbox-custom mr-3"
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
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {
                          formData.checklist.filter((item) => item.completed)
                            .length
                        }
                        /{formData.checklist.length} selesai
                      </span>
                      <div className="w-24 progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${calculateChecklistProgress()}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-2">
                    Belum ada checklist
                  </p>
                )}
              </div>
            </div>

            {/* Collaboration */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-medium">
                  Kolaborasi (Bagikan dengan pengguna lain)
                </label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-3">
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newCollaborator}
                      onChange={(e) => setNewCollaborator(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddCollaborator()
                      }
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      placeholder="Email pengguna"
                    />
                    <button
                      type="button"
                      onClick={handleAddCollaborator}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah
                    </button>
                  </div>
                  {errors.collaborator && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.collaborator}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Masukkan email pengguna yang ingin diajak berkolaborasi
                  </p>
                </div>

                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Kolaborator:
                  </h4>
                  {formData.sharedWith.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.sharedWith.map((email) => (
                        <div key={email} className="collaborator-tag">
                          <User className="w-3 h-3 mr-1" />
                          {email}
                          <button
                            type="button"
                            onClick={() => handleRemoveCollaborator(email)}
                            className="ml-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Belum ada kolaborator
                    </p>
                  )}
                </div>

                <div className="text-xs text-gray-600">
                  <span className="inline-block mr-1">💡</span>
                  Kolaborator akan dapat melihat dan mengedit tugas ini
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition duration-200"
              >
                {task ? "Update Tugas" : "Simpan Tugas"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
