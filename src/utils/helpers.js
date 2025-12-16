import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { id } from "date-fns/locale";

export const formatDate = (dateString, formatStr = "dd MMM yyyy") => {
  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, formatStr, { locale: id });
  } catch (error) {
    return dateString;
  }
};

export const getDeadlineInfo = (dateString) => {
  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;

    if (isToday(date)) {
      return { text: "Hari ini", className: "bg-red-100 text-red-800" };
    }

    if (isTomorrow(date)) {
      return { text: "Besok", className: "bg-yellow-100 text-yellow-800" };
    }

    if (isPast(date)) {
      return { text: formatDate(date), className: "bg-gray-100 text-red-600" };
    }

    return { text: formatDate(date), className: "bg-gray-100 text-gray-800" };
  } catch (error) {
    return { text: dateString, className: "bg-gray-100 text-gray-800" };
  }
};

export const getPriorityInfo = (priority) => {
  const config = {
    low: {
      text: "Rendah",
      className: "bg-green-100 text-green-800",
      badgeClass: "priority-low",
    },
    medium: {
      text: "Sedang",
      className: "bg-yellow-100 text-yellow-800",
      badgeClass: "priority-medium",
    },
    high: {
      text: "Tinggi",
      className: "bg-red-100 text-red-800",
      badgeClass: "priority-high",
    },
  };

  return config[priority] || config.medium;
};

export const getStatusInfo = (status) => {
  const config = {
    todo: {
      text: "To Do",
      className: "status-todo",
    },
    "in-progress": {
      text: "In Progress",
      className: "status-in-progress",
    },
    done: {
      text: "Done",
      className: "status-done",
    },
  };

  return config[status] || config.todo;
};

export const getReminderInfo = (reminder) => {
  const config = {
    none: { text: "Tidak ada", show: false },
    "1-hour": { text: "1 jam sebelum", show: true },
    "1-day": { text: "1 hari sebelum", show: true },
    "same-day": { text: "Hari H", show: true },
  };

  return config[reminder] || config.none;
};

export const calculateChecklistProgress = (checklist) => {
  if (!checklist || checklist.length === 0) {
    return 0;
  }

  const completed = checklist.filter((item) => item.completed).length;
  return Math.round((completed / checklist.length) * 100);
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
