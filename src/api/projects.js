import axios from "axios";

// URL fija para producción (Render) y desarrollo
const API = axios.create({
  baseURL: "https://gestor-tareas-backend-jcem.onrender.com/api/projects",
});

// Obtener todos los proyectos
export const getProjects = () => API.get("/");

// Crear un nuevo proyecto
export const createProject = (data) => API.post("/", data);

// Actualizar un proyecto
export const updateProject = (id, data) => API.put(`/${id}`, data);

// Eliminar un proyecto
export const deleteProject = (id) => API.delete(`/${id}`);
