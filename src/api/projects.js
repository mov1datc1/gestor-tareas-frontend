import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://gestor-tareas-backend-jcem.onrender.com/api/projects";

const API = axios.create({
  baseURL: API_URL,
});

// Obtener todos los proyectos
export const getProjects = () => API.get("/");

// Crear un nuevo proyecto
export const createProject = (data) => API.post("/", data);

// Actualizar un proyecto
export const updateProject = (id, data) => API.put(`/${id}`, data);

// Eliminar un proyecto
export const deleteProject = (id) => API.delete(`/${id}`);
