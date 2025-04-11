// src/pages/ProjectBoard.jsx
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { nanoid } from "nanoid";

const initialStatuses = [
  "pendiente",
  "en curso",
  "en pruebas",
  "por aprobacion",
  "finalizado",
];

const statusColors = {
  pendiente: "bg-yellow-100",
  "en curso": "bg-blue-100",
  "en pruebas": "bg-purple-100",
  "por aprobacion": "bg-orange-100",
  finalizado: "bg-green-100",
};

const ProjectBoard = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("projects") || "[]");
    setProjects(stored);
  }, []);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const updated = projects.map((project) =>
      project.id === draggableId
        ? { ...project, status: destination.droppableId }
        : project
    );

    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));
  };

  const handleAdd = () => {
    const nombre = prompt("Nombre del proyecto");
    const owner = prompt("Responsable");
    if (!nombre || !owner) return;
    const nuevo = {
      id: nanoid(),
      nombre,
      owner,
      status: "pendiente",
    };
    const updated = [...projects, nuevo];
    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));
  };

  const getCount = (estado) =>
    projects.filter((p) => p.status === estado).length;

  return (
    <div className="p-6 flex-1 space-y-6">
      <h1 className="text-3xl font-bold text-darkGray">Tablero de Proyectos</h1>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Total" value={projects.length} />
        <MetricCard title="Pendientes" value={getCount("pendiente")} />
        <MetricCard title="En Curso" value={getCount("en curso")} />
        <MetricCard title="En Pruebas" value={getCount("en pruebas")} />
        <MetricCard title="Finalizados" value={getCount("finalizado")} />
      </div>

      <button
        onClick={handleAdd}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Nuevo Proyecto
      </button>

      <div className="overflow-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-[1000px]">
            {initialStatuses.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-4 rounded w-64 min-h-[300px]"
                  >
                    <h2 className="font-semibold mb-2 capitalize">
                      {status.replace("_", " ")}
                    </h2>
                    {projects
                      .filter((p) => p.status === status)
                      .map((project, index) => (
                        <Draggable
                          draggableId={project.id}
                          index={index}
                          key={project.id}
                        >
                          {(provided) => (
                            <div
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              className={`mb-2 p-3 rounded shadow ${
                                statusColors[project.status] || "bg-white"
                              }`}
                            >
                              <h3 className="font-bold text-sm">
                                {project.nombre}
                              </h3>
                              <p className="text-xs text-gray-700">
                                Responsable: {project.owner}
                              </p>
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
    </div>
  );
};

const MetricCard = ({ title, value }) => (
  <div className="bg-gray-800 text-white p-4 rounded-xl shadow">
    <h3 className="text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default ProjectBoard;
