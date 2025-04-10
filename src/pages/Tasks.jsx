
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
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../api/groups";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [grupoActivo, setGrupoActivo] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");
  const [filtroResponsable, setFiltroResponsable] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, groupsRes] = await Promise.all([getTasks(), getGroups()]);
      setTasks(tasksRes.data);
      setGroups(groupsRes.data);
      if (!grupoActivo && groupsRes.data.length > 0) {
        setGrupoActivo(groupsRes.data[0].name);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  const tareasFiltradas = tasks
    .filter((t) => t.group === grupoActivo)
    .filter((t) => filtroPrioridad === "Todas" || t.priority === filtroPrioridad)
    .filter((t) =>
      filtroResponsable === "" ||
      (t.owner || "").toLowerCase().includes(filtroResponsable.toLowerCase())
    );

  const handleGrupoChange = (nuevoGrupo) => setGrupoActivo(nuevoGrupo);

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTask(task._id, { ...task, status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      console.error("Error actualizando estatus:", err);
    }
  };

  const handleEditSave = async (updatedTask) => {
    try {
      const res = await updateTask(updatedTask._id, updatedTask);
      setTasks(tasks.map((t) => (t._id === updatedTask._id ? res.data : t)));
      setEditingTask(null);
    } catch (err) {
      console.error("Error editando tarea:", err);
    }
  };

  const handleCreateNewGroup = async (newGroupName) => {
    try {
      await createGroup({ name: newGroupName });
      fetchData();
      setGrupoActivo(newGroupName);
    } catch (err) {
      console.error("Error creando grupo:", err);
    }
  };

  const handleEditGroup = async () => {
    const nuevoNombre = prompt("Nuevo nombre del grupo:", grupoActivo);
    if (nuevoNombre && nuevoNombre !== grupoActivo) {
      try {
        const grupo = groups.find((g) => g.name === grupoActivo);
        await updateGroup(grupo._id, { name: nuevoNombre });
        fetchData();
        setGrupoActivo(nuevoNombre);
      } catch (err) {
        console.error("Error actualizando grupo:", err);
      }
    }
  };

  const handleDeleteGroup = async () => {
    const confirmacion = window.confirm(`¿Estás seguro de eliminar el grupo "${grupoActivo}"? Esto eliminará todas sus tareas.`);
    if (confirmacion) {
      try {
        const grupo = groups.find((g) => g.name === grupoActivo);
        await deleteGroup(grupo._id);
        fetchData();
        setGrupoActivo("");
      } catch (err) {
        console.error("Error eliminando grupo:", err);
      }
    }
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
          <h1 className="text-2xl font-bold text-darkGray mb-2">Tareas de {grupoActivo}</h1>
          <select
            value={grupoActivo}
            onChange={(e) => handleGrupoChange(e.target.value)}
            className="p-2 border rounded"
          >
            {groups.map((grupo) => (
              <option key={grupo._id} value={grupo.name}>{grupo.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleEditGroup} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">✎ Editar Grupo</button>
          <button onClick={handleDeleteGroup} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">🗑️ Eliminar Grupo</button>
          <button onClick={() => setShowNewGroup(true)} className="bg-primary text-white px-3 py-1 rounded hover:bg-blue-700">+ Nuevo Grupo</button>
          <button onClick={() => setShowNewTask(true)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">+ Nueva Tarea</button>
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
        <p className="text-gray-500 italic">No hay tareas que coincidan con los filtros.</p>
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
