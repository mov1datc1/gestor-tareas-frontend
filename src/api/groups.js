// src/api/groups.js
import axios from "axios";

// URL de tu backend desplegado en Render
const API = axios.create({
  baseURL: "https://gestor-tareas-backend-jcem.onrender.com/api/groups",
});

// 👉 Renombrar un grupo (PUT /api/groups/:oldGroupName)
export const renameGroup = (oldName, newName) =>
  API.put(`/${encodeURIComponent(oldName)}`, { newName });

// 👉 Eliminar un grupo (DELETE /api/groups/:groupName)
export const deleteGroup = (groupName) =>
  API.delete(`/${encodeURIComponent(groupName)}`);
