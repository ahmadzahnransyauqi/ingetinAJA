import React, { useState, useEffect } from "react";
import ImageUploadArea from "./NoteModal/ImageUploadArea";
import FileUploadArea from "./NoteModal/FileUploadArea";
import VoiceRecorderArea from "./NoteModal/VoiceRecorderArea";

const NoteModal = ({ note, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    checklist: [],
    images: [],
    files: [],
    voices: [],
    reminder: null,
    collaborators: [],
  });

  const [activeFeatures, setActiveFeatures] = useState({
    checklist: false,
    image: false,
    file: false,
    voice: false,
    reminder: false,
    collaborator: false,
  });

  useEffect(() => {
    if (note) {
      let parsedReminder = null;

      if (note.reminder) {
        if (typeof note.reminder === "string") {
          // Jika reminder adalah string (timestamp)
          const date = new Date(note.reminder);
          parsedReminder = {
            date: date.toISOString().split("T")[0],
            time: date.toTimeString().split(" ")[0].substring(0, 5),
            timestamp: date.getTime(),
          };
        } else if (note.reminder.timestamp) {
          // Jika reminder sudah dalam format object
          const date = new Date(note.reminder.timestamp);
          parsedReminder = {
            date: date.toISOString().split("T")[0],
            time: date.toTimeString().split(" ")[0].substring(0, 5),
            timestamp: note.reminder.timestamp,
          };
        } else if (note.reminder.date && note.reminder.time) {
          // Jika ada date dan time terpisah
          const dateTimeString = `${note.reminder.date}T${note.reminder.time}`;
          parsedReminder = {
            date: note.reminder.date,
            time: note.reminder.time,
            timestamp: new Date(dateTimeString).getTime(),
          };
        } else {
          // Jika format tidak dikenali, gunakan langsung
          parsedReminder = note.reminder;
        }
      }

      setFormData({
        title: note.title || "",
        text: note.text || "",
        checklist: note.checklist || [],
        images: note.images || [],
        files: note.files || [],
        voices: note.voices || [],
        reminder: parsedReminder,
        collaborators: note.collaborators || [],
      });

      setActiveFeatures({
        checklist: note.checklist && note.checklist.length > 0,
        image: note.images && note.images.length > 0,
        file: note.files && note.files.length > 0,
        voice: note.voices && note.voices.length > 0,
        reminder: !!note.reminder,
        collaborator: note.collaborators && note.collaborators.length > 0,
      });
    } else {
      setFormData({
        title: "",
        text: "",
        checklist: [],
        images: [],
        files: [],
        voices: [],
        reminder: null,
        collaborators: [],
      });
      setActiveFeatures({
        checklist: false,
        image: false,
        file: false,
        voice: false,
        reminder: false,
        collaborator: false,
      });
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title && !formData.text) {
      alert("Judul atau teks catatan harus diisi");
      return;
    }

    // Process reminder data sebelum disimpan
    let processedReminder = null;
    if (activeFeatures.reminder && formData.reminder) {
      if (formData.reminder.date && formData.reminder.time) {
        const dateTimeString = `${formData.reminder.date}T${formData.reminder.time}`;
        const timestamp = new Date(dateTimeString).getTime();

        processedReminder = {
          date: formData.reminder.date,
          time: formData.reminder.time,
          timestamp: timestamp,
        };
      } else if (formData.reminder.timestamp) {
        // Jika sudah ada timestamp, gunakan langsung
        processedReminder = formData.reminder;
      }
    }

    const submitData = {
      title: formData.title,
      text: formData.text,
      checklist: activeFeatures.checklist ? formData.checklist : [],
      images: activeFeatures.image ? formData.images : [],
      files: activeFeatures.file ? formData.files : [],
      voices: activeFeatures.voice ? formData.voices : [],
      reminder: processedReminder,
      collaborators: activeFeatures.collaborator ? formData.collaborators : [],
    };

    await onSave(submitData);
  };

  const toggleFeature = (feature) => {
    setActiveFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));

    // Jika reminder diaktifkan, inisialisasi dengan tanggal dan waktu default
    if (feature === "reminder" && !formData.reminder) {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1 jam dari sekarang

      setFormData((prev) => ({
        ...prev,
        reminder: {
          date: oneHourLater.toISOString().split("T")[0],
          time: oneHourLater.toTimeString().split(" ")[0].substring(0, 5),
          timestamp: oneHourLater.getTime(),
        },
      }));
    }
  };

  // Checklist functions
  const addChecklistItem = () => {
    const newItem = { text: "Item baru", checked: false };
    setFormData((prev) => ({
      ...prev,
      checklist: [...prev.checklist, newItem],
    }));
  };

  const updateChecklistItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeChecklistItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }));
  };

  const clearCompletedChecklist = () => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => !item.checked),
    }));
  };

  const completedChecklist = formData.checklist.filter(
    (item) => item.checked
  ).length;
  const totalChecklist = formData.checklist.length;

  // Reminder functions - PERBAIKAN DI SINI
  const handleReminderChange = (field, value) => {
    setFormData((prev) => {
      const currentReminder = prev.reminder || {};

      if (field === "date" || field === "time") {
        // Simpan date dan time secara terpisah
        const updatedReminder = {
          ...currentReminder,
          [field]: value,
        };

        // Jika kedua field sudah terisi, buat timestamp
        if (updatedReminder.date && updatedReminder.time) {
          try {
            const dateTimeString = `${updatedReminder.date}T${updatedReminder.time}`;
            const dateObj = new Date(dateTimeString);

            // Validasi date
            if (isNaN(dateObj.getTime())) {
              console.error("Invalid date:", dateTimeString);
              updatedReminder.timestamp = null;
            } else {
              updatedReminder.timestamp = dateObj.getTime();
            }
          } catch (error) {
            console.error("Error parsing date:", error);
            updatedReminder.timestamp = null;
          }
        } else {
          updatedReminder.timestamp = null;
        }

        return {
          ...prev,
          reminder: updatedReminder,
        };
      }

      return prev;
    });
  };

  // Collaborator functions
  const [newCollaborator, setNewCollaborator] = useState("");
  const addCollaborator = () => {
    if (
      newCollaborator.trim() &&
      !formData.collaborators.includes(newCollaborator.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, newCollaborator.trim()],
      }));
      setNewCollaborator("");
    }
  };

  const removeCollaborator = (index) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index),
    }));
  };

  // Helper untuk menampilkan preview reminder
  const getReminderPreview = () => {
    if (!formData.reminder || !formData.reminder.timestamp) return null;

    try {
      const date = new Date(formData.reminder.timestamp);
      if (isNaN(date.getTime())) return null;

      return date.toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return null;
    }
  };

  const reminderPreview = getReminderPreview();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {note ? "Edit Note" : "Tambah Note"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Judul (opsional)"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            placeholder="Tulis catatan..."
            rows="4"
            value={formData.text}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, text: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeFeatures.checklist}
                onChange={() => toggleFeature("checklist")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span>Checklist (belanja/dst.)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeFeatures.image}
                onChange={() => toggleFeature("image")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span>Upload Gambar</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeFeatures.file}
                onChange={() => toggleFeature("file")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span>Upload File</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeFeatures.voice}
                onChange={() => toggleFeature("voice")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span>Voice Note</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeFeatures.reminder}
                onChange={() => toggleFeature("reminder")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span>Reminder (tanggal & jam)</span>
            </label>

          </div>
          {/* Checklist Area */}
          {activeFeatures.checklist && (
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Checklist</h3>
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                >
                  + Tambah Item
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.checklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white rounded border"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) =>
                        updateChecklistItem(index, "checked", e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        updateChecklistItem(index, "text", e.target.value)
                      }
                      className="flex-1 px-2 py-1 border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                      placeholder="Item checklist..."
                    />
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {formData.checklist.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Progress: {completedChecklist}/{totalChecklist} selesai
                  </span>
                  {completedChecklist > 0 && (
                    <button
                      type="button"
                      onClick={clearCompletedChecklist}
                      className="text-red-500 hover:text-red-700"
                    >
                      Hapus yang selesai
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Image Upload Area */}
          {activeFeatures.image && (
            <ImageUploadArea
              images={formData.images}
              onChange={(images) =>
                setFormData((prev) => ({ ...prev, images }))
              }
            />
          )}
          {/* File Upload Area */}
          {activeFeatures.file && (
            <FileUploadArea
              files={formData.files}
              onChange={(files) => setFormData((prev) => ({ ...prev, files }))}
            />
          )}
          {/* Voice Recorder Area */}
          {activeFeatures.voice && (
            <VoiceRecorderArea
              voices={formData.voices}
              onChange={(voices) =>
                setFormData((prev) => ({ ...prev, voices }))
              }
            />
          )}
          {/* Reminder Area - PERBAIKAN DI SINI */}
          {activeFeatures.reminder && (
            <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold">Reminder</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={formData.reminder?.date || ""}
                  onChange={(e) => handleReminderChange("date", e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={new Date().toISOString().split("T")[0]} // Tidak bisa pilih tanggal kemarin
                />
                <input
                  type="time"
                  value={formData.reminder?.time || ""}
                  onChange={(e) => handleReminderChange("time", e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Preview Reminder */}
              {reminderPreview && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="text-sm font-medium text-blue-800">
                    ⏰ Reminder diatur untuk:
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    {reminderPreview}
                  </div>
                </div>
              )}

              {/* Validation Error */}
              {formData.reminder?.date &&
                formData.reminder?.time &&
                !formData.reminder?.timestamp && (
                  <div className="p-2 bg-red-50 rounded-md">
                    <div className="text-sm text-red-600">
                      ⚠️ Tanggal atau waktu tidak valid
                    </div>
                  </div>
                )}

              <div className="text-sm text-gray-500">
                Notifikasi akan muncul 1 jam dan 5 menit sebelum waktu reminder.
              </div>
            </div>
          )}
          {/* Collaborator Area */}
          {activeFeatures.collaborator && (
            <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold">Kolaborator</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Username collaborator"
                  value={newCollaborator}
                  onChange={(e) => setNewCollaborator(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addCollaborator}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Tambahkan
                </button>
              </div>

              {formData.collaborators.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.collaborators.map(
                    (
                      username,
                      index // Simpan usernames
                    ) => (
                      <div
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full flex items-center gap-1 text-sm"
                      >
                        {username}
                        <button
                          type="button"
                          onClick={() => removeCollaborator(index)}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="text-sm text-gray-500">
                Masukkan username untuk menambahkan kolaborator.
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              {note ? "Update Note" : "Simpan Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
