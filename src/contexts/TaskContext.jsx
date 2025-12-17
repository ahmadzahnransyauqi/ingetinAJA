import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { tasksAPI, notificationsAPI } from "../services/api";

const TaskContext = createContext({});

export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("deadline");

  const loadTasks = useCallback(async () => {

    const token = localStorage.getItem("token");
    
    if (!token) {
      setTasks([]); 
      setSharedTasks([]);
      return; 
    }

    try {
      setLoading(true);
      setError(null);

      const response = await tasksAPI.getAllTasks();
      const { ownedTasks, sharedTasks } = response.data;

      setTasks(ownedTasks || []);
      setSharedTasks(sharedTasks || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);

    } finally {
      setLoading(false);
    }
  }, []);


  const loadNotifications = useCallback(async () => {

    const token = localStorage.getItem("token");
    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, []);

  const createTask = async (taskData) => {
    try {
      setError(null);
      const response = await tasksAPI.createTask(taskData);
      await loadTasks();
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create task";
      setError(message);
      return { success: false, message };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      setError(null);
      const response = await tasksAPI.updateTask(id, taskData);
      await loadTasks();
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update task";
      setError(message);
      return { success: false, message };
    }
  };

  const deleteTask = async (id) => {
    try {
      setError(null);
      await tasksAPI.deleteTask(id);
      await loadTasks();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete task";
      setError(message);
      return { success: false, message };
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await tasksAPI.updateTaskStatus(id, status);
      await loadTasks();
      return { success: true };
    } catch (error) {
      console.error("Failed to update task status:", error);
      return { success: false };
    }
  };

  const updateChecklistItem = async (taskId, itemId, completed) => {
    try {
      await tasksAPI.updateChecklistItem(taskId, itemId, completed);
      await loadTasks();
      return { success: true };
    } catch (error) {
      console.error("Failed to update checklist item:", error);
      return { success: false };
    }
  };

  const getTasksWithFilter = async (filter) => {
    try {
      const response = await tasksAPI.getTasksWithFilter(filter);
      return response.data.tasks || [];
    } catch (error) {
      console.error("Failed to get filtered tasks:", error);
      return [];
    }
  };

  const getAllTasks = () => {
    return [...tasks, ...sharedTasks];
  };

  const getStatistics = () => {
    const allTasks = getAllTasks();
    const todoCount = allTasks.filter((task) => task.status === "todo").length;
    const inProgressCount = allTasks.filter(
      (task) => task.status === "in-progress"
    ).length;
    const doneCount = allTasks.filter((task) => task.status === "done").length;
    const totalTasks = allTasks.length;
    const progressPercentage =
      totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    return {
      todoCount,
      inProgressCount,
      doneCount,
      totalTasks,
      progressPercentage,
    };
  };

  useEffect(() => {
    loadTasks();
    loadNotifications();

    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadTasks, loadNotifications]);

  const value = {
    tasks,
    sharedTasks,
    notifications,
    loading,
    error,
    currentFilter,
    currentSort,
    setCurrentFilter,
    setCurrentSort,
    loadTasks,
    loadNotifications,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateChecklistItem,
    getTasksWithFilter,
    getAllTasks,
    getStatistics,
    setError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};