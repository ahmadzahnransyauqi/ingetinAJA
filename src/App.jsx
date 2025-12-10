import React, { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import LoginModal from "./components/LoginModal.jsx";
import NoteModal from "./components/NoteModal.jsx";
import Controls from "./components/Controls.jsx";
import NoteCard from "./components/NoteCard.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { notesService } from "./services/api.js";
import { notificationService } from "./services/notificationService.js";
import "./index.css";

function AppContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize notification service
  useEffect(() => {
    // Request notification permission saat app load
    notificationService.requestPermission();

    // Cleanup saat component unmount
    return () => {
      notificationService.stop();
    };
  }, []);

  // Schedule notifications ketika notes berubah
  useEffect(() => {
    if (isAuthenticated && notes.length > 0) {
      scheduleAllReminderNotifications();
    }
  }, [notes, isAuthenticated]);

  const scheduleAllReminderNotifications = () => {
    // Cancel semua notifications sebelumnya
    notificationService.cancelAllNotifications();

    // Schedule notifications untuk semua notes dengan reminder
    notes.forEach((note) => {
      if (note.reminder) {
        notificationService.scheduleReminderNotification(note, note.reminder);
      }
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotes();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, filter]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notesService.getAllNotes(filter);
      setNotes(data || []); // Pastikan selalu array
    } catch (error) {
      console.error("Error loading notes:", error);
      setError("Gagal memuat catatan: " + error.message);
      setNotes([]); // Set empty array jika error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setEditingNote(null);
    setShowNoteModal(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteModal(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      setError(null);
      let result;
      if (editingNote) {
        result = await notesService.updateNote(editingNote.id, noteData);
        // Pastikan result.data ada
        const updatedNote = result.data || result.note || result;

        // Cancel notifications lama dan schedule yang baru
        notificationService.cancelNoteNotifications(editingNote.id);
        if (noteData.reminder) {
          notificationService.scheduleReminderNotification(
            updatedNote,
            noteData.reminder
          );
        }

        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === editingNote.id ? updatedNote : note
          )
        );
      } else {
        result = await notesService.createNote(noteData);
        // Pastikan result.data ada
        const newNote = result.data || result.note || result;

        // Schedule notification untuk note baru
        if (noteData.reminder) {
          notificationService.scheduleReminderNotification(
            newNote,
            noteData.reminder
          );
        }

        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
      setShowNoteModal(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
      setError("Gagal menyimpan note: " + error.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Yakin ingin menghapus note ini?")) return;

    try {
      setError(null);
      const result = await notesService.deleteNote(noteId);

      if (result.status === "success") {
        // Cancel notifications untuk note yang dihapus
        notificationService.cancelNoteNotifications(noteId);

        // Hapus note dari state
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      } else {
        throw new Error(result.message || "Gagal menghapus note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setError(
        "Gagal menghapus note: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Filter notes dengan safety check
  const filteredNotes = (notes || []).filter((note) => {
    if (!note) return false; // Skip jika note undefined

    switch (filter) {
      case "withReminder":
        return note.reminder;
      case "withoutReminder":
        return !note.reminder;
      case "shared":
        return note.collaborators && note.collaborators.length > 0;
      default:
        return true;
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg mx-auto mb-4">
            IA
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6 font-sans">
        <Header onLoginClick={() => setShowLoginModal(true)} />
        <div className="max-w-6xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Selamat datang di IngetinAja
          </h2>
          <p className="text-gray-600 mb-8">
            Catatan, pengingat, dan kolaborasi - semua simpel.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg"
          >
            Login untuk Memulai
          </button>
        </div>
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={loadNotes}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6 font-sans">
      <Header onLoginClick={() => setShowLoginModal(true)} />

      <main className="max-w-6xl mx-auto grid gap-6">
        <Controls
          onCreateNote={handleCreateNote}
          filter={filter}
          onFilterChange={setFilter}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error: </strong> {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notification Status */}
        {Notification.permission === "granted" && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>✅ Notifikasi Aktif</strong> - Anda akan menerima reminder 1
            jam dan 5 menit sebelum deadline
          </div>
        )}

        {Notification.permission === "denied" && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>⚠️ Notifikasi Dinonaktifkan</strong> - Aktifkan notifikasi
            browser untuk menerima reminder
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 mt-4">Memuat catatan...</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => {
                // Safety check untuk setiap note
                if (!note || !note.id) {
                  console.warn("Invalid note:", note);
                  return null; // Skip invalid notes
                }

                return (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={() => handleDeleteNote(note.id)}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">
                  Belum ada catatan
                </h3>
                <p className="text-gray-600">
                  Buat catatan pertama Anda untuk memulai
                </p>
                <button
                  onClick={handleCreateNote}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  + Buat Note Pertama
                </button>
              </div>
            )}
          </section>
        )}

        <footer className="text-center text-sm text-slate-500 mt-8">
          IngetinAja - Catatan Pintar • Powered by Express.js + React
        </footer>
      </main>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={loadNotes}
        />
      )}

      {showNoteModal && (
        <NoteModal
          note={editingNote}
          onSave={handleSaveNote}
          onClose={() => {
            setShowNoteModal(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
