import { useEffect, useRef, useState } from "react";
import Confetti from "react-dom-confetti";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { ChevronDown, MoreVertical } from "lucide-react";
import StatusBadge from "./StatusBadge";

const STATUS_OPTIONS = ["pendiente", "en curso", "finalizado", "on hold"];

const statusRowColor = {
  pendiente: "bg-orange-50",
  "en curso": "bg-yellow-50",
  finalizado: "bg-green-50",
  "on hold": "bg-purple-50"
};

const priorityColor = {
  Alta: "text-red-600",
  Media: "text-yellow-600",
  Baja: "text-blue-600"
};

function formatDate(value) {
  if (!value) return "—";

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function deriveDateFromObjectId(id) {
  if (typeof id !== "string" || id.length < 8) return null;
  const timestampHex = id.slice(0, 8);
  const timestamp = Number.parseInt(timestampHex, 16);
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp * 1000);
}

export default function TaskTable({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  confettiTaskId,
  onToggleCreatedSort,
  createdSortOrder,
  onMove,
  groups = [],
  activeGroupId,
  onReorder
}) {
  const [openStatusFor, setOpenStatusFor] = useState(null);
  const [openActionsFor, setOpenActionsFor] = useState(null);
  const [openMoveFor, setOpenMoveFor] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setOpenStatusFor(null);
        setOpenActionsFor(null);
        setOpenMoveFor(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStatusClick = (event, taskId) => {
    event.stopPropagation();
    setOpenStatusFor((prev) => (prev === taskId ? null : taskId));
    setOpenActionsFor(null);
    setOpenMoveFor(null);
  };

  const handleStatusSelection = (task, status) => {
    onStatusChange(task, status);
    setOpenStatusFor(null);
  };

  const handleActionsClick = (event, taskId) => {
    event.stopPropagation();
    setOpenActionsFor((prev) => (prev === taskId ? null : taskId));
    setOpenStatusFor(null);
    setOpenMoveFor(null);
  };

  const renderCreatedDate = (task) => {
    const createdValue =
      task.createdAt ||
      task.created_at ||
      task.createdOn ||
      task.creationDate ||
      task.created ||
      task.dateCreated;
    if (createdValue) {
      return formatDate(createdValue);
    }

    const derivedFromId = deriveDateFromObjectId(task._id);
    if (derivedFromId) {
      return formatDate(derivedFromId);
    }

    return "—";
  };

  const handleDragStart = () => {
    setOpenStatusFor(null);
    setOpenActionsFor(null);
    setOpenMoveFor(null);
  };

  const handleDragEnd = (result) => {
    const { destination, source } = result;
    setOpenStatusFor(null);
    setOpenActionsFor(null);
    setOpenMoveFor(null);

    if (!destination || destination.index === source.index) {
      return;
    }

    if (onReorder) {
      onReorder({
        sourceIndex: source.index,
        destinationIndex: destination.index,
        taskOrder: tasks.map((task) => task._id)
      });
    }
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div ref={tableRef} className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              <th scope="col" className="px-4 py-3 text-left">Proyecto</th>
              <th scope="col" className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={onToggleCreatedSort}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 hover:text-primary"
                >
                  Fecha
                  {createdSortOrder ? (
                    <span className="text-[10px] font-normal text-gray-400">
                      {createdSortOrder === "desc" ? "↓" : "↑"}
                    </span>
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-4 py-3 text-left">Descripción</th>
              <th scope="col" className="px-4 py-3 text-left">Encargado</th>
              <th scope="col" className="px-4 py-3 text-left">Prioridad</th>
              <th scope="col" className="px-4 py-3 text-left">Estado</th>
              <th scope="col" className="px-4 py-3 text-left">Fecha límite</th>
              <th scope="col" className="px-4 py-3 text-left">Notas</th>
              <th scope="col" className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <Droppable droppableId={`tasks-${activeGroupId || "default"}`}>
            {(provided) => (
              <tbody
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="divide-y divide-gray-200 text-sm text-gray-700"
              >
                {tasks.map((task, index) => {
                  const rowBackground = statusRowColor[task.status] || "bg-white";
                  const availableStatuses = STATUS_OPTIONS.filter((status) => status !== task.status);
                  const availableMoveGroups = groups.filter(
                    (group) => group != null && group !== task.group
                  );
                  return (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(draggableProvided, snapshot) => (
                        <tr
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                          className={`${rowBackground} hover:bg-gray-100 transition-colors ${
                            snapshot.isDragging ? "shadow-lg ring-2 ring-primary/40" : ""
                          }`}
                        >
                          <td className="px-4 py-3 align-top font-medium text-gray-900">
                            {task.project || task.group || "—"}
                          </td>
                          <td className="px-4 py-3 align-top">{renderCreatedDate(task)}</td>
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
                            <button
                              type="button"
                              onClick={(event) => handleStatusClick(event, task._id)}
                              className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1 text-left text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-white"
                            >
                              <StatusBadge status={task.status} />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </button>
                            {openStatusFor === task._id && (
                              <div className="absolute z-10 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg">
                                {availableStatuses.map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleStatusSelection(task, status)}
                                    className="block w-full px-3 py-2 text-left text-xs capitalize hover:bg-gray-100"
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
                          <td className="px-4 py-3 align-top max-w-xs whitespace-pre-wrap break-words text-xs text-gray-600">
                            {task.notes || "—"}
                          </td>
                          <td className="relative px-4 py-3 align-top text-right">
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={(event) => handleActionsClick(event, task._id)}
                                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>
                            {openActionsFor === task._id && (
                              <div className="absolute right-4 z-10 mt-2 w-40 rounded-md border border-gray-200 bg-white text-left text-xs shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionsFor(null);
                                    onEdit(task);
                                  }}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenMoveFor((prev) => (prev === task._id ? null : task._id));
                                  }}
                                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                  Mover
                                </button>
                                {openMoveFor === task._id && (
                                  <div className="border-t border-gray-100">
                                    {availableMoveGroups.length > 0 ? (
                                      availableMoveGroups.map((group) => (
                                        <button
                                          key={group}
                                          type="button"
                                          onClick={() => {
                                            setOpenActionsFor(null);
                                            setOpenMoveFor(null);
                                            if (onMove) {
                                              onMove(task, group);
                                            }
                                          }}
                                          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                        >
                                          Mover a {group}
                                        </button>
                                      ))
                                    ) : (
                                      <div className="px-4 py-2 text-gray-400">
                                        No hay otros grupos disponibles
                                      </div>
                                    )}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`¿Estás seguro que deseas eliminar la tarea: "${task.title}"?`)) {
                                      setOpenActionsFor(null);
                                      setOpenMoveFor(null);
                                      onDelete(task);
                                    }
                                  }}
                                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </div>
    </DragDropContext>
  );
}
