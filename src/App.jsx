import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
