import StatusBadge from "./StatusBadge";
import { useState } from "react";

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const [showOptions, setShowOptions] = useState(false);

  const handleStatusChange = (newStatus) => {
    onStatusChange(task, newStatus);
    setShowOptions(false);
  };

  const statusColor = {
    pendiente: "bg-orange-200",
    "en curso": "bg-yellow-100",
    finalizado: "bg-green-100"
  }[task.status] || "bg-white";

  const priorityColor = {
    Alta: "text-red-700",
    Media: "text-yellow-700",
    Baja: "text-blue-700"
  }[task.priority] || "text-gray-600";

  return (
    <div className={`${statusColor} rounded-xl shadow p-4 mb-4`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-darkGray">{task.title}</h3>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-primary hover:underline"
          >
            {task.status} ⌄
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow z-10">
              {["pendiente", "en curso", "finalizado"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">Responsable: {task.owner || '—'}</p>
      <p className="text-sm text-gray-500">Fecha: {task.dueDate || 'Sin fecha'}</p>
      {task.priority && (
        <p className={`text-sm font-semibold ${priorityColor}`}>
          Prioridad: {task.priority}
        </p>
      )}
      {task.notes && <p className="text-sm text-gray-700 mt-2 italic">"{task.notes}"</p>}

      <div className="mt-3 flex justify-end space-x-3">
        <button onClick={() => onEdit(task)} className="text-sm text-blue-600 hover:underline">Editar</button>
        <button
          onClick={() => {
            if (confirm(`¿Estás seguro que deseas eliminar la tarea: "${task.title}"?`)) {
              onDelete(task);
            }
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
