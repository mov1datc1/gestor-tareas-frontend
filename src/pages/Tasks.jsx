import { useEffect, useState } from "react";
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

export default function Tasks({
  grupoActivo,
  setGrupoActivo
}) {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");
  const [filtroResponsable, setFiltroResponsable] = useState("");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await getTasks();
        setTasks(res.data);
      } catch (err) {
        console.error("Error cargando tareas:", err);
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
        : (t.owner || "")
            .toLowerCase()
            .includes(filtroResponsable.toLowerCase())
    );

  const handleGrupoChange = (nuevoGrupo) => {
    setGrupoActivo(nuevoGrupo);
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTask(task._id, { ...task, status: newStatus });
      const updated = tasks.map((t) =>
        t._id === task._id ? res.data : t
      );
      setTasks(updated);
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
      setTasks([...tasks, res.data]);
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

  return (
    <div className="p-6 flex-1">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-darkGray mb-2">
            Tareas de {grupoActivo}
          </h1>
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
        </div>
      </div>

      <div className="flex gap-4 mb-6">
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
      </div>

      {tareasFiltradas.length === 0 ? (
        <p className="text-gray-500 italic">
          No hay tareas que coincidan con los filtros.
        </p>
      ) : (
        tareasFiltradas.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onStatusChange={handleStatusChange}
            onEdit={() => setEditingTask(task)}
            onDelete={handleDeleteTask}
          />
        ))
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


