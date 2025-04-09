import axios from "axios";

const API_BASE = "https://gestor-tareas-backend-jcem.onrender.com/api";

export const fetchTasks = () => axios.get(`${API_BASE}/tasks`);
export const createTask = (data) => axios.post(`${API_BASE}/tasks`, data);
export const updateTask = (id, data) => axios.put(`${API_BASE}/tasks/${id}`, data);
export const deleteTask = (id) => axios.delete(`${API_BASE}/tasks/${id}`);
