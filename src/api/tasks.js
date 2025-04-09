import axios from "axios";

// Usa la URL pública de tu backend en Render
const API = axios.create({
  baseURL: "https://gestor-tareas-backend-jcem.onrender.com/api/tasks",
});

export const getTasks = () => API.get("/");
export const createTask = (task) => API.post("/", task);
export const updateTask = (id, updatedTask) => API.put(`/${id}`, updatedTask);
export const deleteTask = (id) => API.delete(`/${id}`);
