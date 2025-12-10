import React, { useState, useEffect } from "react";
import { notesService, usersService } from "../services/api";

const CollaboratorModal = ({ note, onClose, onUpdate }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadCollaborators();
    checkOwnership();
  }, [note]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      console.log("Loading collaborators for note:", note.id);
      const response = await notesService.getNoteCollaborators(note.id);
      console.log("Collaborators response:", response);

      // Pastikan response.data ada dan berupa array
      const collaborators = Array.isArray(response)
        ? response
        : response.data || [];
      setCollaborators(collaborators);
    } catch (error) {
      console.error("Error loading collaborators:", error);
      setError(
        "Gagal memuat daftar kolaborator: " + (error.message || "Unknown error")
      );
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("ingetinaja_user"));
      console.log("Current user:", currentUser);
      console.log("Note owner_id:", note.owner_id);

      // Periksa apakah current user adalah owner
      const userIsOwner = currentUser && note.owner_id === currentUser.id;
      console.log("User is owner:", userIsOwner);
      setIsOwner(userIsOwner);
    } catch (error) {
      console.error("Error checking ownership:", error);
      setIsOwner(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await usersService.searchUsers(query);
      // Filter out current user and existing collaborators
      const currentUser = JSON.parse(localStorage.getItem("ingetinaja_user"));
      const filteredResults = results.filter(
        (user) =>
          user.id !== currentUser?.id &&
          !collaborators.some((collab) => collab.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddCollaborator = async (username) => {
    try {
      setLoading(true);
      setError("");
      console.log("Adding collaborator:", username, "to note:", note.id);

      const response = await notesService.addCollaborator(note.id, username);
      console.log("Add collaborator response:", response);

      if (response.status === "success") {
        // Refresh collaborators list
        await loadCollaborators();
        setSearchQuery("");
        setSearchResults([]);

        // Call update callback
        onUpdate?.();

        // Show success message
        alert(`Berhasil menambahkan ${username} sebagai kolaborator`);
      } else {
        setError(response.message || "Gagal menambahkan kolaborator");
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Gagal menambahkan kolaborator"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!window.confirm("Hapus kolaborator ini?")) return;

    try {
      setLoading(true);
      setError("");

      const response = await notesService.removeCollaborator(
        note.id,
        collaboratorId
      );

      if (response.status === "success") {
        // Refresh collaborators list
        await loadCollaborators();

        // Call update callback
        onUpdate?.();
      } else {
        setError(response.message || "Gagal menghapus kolaborator");
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
      setError(error.response?.data?.message || "Gagal menghapus kolaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleShareWithAll = async () => {
    const usernames = searchResults.map((user) => user.username);

    console.log("Sharing with usernames:", usernames);

    if (usernames.length === 0) {
      setError("Pilih pengguna terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await notesService.shareNote(note.id, usernames);

      if (response.status === "success") {
        // Refresh collaborators list
        await loadCollaborators();
        setSearchQuery("");
        setSearchResults([]);

        // Call update callback
        onUpdate?.();

        // Show success message
        alert(`Berhasil membagikan note ke ${usernames.length} pengguna`);
      } else {
        setError(response.message || "Gagal membagikan note");
      }
    } catch (error) {
      console.error("Error sharing note:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Gagal membagikan note"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Kolaborator
            </h2>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-slate-600 mb-6">
              Hanya pemilik note yang dapat mengelola kolaborator
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            Kelola Kolaborator
          </h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Search Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-700 mb-2">
            Tambahkan Kolaborator
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Cari username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-md max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => handleAddCollaborator(user.username)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Tambah
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="text-center text-slate-500 py-4">
              Tidak ada pengguna ditemukan
            </div>
          )}
        </div>

        {/* Current Collaborators */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-700 mb-2">
            Kolaborator ({collaborators.length})
          </h3>

          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : collaborators.length > 0 ? (
            <div className="border rounded-md">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{collaborator.username}</div>
                    <div className="text-sm text-slate-500">
                      {collaborator.email}
                      {collaborator.shared_at && (
                        <span className="ml-2 text-xs">
                          • Bergabung{" "}
                          {new Date(collaborator.shared_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-4">
              Belum ada kolaborator
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition"
          >
            Tutup
          </button>

          {searchResults.length > 0 && (
            <button
              onClick={handleShareWithAll}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Bagikan ke Semua
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaboratorModal;
