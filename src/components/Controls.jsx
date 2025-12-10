import React from "react";
import { notificationService } from "../services/notificationService";

const Controls = ({ onCreateNote, filter, onFilterChange }) => {
  const requestNotificationPermission = async () => {
    const hasPermission = await notificationService.requestPermission();

    if (hasPermission) {
      alert(
        "Notifikasi diaktifkan! Anda akan menerima reminder untuk catatan Anda."
      );
    } else {
      alert("Izin notifikasi ditolak. Anda tidak akan menerima reminder.");
    }
  };

  return (
    <section className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onCreateNote}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-lg shadow hover:shadow-md transition"
        >
          + Buat Note
        </button>
        <button
          onClick={requestNotificationPermission}
          className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition"
        >
          {Notification.permission === "granted"
            ? "✅ Notifikasi Aktif"
            : "Aktifkan Notifikasi"}
        </button>
      </div>

      {/* ... filter section */}
    </section>
  );
};

export default Controls;
