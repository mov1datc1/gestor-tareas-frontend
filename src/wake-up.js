// src/wake-up.js
setInterval(() => {
  fetch("https://gestor-tareas-backend-jcem.onrender.com/api/tasks")
    .then(() => console.log("🔄 Backend activado con ping"))
    .catch((err) => console.log("❌ Error al activar backend", err));
}, 14 * 60 * 1000); // cada 14 minutos
