import React, { useState, useEffect } from "react";
import { Bell, X, Info } from "lucide-react";
import { useTask } from "../contexts/TaskContext";

const Notification = () => {
  const { notifications } = useTask();
  const [showPopup, setShowPopup] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
   
    if (notifications.length > 0 && !showPopup) {
     
      setCurrentNotification(notifications[0]);
      setShowPopup(true);

    
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [notifications, showPopup]);

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <>
   
      {showPopup && currentNotification && (
        <div className="fixed top-20 right-4 w-80 bg-white rounded-xl shadow-2xl border-l-4 border-indigo-500 z-[9999] animate-bounce-subtle">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg h-fit">
                  <Bell className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    Pengingat Tugas!
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {currentNotification.message}
                  </p>
                  <p className="text-[10px] text-indigo-400 mt-2 font-medium">
                  
                    {new Date(currentNotification.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
        
          <div className="h-1 bg-gray-100 w-full rounded-b-xl overflow-hidden">
             <div className="h-full bg-indigo-500 animate-shrink-width"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notification;