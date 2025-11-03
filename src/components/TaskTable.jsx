import { useState } from "react";
import Confetti from "react-dom-confetti";
import StatusBadge from "./StatusBadge";

const STATUS_OPTIONS = ["pendiente", "en curso", "finalizado"];

const statusRowColor = {
  pendiente: "bg-orange-50",
  "en curso": "bg-yellow-50",
  finalizado: "bg-green-50"
};

const priorityColor = {
  Alta: "text-red-600",
  Media: "text-yellow-600",
  Baja: "text-blue-600"
};

function formatDate(value) {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatProgress(progress) {
  if (progress === null || progress === undefined || progress === "") return "—";
  const numeric = Number(progress);
  if (Number.isNaN(numeric)) return progress;
  return `${numeric}%`;
}

export default function TaskTable({ tasks, onStatusChange, onEdit, onDelete, confettiTaskId }) {
  const [openStatusFor, setOpenStatusFor] = useState(null);

  const handleStatusClick = (taskId) => {
    setOpenStatusFor((prev) => (prev === taskId ? null : taskId));
  };

  const handleStatusSelection = (task, status) => {
    onStatusChange(task, status);
    setOpenStatusFor(null);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            <th scope="col" className="px-4 py-3 text-left">Proyecto</th>
            <th scope="col" className="px-4 py-3 text-left">Descripción</th>
            <th scope="col" className="px-4 py-3 text-left">Encargado</th>
            <th scope="col" className="px-4 py-3 text-left">Prioridad</th>
            <th scope="col" className="px-4 py-3 text-left">Estado</th>
            <th scope="col" className="px-4 py-3 text-left">Fecha límite</th>
            <th scope="col" className="px-4 py-3 text-left">Inicio</th>
            <th scope="col" className="px-4 py-3 text-left">Avance</th>
            <th scope="col" className="px-4 py-3 text-left">Notas</th>
            <th scope="col" className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
          {tasks.map((task) => {
            const rowBackground = statusRowColor[task.status] || "bg-white";
            return (
              <tr key={task._id} className={`${rowBackground} hover:bg-gray-100 transition-colors`}>
                <td className="px-4 py-3 align-top font-medium text-gray-900">
                  {task.project || task.group || "—"}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="font-semibold text-gray-900">{task.title}</div>
                  {task.description || task.notes ? (
                    <p className="mt-1 text-xs text-gray-500" title={task.description || task.notes}>
                      {(task.description || task.notes).length > 90
                        ? `${(task.description || task.notes).slice(0, 90)}...`
                        : task.description || task.notes}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 align-top">
                  {task.owner || "—"}
                </td>
                <td className={`px-4 py-3 align-top font-semibold ${priorityColor[task.priority] || "text-gray-500"}`}>
                  {task.priority || "—"}
                </td>
                <td className="relative px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} />
                    <button
                      type="button"
                      onClick={() => handleStatusClick(task._id)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>
                  {openStatusFor === task._id && (
                    <div className="absolute z-10 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusSelection(task, status)}
                          className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-100"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <Confetti active={confettiTaskId === task._id} />
                  </div>
                </td>
                <td className="px-4 py-3 align-top">{formatDate(task.dueDate)}</td>
                <td className="px-4 py-3 align-top">{formatDate(task.startDate)}</td>
                <td className="px-4 py-3 align-top">{formatProgress(task.progress)}</td>
                <td className="px-4 py-3 align-top max-w-xs whitespace-pre-wrap break-words text-xs text-gray-600">
                  {task.notes || "—"}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Estás seguro que deseas eliminar la tarea: "${task.title}"?`)) {
                          onDelete(task);
                        }
                      }}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
