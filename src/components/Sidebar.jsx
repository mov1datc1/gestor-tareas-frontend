import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, ListChecks, X, KanbanSquare } from 'lucide-react';

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();

  const menuItems = [
    { name: "Inicio", path: "/", icon: <Home size={18} /> },
    { name: "Tareas", path: "/tareas", icon: <ListChecks size={18} /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Proyectos", path: "/proyectos", icon: <KanbanSquare size={18} /> }, // Nuevo
  ];

  return (
    <aside
      className={`
        fixed z-50 md:static bg-white border-r h-full w-64 p-6 shadow-md flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Botón para cerrar en móvil */}
      <div className="flex justify-between items-center mb-6 md:hidden">
        <h2 className="text-xl font-bold text-primary">Menú</h2>
        <button onClick={onToggle}>
          <X size={20} />
        </button>
      </div>

      <h2 className="text-xl font-bold text-primary mb-6 hidden md:block">Menú</h2>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
              }`}
              onClick={onToggle}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
