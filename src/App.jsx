import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import ProjectBoard from "./pages/ProjectBoard";

import { getTasks } from "./api/tasks";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [grupoActivo, setGrupoActivo] = useState("Enero 2025");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await getTasks();
        setTasks(res.data);
      } catch (err) {
        console.error("Error al cargar tareas en App.js:", err);
      }
    }
    fetchTasks();
  }, []);

  const tareasPorGrupo = tasks.reduce((acc, tarea) => {
    const grupo = tarea.group || "Sin grupo";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(tarea);
    return acc;
  }, {});

  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 overflow-y-auto">
          {/* Header móvil */}
          <div className="md:hidden p-4 shadow bg-primary text-white flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4">
              ☰
            </button>
            <h1 className="text-lg font-bold">TRANSFORMANDO NEGOCIOS</h1>
          </div>

          {/* Contenido principal */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tareas" element={<Tasks />} />
			<Route path="/proyectos" element={<ProjectBoard />} />

            <Route
              path="/dashboard"
              element={
                <Dashboard
                  tareasPorGrupo={tareasPorGrupo}
                  grupoActivo={grupoActivo}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
