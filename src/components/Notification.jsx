import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useTask } from "../contexts/TaskContext";

const Notification = () => {
  const { notifications } = useTask();
  const [showPopup, setShowPopup] = useState(false);
  const [dismissedId, setDismissedId] = useState(null);

  useEffect(() => {
    if (notifications.length > 0 && notifications[0].id !== dismissedId) {
      setShowPopup(true);
      const timer = setTimeout(() => setShowPopup(false), 10000);
      return () => clearTimeout(timer);
    } else if (notifications.length === 0) {
      setShowPopup(false);
    }
  }, [notifications, dismissedId]);

  const handleClose = () => {
    setShowPopup(false);
    if (notifications.length > 0) setDismissedId(notifications[0].id);
  };

  if (!showPopup || notifications.length === 0) return null;

  const displayTime = notifications[0]?.createdAt 
    ? new Date(notifications[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed top-20 right-4 w-80 bg-white rounded-xl shadow-2xl border-l-4 border-indigo-500 z-[9999] animate-bounce-subtle">
      <div className="p-4 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg h-fit"><Bell className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Pengingat!</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notifications[0].message}</p>
            <p className="text-[10px] text-indigo-400 mt-2 font-medium">{displayTime}</p>
          </div>
        </div>
        <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default Notification;