import { useState, useEffect } from "react";
import TaskCard from "../components/TaskCard";
import EditTaskModal from "../components/EditTaskModal";
import NewGroupModal from "../components/NewGroupModal";
import NewTaskModal from "../components/NewTaskModal";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/tasks";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Confetti from "react-dom-confetti";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [grupoActivo, setGrupoActivo] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");
  const [filtroResponsable, setFiltroResponsable] = useState("");
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [mostrarFinalizadas, setMostrarFinalizadas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confettiTaskId, setConfettiTaskId] = useState(null);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await getTasks();
        setTasks(res.data);
        const nombresDeGrupos = [...new Set(res.data.map((t) => t.group))];
        if (!nombresDeGrupos.includes(grupoActivo)) {
          setGrupoActivo(nombresDeGrupos[0] || "");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error cargando tareas:", err);
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const grupos = [...new Set(tasks.map((t) => t.group))];

  const tareasFiltradas = tasks
    .filter((t) => t.group === grupoActivo)
    .filter((t) =>
      filtroPrioridad === "Todas" ? true : t.priority === filtroPrioridad
    )
    .filter((t) =>
      filtroResponsable === ""
        ? true
        : (t.owner || "").toLowerCase().includes(filtroResponsable.toLowerCase())
    )
    .filter((t) =>
      filtroTitulo === "" ? true : t.title?.toLowerCase().includes(filtroTitulo.toLowerCase())
    )
    .filter((t) => (mostrarFinalizadas ? t.status === "finalizado" : t.status !== "finalizado"));

  const handleGrupoChange = (nuevoGrupo) => {
    setGrupoActivo(nuevoGrupo);
  };

  const handleRenameGroup = async () => {
    const nuevoNombre = prompt("Nuevo nombre para el grupo:", grupoActivo);
    if (!nuevoNombre || nuevoNombre === grupoActivo) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "https://gestor-tareas-backend-jcem.onrender.com"}/api/groups/${grupoActivo}`,
        { newGroupName: nuevoNombre }
      );
      const res = await getTasks();
      setTasks(res.data);
      setGrupoActivo(nuevoNombre);
    } catch (err) {
      console.error("Error renombrando grupo:", err);
    }
  };

  const handleDeleteGroup = async () => {
    const confirmacion = confirm(
      `¿Estás seguro que deseas eliminar el grupo "${grupoActivo}" y todas sus tareas?`
    );
    if (!confirmacion) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "https://gestor-tareas-backend-jcem.onrender.com"}/api/groups/${grupoActivo}`
      );
      const tareasRestantes = tasks.filter((t) => t.group !== grupoActivo);
      setTasks(tareasRestantes);
      const nuevosGrupos = [...new Set(tareasRestantes.map((t) => t.group))];
      setGrupoActivo(nuevosGrupos[0] || "");
    } catch (err) {
      console.error("Error eliminando grupo:", err);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTask(task._id, { ...task, status: newStatus });
      const updated = tasks.map((t) => (t._id === task._id ? res.data : t));
      setTasks(updated);
      if (newStatus === "finalizado") {
        setConfettiTaskId(task._id);
        setShowHeart(true);
        setTimeout(() => {
          setConfettiTaskId(null);
          setShowHeart(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Error actualizando estatus:", err);
    }
  };

  const handleEditSave = async (updatedTask) => {
    try {
      const res = await updateTask(updatedTask._id, updatedTask);
      const updated = tasks.map((t) =>
        t._id === updatedTask._id ? res.data : t
      );
      setTasks(updated);
      setEditingTask(null);
    } catch (err) {
      console.error("Error editando tarea:", err);
    }
  };

  const handleCreateNewGroup = (newGroupName) => {
    setGrupoActivo(newGroupName);
  };

  const handleAddNewTask = async (newTask) => {
    try {
      const res = await createTask({ ...newTask, group: grupoActivo });
      setTasks([res.data, ...tasks]);
      setShowNewTask(false);
    } catch (err) {
      console.error("Error agregando tarea:", err);
    }
  };

  const handleDeleteTask = async (taskToDelete) => {
    try {
      await deleteTask(taskToDelete._id);
      setTasks(tasks.filter((t) => t._id !== taskToDelete._id));
    } catch (err) {
      console.error("Error eliminando tarea:", err);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(tareasFiltradas);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const newTasks = tasks.map((t) =>
      t.group === grupoActivo ? reordered.find((r) => r._id === t._id) || t : t
    );
    setTasks(newTasks);
  };

  return (
    <div className="p-6 flex-1 relative">
      {showHeart && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-red-500 text-6xl animate-ping">❤️</div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-darkGray mb-2">
            Tareas de {grupoActivo || "(sin grupo)"}
          </h1>
          <div className="flex gap-2 items-center">
            <select
              value={grupoActivo}
              onChange={(e) => handleGrupoChange(e.target.value)}
              className="p-2 border rounded"
            >
              {grupos.map((grupo) => (
                <option key={grupo} value={grupo}>
                  {grupo}
                </option>
              ))}
            </select>
            <button
              onClick={handleRenameGroup}
              className="text-sm text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={handleDeleteGroup}
              className="text-sm text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewGroup(true)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nuevo Grupo
          </button>
          <button
            onClick={() => setShowNewTask(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Nueva Tarea
          </button>
          <button
            onClick={() => setMostrarFinalizadas(!mostrarFinalizadas)}
            className="bg-gray-200 text-darkGray px-4 py-2 rounded hover:bg-gray-300"
          >
            {mostrarFinalizadas ? "Ocultar Finalizadas" : "Ver Finalizadas"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="Todas">Todas las prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
        <input
          type="text"
          value={filtroResponsable}
          onChange={(e) => setFiltroResponsable(e.target.value)}
          placeholder="Filtrar por responsable"
          className="p-2 border rounded w-64"
        />
        <input
          type="text"
          value={filtroTitulo}
          onChange={(e) => setFiltroTitulo(e.target.value)}
          placeholder="Filtrar por título de tarea"
          className="p-2 border rounded w-64"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 italic">Cargando tareas...</p>
      ) : tareasFiltradas.length === 0 ? (
        <p className="text-gray-500 italic">
          No hay tareas que coincidan con los filtros.
        </p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tareas">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {tareasFiltradas.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard
                          task={task}
                          onStatusChange={handleStatusChange}
                          onEdit={() => setEditingTask(task)}
                          onDelete={handleDeleteTask}
                        />
                        <div className="absolute top-0 right-0">
                          <Confetti active={confettiTaskId === task._id} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEditSave}
        />
      )}

      {showNewGroup && (
        <NewGroupModal
          onClose={() => setShowNewGroup(false)}
          onCreate={handleCreateNewGroup}
        />
      )}

      {showNewTask && (
        <NewTaskModal
          onClose={() => setShowNewTask(false)}
          onAdd={handleAddNewTask}
        />
      )}
    </div>
  );
}


