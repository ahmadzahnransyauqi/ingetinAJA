class NotificationService {
  constructor() {
    this.scheduledNotifications = new Map();
    this.checkInterval = null;
    this.startNotificationChecker();
    console.log("NotificationService initialized");
  }

  // Request permission untuk notifications
  async requestPermission() {
    if (!("Notification" in window)) {
      console.warn("Browser tidak mendukung notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      console.log("Notification permission already granted");
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      console.log("Notification permission result:", permission);
      return permission === "granted";
    }

    console.log("Notification permission was denied previously");
    return false;
  }

  // Schedule notification untuk reminder
  scheduleReminderNotification(note, reminderTime) {
    console.log("Scheduling notification for note:", note.title, reminderTime);

    const now = Date.now();
    const reminderTimestamp = this.getReminderTimestamp(reminderTime);

    console.log("Reminder timestamp:", reminderTimestamp, "Now:", now);

    if (reminderTimestamp <= now) {
      console.log("Reminder sudah lewat:", note.title);
      return;
    }

    // Schedule untuk 1 jam sebelum
    const oneHourBefore = reminderTimestamp - 60 * 60 * 1000;
    console.log(
      "1 hour before:",
      oneHourBefore,
      "Time until:",
      oneHourBefore - now
    );

    if (oneHourBefore > now) {
      this.scheduleSingleNotification(
        note,
        oneHourBefore,
        `1 jam lagi: ${note.title}`,
        `Deadline: ${note.title}\n${note.text || "Tidak ada deskripsi"}`
      );
    } else {
      console.log("1 hour notification skipped (in past)");
    }

    // Schedule untuk 5 menit sebelum
    const fiveMinutesBefore = reminderTimestamp - 5 * 60 * 1000;
    console.log(
      "5 minutes before:",
      fiveMinutesBefore,
      "Time until:",
      fiveMinutesBefore - now
    );

    if (fiveMinutesBefore > now) {
      this.scheduleSingleNotification(
        note,
        fiveMinutesBefore,
        `5 menit lagi: ${note.title}`,
        `Segera deadline: ${note.title}\n${note.text || "Tidak ada deskripsi"}`
      );
    } else {
      console.log("5 minutes notification skipped (in past)");
    }

    console.log("Notifications scheduled for:", note.title);
  }

  // Schedule single notification
  scheduleSingleNotification(note, timestamp, title, body) {
    const notificationId = `note-${note.id}-${timestamp}`;
    const timeUntilNotification = timestamp - Date.now();

    console.log(
      `Scheduling ${title} in ${Math.round(
        timeUntilNotification / 1000 / 60
      )} minutes`
    );

    if (timeUntilNotification <= 0) {
      console.log("Notification time already passed");
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log("Showing notification:", title);
      this.showNotification(note, title, body);
      this.scheduledNotifications.delete(notificationId);
    }, timeUntilNotification);

    this.scheduledNotifications.set(notificationId, timeoutId);
  }

  // Show actual notification
  async showNotification(note, title, body) {
    console.log("Attempting to show notification:", title);

    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      console.log("Notification permission denied, cannot show notification");
      return;
    }

    try {
      const notification = new Notification(title, {
        body: body,
        icon: "/vite.svg",
        tag: `note-${note.id}`,
        requireInteraction: true,
        badge: "/vite.svg",
      });

      console.log("Notification created successfully");

      notification.onclick = () => {
        console.log("Notification clicked");
        window.focus();
        notification.close();
      };

      notification.onclose = () => {
        console.log("Notification closed for:", note.title);
      };

      // Auto close setelah 30 detik
      setTimeout(() => {
        notification.close();
      }, 30000);
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  // Cancel semua scheduled notifications untuk note tertentu
  cancelNoteNotifications(noteId) {
    let cancelledCount = 0;
    for (const [notificationId, timeoutId] of this.scheduledNotifications) {
      if (notificationId.startsWith(`note-${noteId}-`)) {
        clearTimeout(timeoutId);
        this.scheduledNotifications.delete(notificationId);
        cancelledCount++;
      }
    }
    console.log(`Cancelled ${cancelledCount} notifications for note:`, noteId);
  }

  // Cancel semua notifications
  cancelAllNotifications() {
    let cancelledCount = 0;
    for (const [_, timeoutId] of this.scheduledNotifications) {
      clearTimeout(timeoutId);
      cancelledCount++;
    }
    this.scheduledNotifications.clear();
    console.log(`Cancelled all ${cancelledCount} notifications`);
  }

  // Helper function untuk mendapatkan timestamp dari reminder
  getReminderTimestamp(reminder) {
    if (!reminder) {
      console.log("No reminder data provided");
      return 0;
    }

    console.log("Processing reminder data:", reminder);

    try {
      if (reminder.isoString) {
        const timestamp = new Date(reminder.isoString).getTime();
        console.log("Using isoString:", reminder.isoString, "->", timestamp);
        return timestamp;
      } else if (reminder.timestamp) {
        console.log("Using timestamp:", reminder.timestamp);
        return reminder.timestamp;
      } else if (reminder.date && reminder.time) {
        const dateTimeString = `${reminder.date}T${reminder.time}`;
        const timestamp = new Date(dateTimeString).getTime();
        console.log("Using date/time:", dateTimeString, "->", timestamp);
        return timestamp;
      } else if (typeof reminder === "string") {
        const timestamp = new Date(reminder).getTime();
        console.log("Using string:", reminder, "->", timestamp);
        return timestamp;
      }
    } catch (error) {
      console.error("Error parsing reminder timestamp:", error);
    }

    console.log("No valid reminder format found");
    return 0;
  }

  // Background checker untuk notifications
  startNotificationChecker() {
    this.checkInterval = setInterval(() => {
      this.cleanupExpiredNotifications();
    }, 60000); // Check setiap menit
  }

  // Cleanup expired notifications
  cleanupExpiredNotifications() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [notificationId, timeoutId] of this.scheduledNotifications) {
      const timestamp = parseInt(notificationId.split("-").pop());
      if (timestamp <= now) {
        clearTimeout(timeoutId);
        this.scheduledNotifications.delete(notificationId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired notifications`);
    }
  }

  // Get scheduled notifications count (for debugging)
  getScheduledCount() {
    return this.scheduledNotifications.size;
  }

  // Stop notification service
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.cancelAllNotifications();
    console.log("NotificationService stopped");
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
