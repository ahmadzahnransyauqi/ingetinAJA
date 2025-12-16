import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useTask } from "../contexts/TaskContext";

const Notification = () => {
  const { notifications } = useTask();
  const [showPopup, setShowPopup] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (notifications.length > 0 && !showPopup) {
      setCurrentNotification(notifications[0]);
      setShowPopup(true);

      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <>
      {/* Notification Bell with Badge */}
      <div className="relative">
        <Bell className="w-6 h-6 cursor-pointer" />
        {notifications.length > 0 && (
          <div className="notification-badge">{notifications.length}</div>
        )}
      </div>

      {/* Notification Popup */}
      {showPopup && currentNotification && (
        <div className="fixed top-4 right-4 w-80 bg-white rounded-lg shadow-lg border-l-4 border-yellow-500 z-50">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800">Pengingat Tugas!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {currentNotification.message}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {currentNotification.time}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notification;
