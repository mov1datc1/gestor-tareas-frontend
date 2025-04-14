import { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Pencil, Trash2 } from "lucide-react";

const ESTADOS = [
  "Pendiente",
  "En Curso",
  "En Pruebas",
  "Por Aprobacion",
  "Finalizado"
];

const colores = {
  Pendiente: "bg-yellow-100",
  "En Curso": "bg-blue-100",
  "En Pruebas": "bg-purple-100",
  "Por Aprobacion": "bg-orange-100",
  Finalizado: "bg-green-100"
};

export default function Projects() {
  const [proyectos, setProyectos] = useState([]);

  const API_URL =
    import.meta.env.VITE_API_URL || "https://gestor-tareas-backend-jcem.onrender.com";

  const fetchProyectos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/projects`);
      setProyectos(res.data);
    } catch (err) {
      console.error("❌ Error cargando proyectos", err);
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const nuevoEstado = destination.droppableId;

    try {
      await axios.put(`${API_URL}/api/projects/${draggableId}`, {
        status: nuevoEstado.toLowerCase()
      });
      setTimeout(fetchProyectos, 300);
    } catch (err) {
      console.error("❌ Error actualizando estado", err);
    }
  };

  const agregarProyecto = async () => {
    const nombre = prompt("Nombre del proyecto:");
    const responsable = prompt("Responsable(s):");
    if (!nombre || !responsable) return;

    try {
      await axios.post(`${API_URL}/api/projects`, {
        name: nombre,
        owner: responsable,
        status: "pendiente"
      });
      setTimeout(fetchProyectos, 500);
    } catch (err) {
      console.error("❌ Error creando proyecto", err);
    }
  };

  const editarProyecto = async (proy) => {
    const nuevoNombre = prompt("Editar nombre del proyecto:", proy.name);
    const nuevoOwner = prompt("Editar responsable(s):", proy.owner);
    if (!nuevoNombre || !nuevoOwner) return;

    try {
      await axios.put(`${API_URL}/api/projects/${proy._id}`, {
        name: nuevoNombre,
        owner: nuevoOwner,
        status: proy.status.toLowerCase()
      });
      setTimeout(fetchProyectos, 500);
    } catch (err) {
      console.error("❌ Error actualizando proyecto", err);
    }
  };

  const eliminarProyecto = async (id) => {
    const confirmacion = confirm("¿Eliminar este proyecto?");
    if (!confirmacion) return;

    try {
      await axios.delete(`${API_URL}/api/projects/${id}`);
      setTimeout(fetchProyectos, 300);
    } catch (err) {
      console.error("❌ Error eliminando proyecto", err);
    }
  };

  const proyectosPorEstado = ESTADOS.reduce((acc, estado) => {
    acc[estado] = proyectos.filter(
      (p) => p.status?.toLowerCase() === estado.toLowerCase()
    );
    return acc;
  }, {});

  return (
    <div className="p-6 flex-1">
      <h1 className="text-3xl font-bold text-darkGray mb-6">Tablero de Proyectos</h1>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        <MetricCard label="Total" value={proyectos.length} />
        {ESTADOS.map((estado) => (
          <MetricCard
            key={estado}
            label={estado}
            value={proyectosPorEstado[estado]?.length || 0}
          />
        ))}
      </div>

      <button
        onClick={agregarProyecto}
        className="mb-4 bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Nuevo Proyecto
      </button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {ESTADOS.map((estado) => (
            <Droppable droppableId={estado.toLowerCase()} key={estado}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 rounded p-4 min-h-[200px]"
                >
                  <h2 className="font-semibold mb-2">{estado}</h2>
                  {proyectosPorEstado[estado].map((proy, index) => (
                    <Draggable
                      key={proy._id}
                      draggableId={proy._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded p-3 mb-2 shadow ${colores[estado]}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{proy.name}</p>
                              <p className="text-sm text-gray-700">
                                Responsable: {proy.owner}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                className="text-gray-600 hover:text-blue-600"
                                onClick={() => editarProyecto(proy)}
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="text-gray-600 hover:text-red-600"
                                onClick={() => eliminarProyecto(proy._id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-800 text-white p-4 text-center shadow-md">
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
