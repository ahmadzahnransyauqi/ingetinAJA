import React, { useState } from "react";
import CollaboratorModal from "./CollaboratorModal";

const NoteCard = ({ note, onEdit, onDelete }) => {
  // Safety check - jika note tidak valid, jangan render
  if (!note || typeof note !== "object") {
    console.warn("Invalid note in NoteCard:", note);
    return null;
  }

  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);

  // Di dalam handleEdit dan handleDelete, tambahkan logging
  const handleEdit = () => {
    if (!note.id) {
      console.error("Cannot edit note without ID:", note);
      return;
    }
    console.log("Editing note:", note);
    onEdit(note);
  };

  const handleDelete = async () => {
    if (!note.id) {
      console.error("Cannot delete note without ID:", note);
      return;
    }

    console.log("Deleting note:", note.id);

    if (window.confirm("Hapus note ini?")) {
      try {
        await onDelete();
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Gagal menghapus note: " + error.message);
      }
    }
  };

  // Default values untuk mencegah error
  const {
    title = "(Tanpa judul)",
    text = "",
    checklist = [],
    images = [],
    files = [],
    voices = [],
    reminder = null,
    collaborators = [],
    owner_name = "Unknown",
    owner_id = null,
    created_at = new Date().toISOString(),
    updated_at = new Date().toISOString(),
  } = note;

  // Get current user ID
  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("ingetinaja_user"));
      return user?.id;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const isOwner = owner_id === currentUserId;

  const totalChecklist = checklist.length;
  const completedChecklist = checklist.filter(
    (item) => item && item.checked
  ).length;
  const checklistProgress =
    totalChecklist > 0
      ? Math.round((completedChecklist / totalChecklist) * 100)
      : 0;

  // FIXED: Format date function dengan better error handling
  const formatDate = (reminderData) => {
    try {
      if (!reminderData) return "Invalid Date";

      let date;

      // Handle berbagai format reminder
      if (reminderData.isoString) {
        date = new Date(reminderData.isoString);
      } else if (reminderData.timestamp) {
        date = new Date(reminderData.timestamp);
      } else if (reminderData.date && reminderData.time) {
        date = new Date(`${reminderData.date}T${reminderData.time}`);
      } else if (typeof reminderData === "string") {
        date = new Date(reminderData);
      } else {
        return "Invalid Date Format";
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date object:", reminderData);
        return "Invalid Date";
      }

      return date.toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error, reminderData);
      return "Invalid Date";
    }
  };

  // Helper function untuk mendapatkan waktu reminder
  const getReminderTime = (reminderData) => {
    if (!reminderData) return 0;

    try {
      if (reminderData.isoString) {
        return new Date(reminderData.isoString).getTime();
      } else if (reminderData.timestamp) {
        return reminderData.timestamp;
      } else if (reminderData.date && reminderData.time) {
        return new Date(`${reminderData.date}T${reminderData.time}`).getTime();
      } else if (typeof reminderData === "string") {
        return new Date(reminderData).getTime();
      }
    } catch (error) {
      console.error("Error getting reminder time:", error);
    }

    return 0;
  };

  const reminderTime = getReminderTime(reminder);
  const isSoon =
    reminderTime && reminderTime - Date.now() <= 24 * 60 * 60 * 1000;

  return (
    <article className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition relative">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">{text}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {reminder && (
            <div
              className={`text-xs px-2 py-1 rounded-md ${
                isSoon
                  ? "bg-amber-100 text-amber-700"
                  : "bg-indigo-50 text-indigo-700"
              }`}
            >
              ⏰ {formatDate(reminder)}
            </div>
          )}
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span>by {owner_name}</span>
            {isOwner && collaborators && collaborators.length > 0 && (
              <span className="flex items-center">
                <span className="mx-1">•</span>
                <span className="text-blue-500">👥 {collaborators.length}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {checklist.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>
                Checklist: {completedChecklist}/{totalChecklist} selesai
              </span>
              <span>{checklistProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${checklistProgress}%` }}
              ></div>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {checklist.map((item, index) => {
                if (!item || typeof item !== "object") return null;
                return (
                  <label
                    key={index}
                    className={`flex items-center gap-2 text-sm ${
                      item.checked ? "opacity-70" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      disabled
                      className="h-3 w-3"
                    />
                    <span
                      className={`truncate ${
                        item.checked ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {item.text || "Empty item"}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Images Section */}
      {images && images.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 font-medium mb-2">Gambar:</div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.originalName}
                className="w-full h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition"
                onClick={() => window.open(image.url, "_blank")}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {files && files.length > 0 && (
        <div className="mt-3 space-y-1">
          <div className="text-xs text-gray-500 font-medium">
            File terlampir:
          </div>
          {files.map((file, index) => (
            <a
              key={index}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition"
            >
              <span>📎</span>
              <div className="flex-1 min-w-0">
                <div className="truncate">{file.originalName}</div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Voices Section */}
      {voices && voices.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-gray-500 font-medium">Voice notes:</div>
          {voices.map((voice, index) => (
            <div key={index} className="flex items-center gap-2">
              <audio controls className="flex-1 h-8">
                <source src={voice.url} type={voice.mimetype} />
                Browser tidak mendukung audio.
              </audio>
              <div className="text-xs text-gray-500">
                {voice.duration ? `${voice.duration}s` : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div>Created: {formatDate({ isoString: created_at })}</div>
          <div>•</div>
          <div>Updated: {formatDate({ isoString: updated_at })}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Tombol Kolaborator - hanya muncul jika user adalah pemilik note */}
          {isOwner && (
            <button
              onClick={() => setShowCollaboratorModal(true)}
              className="text-sm px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition flex items-center gap-1"
              title="Kelola Kolaborator"
            >
              <span>👥</span>
              {collaborators && collaborators.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-1 rounded">
                  {collaborators.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={handleEdit}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50 transition"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Modal Kolaborator */}
      {showCollaboratorModal && (
        <CollaboratorModal
          note={note}
          onClose={() => setShowCollaboratorModal(false)}
          onUpdate={() => {
            // Refresh note atau tampilkan pesan sukses
            console.log("Collaborators updated");
            // Anda bisa menambahkan callback untuk refresh notes di sini
          }}
        />
      )}
    </article>
  );
};

// Helper function untuk format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default NoteCard;
