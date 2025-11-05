import { useState, useEffect } from "react";
import TaskTable from "../components/TaskTable";
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
  renameGroup,
  deleteGroup,
} from "../api/groups";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [grupoActivo, setGrupoActivo] = useState("");
  const [grupos, setGrupos] = useState([]);
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
  const [createdSortOrder, setCreatedSortOrder] = useState(null);

  const mergeGroupNames = (...collections) => {
    const names = [];

    collections.forEach((collection) => {
      if (!collection) return;

      if (Array.isArray(collection)) {
        collection.forEach((value) => {
          if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed) {
              names.push(trimmed);
            }
          }
        });
      } else if (typeof collection === "string") {
        const trimmed = collection.trim();
        if (trimmed) {
          names.push(trimmed);
        }
      }
    });

    return [...new Set(names)];
  };

  const extractGroupNames = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.groups)) return payload.groups;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data?.groups)) return payload.data.groups;
    return [];
  };

  const resolveGroupNameFromResponse = (payload, fallback) => {
    if (!payload) return fallback;
    if (typeof payload === "string") return payload;
    if (typeof payload.name === "string") return payload.name;
    if (typeof payload.group === "string") return payload.group;
    if (typeof payload.group?.name === "string") return payload.group.name;
    if (typeof payload.data?.name === "string") return payload.data.name;
    if (typeof payload.data?.group === "string") return payload.data.group;
    return fallback;
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchTasksAndGroups() {
      try {
        const [tasksResponse, groupsResponse] = await Promise.all([
          getTasks(),
          getGroups().catch((err) => {
            console.error("Error cargando grupos:", err);
            return null;
          }),
        ]);

        if (!isMounted) return;

        const taskList = Array.isArray(tasksResponse?.data)
          ? tasksResponse.data
          : Array.isArray(tasksResponse?.data?.tasks)
          ? tasksResponse.data.tasks
          : [];

        const orderedTasks = sortTasksByOrder(taskList);
        setTasks(orderedTasks);

        const fetchedGroups = groupsResponse ? extractGroupNames(groupsResponse.data) : [];
        const combinedGroups = mergeGroupNames(fetchedGroups, orderedTasks.map((t) => t.group));

        setGrupos(combinedGroups);
        setGrupoActivo((current) =>
          combinedGroups.includes(current) ? current : combinedGroups[0] || ""
        );
      } catch (err) {
        if (isMounted) {
          console.error("Error cargando tareas:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTasksAndGroups();

    return () => {
      isMounted = false;
    };
  }, []);
  const getCreatedTimestamp = (task) => {
    const createdValue =
      task.createdAt ||
      task.created_at ||
      task.createdOn ||
      task.creationDate ||
      task.created ||
      task.dateCreated;

    if (!createdValue) return 0;

    const parsed = new Date(createdValue);
    if (Number.isNaN(parsed.getTime())) return 0;
    return parsed.getTime();
  };

  const sortTasksByOrder = (list) => {
    return [...list].sort((a, b) => {
      if (a.group === b.group) {
        const orderA = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
        const orderB = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
      }

      const aTime = getCreatedTimestamp(a);
      const bTime = getCreatedTimestamp(b);

      return bTime - aTime;
    });
  };

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

  const tareasOrdenadas = createdSortOrder
    ? [...tareasFiltradas].sort((a, b) => {
        const aTime = getCreatedTimestamp(a);
        const bTime = getCreatedTimestamp(b);
        if (createdSortOrder === "desc") {
          return bTime - aTime;
        }
        return aTime - bTime;
      })
    : tareasFiltradas;

  const handleToggleCreatedSort = () => {
    setCreatedSortOrder((prev) => {
      if (!prev) return "desc";
      return prev === "desc" ? "asc" : "desc";
    });
  };

  const handleGrupoChange = (nuevoGrupo) => {
    setGrupoActivo(nuevoGrupo);
  };

  const handleRenameGroup = async () => {
    if (!grupoActivo) return;

    const nuevoNombre = prompt("Nuevo nombre para el grupo:", grupoActivo);
    const trimmedName = nuevoNombre?.trim();

    if (!trimmedName || trimmedName === grupoActivo) return;

    try {
      await renameGroup(grupoActivo, trimmedName);

      setTasks((prev) =>
        sortTasksByOrder(
          prev.map((task) =>
            task.group === grupoActivo ? { ...task, group: trimmedName } : task
          )
        )
      );

      setGrupos((prev) =>
        mergeGroupNames(prev.map((group) => (group === grupoActivo ? trimmedName : group)))
      );

      setGrupoActivo(trimmedName);
    } catch (err) {
      console.error("Error renombrando grupo:", err);
    }
  };

  const handleDeleteGroup = async () => {
    if (!grupoActivo) return;

    const confirmacion = confirm(
      `¿Estás seguro que deseas eliminar el grupo "${grupoActivo}" y todas sus tareas?`
    );
    if (!confirmacion) return;

    try {
      await deleteGroup(grupoActivo);

      const tareasRestantes = tasks.filter((t) => t.group !== grupoActivo);
      const ordenadas = sortTasksByOrder(tareasRestantes);
      setTasks(ordenadas);

      const gruposActualizados = mergeGroupNames(
        grupos.filter((group) => group !== grupoActivo),
        ordenadas.map((tarea) => tarea.group)
      );
      setGrupos(gruposActualizados);

      setGrupoActivo((current) => {
        if (current === grupoActivo) {
          return gruposActualizados[0] || "";
        }
        return gruposActualizados.includes(current)
          ? current
          : gruposActualizados[0] || "";
      });
    } catch (err) {
      console.error("Error eliminando grupo:", err);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTask(task._id, { ...task, status: newStatus });
      setTasks((prev) =>
        sortTasksByOrder(prev.map((t) => (t._id === task._id ? res.data : t)))
      );
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
      setTasks((prev) =>
        sortTasksByOrder(
          prev.map((t) => (t._id === updatedTask._id ? res.data : t))
        )
      );
      setEditingTask(null);
    } catch (err) {
      console.error("Error editando tarea:", err);
    }
  };

  const handleCreateNewGroup = async (newGroupName) => {
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      return false;
    }

    try {
      const response = await createGroup(trimmedName);
      const createdName = resolveGroupNameFromResponse(response?.data, trimmedName);

      const normalizedName = createdName?.trim() || trimmedName;

      setGrupos((prev) => mergeGroupNames(prev, [normalizedName]));
      setGrupoActivo(normalizedName);
      return true;
    } catch (err) {
      console.error("Error creando grupo:", err);
      return false;
    }
  };

  const handleAddNewTask = async (newTask) => {
    try {
      const timestamp = newTask.createdAt || new Date().toISOString();
      const payload = { ...newTask, group: grupoActivo, createdAt: timestamp };
      const res = await createTask(payload);
      const createdTask = res.data?.createdAt ? res.data : { ...res.data, createdAt: timestamp };
      setTasks((prev) => sortTasksByOrder([createdTask, ...prev]));
      setShowNewTask(false);
    } catch (err) {
      console.error("Error agregando tarea:", err);
    }
  };

  const handleDeleteTask = async (taskToDelete) => {
    try {
      await deleteTask(taskToDelete._id);
      setTasks((prev) =>
        sortTasksByOrder(prev.filter((t) => t._id !== taskToDelete._id))
      );
    } catch (err) {
      console.error("Error eliminando tarea:", err);
    }
  };

  const handleMoveTask = async (taskToMove, targetGroup) => {
    if (!targetGroup || taskToMove.group === targetGroup) return;

    try {
      const res = await updateTask(taskToMove._id, {
        ...taskToMove,
        group: targetGroup,
      });

      setTasks((prev) =>
        sortTasksByOrder(
          prev.map((task) => (task._id === taskToMove._id ? res.data : task))
        )
      );
    } catch (err) {
      console.error("Error moviendo tarea:", err);
    }
  };

  const handleReorderTasks = async ({ sourceIndex, destinationIndex, taskOrder }) => {
    if (typeof destinationIndex !== "number" || destinationIndex === sourceIndex) {
      return;
    }

    setCreatedSortOrder(null);

    const visibleTasks = taskOrder
      .map((id) => tasks.find((task) => task._id === id))
      .filter(Boolean);

    if (visibleTasks.length === 0) return;

    const reorderedVisible = Array.from(visibleTasks);
    const [movedTask] = reorderedVisible.splice(sourceIndex, 1);
    reorderedVisible.splice(destinationIndex, 0, movedTask);

    const hiddenTasks = tasks.filter(
      (task) => task.group === grupoActivo && !taskOrder.includes(task._id)
    );

    const finalOrderTasks = [...reorderedVisible, ...hiddenTasks].map((task, index) => ({
      ...task,
      order: index,
    }));

    setTasks((prev) => {
      const newTasks = [...prev];
      const groupIndexes = [];

      prev.forEach((task, index) => {
        if (task.group === grupoActivo) {
          groupIndexes.push(index);
        }
      });

      finalOrderTasks.forEach((task, idx) => {
        const targetIndex = groupIndexes[idx];
        if (typeof targetIndex === "number") {
          newTasks[targetIndex] = task;
        }
      });

      return sortTasksByOrder(newTasks);
    });

    try {
      await Promise.all(
        finalOrderTasks.map((task) => updateTask(task._id, task))
      );
    } catch (err) {
      console.error("Error reordenando tareas:", err);
    }
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
              disabled={!grupoActivo}
              className="text-sm text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-blue-300"
            >
              Editar
            </button>
            <button
              onClick={handleDeleteGroup}
              disabled={!grupoActivo}
              className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-red-300"
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
        <div className="flex items-center gap-3 text-gray-600 text-lg animate-pulse">
          <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Cargando tareas, por favor espera...
        </div>
      ) : tareasFiltradas.length === 0 ? (
        <p className="text-gray-500 italic">
          No hay tareas que coincidan con los filtros.
        </p>
      ) : (
      <TaskTable
        tasks={tareasOrdenadas}
        onStatusChange={handleStatusChange}
        onEdit={(task) => setEditingTask(task)}
        onDelete={handleDeleteTask}
        confettiTaskId={confettiTaskId}
        onToggleCreatedSort={handleToggleCreatedSort}
        createdSortOrder={createdSortOrder}
        onMove={handleMoveTask}
        groups={grupos}
        activeGroupId={grupoActivo}
        onReorder={handleReorderTasks}
      />
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

