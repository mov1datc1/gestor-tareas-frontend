import { useMemo, useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = {
  pendiente: "#facc15",
  "en curso": "#fcd34d",
  finalizado: "#4ade80"
};

export default function Dashboard({ tareasPorGrupo, grupoActivo }) {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(grupoActivo);

  useEffect(() => {
    setGrupoSeleccionado(grupoActivo);
  }, [grupoActivo]);

  const grupos = Object.keys(tareasPorGrupo || {});
  const tareas = useMemo(() => tareasPorGrupo[grupoSeleccionado] || [], [grupoSeleccionado, tareasPorGrupo]);

  const tareasPorEstado = useMemo(() => {
    return ["pendiente", "en curso", "finalizado"].map((estado) => ({
      estado,
      cantidad: tareas.filter((t) => t.status === estado).length
    }));
  }, [tareas]);

  const tareasPorResponsable = useMemo(() => {
    const conteo = {};
    tareas.forEach((t) => {
      const owner = t.owner || "Sin responsable";
      conteo[owner] = (conteo[owner] || 0) + 1;
    });
    return Object.entries(conteo).map(([owner, cantidad]) => ({ owner, cantidad }));
  }, [tareas]);

  const total = tareas.length;
  const finalizadas = tareas.filter((t) => t.status === "finalizado").length;
  const porcentajeFinalizadas = total > 0 ? ((finalizadas / total) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-8 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-darkGray">Dashboard de Tareas</h1>
        <select
          value={grupoSeleccionado}
          onChange={(e) => setGrupoSeleccionado(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          {grupos.map((grupo) => (
            <option key={grupo} value={grupo}>{grupo}</option>
          ))}
        </select>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Pendientes" value={tareasPorEstado[0].cantidad} bg="bg-yellow-100" />
        <Card title="En Curso" value={tareasPorEstado[1].cantidad} bg="bg-yellow-200" />
        <Card title="Finalizadas" value={tareasPorEstado[2].cantidad} bg="bg-green-200" />
        <Card title="% Finalizadas" value={`${porcentajeFinalizadas}%`} bg="bg-gray-800 text-white" />
      </div>

      {/* Gráfico por estado */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Tareas por Estado</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tareasPorEstado}>
            <XAxis dataKey="estado" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad">
              {tareasPorEstado.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.estado]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico por responsable */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Tareas por Responsable</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tareasPorResponsable}>
            <XAxis dataKey="owner" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de torta */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Tareas Finalizadas vs Totales</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: "Finalizadas", value: finalizadas },
                { name: "No finalizadas", value: total - finalizadas }
              ]}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              <Cell fill="#4ade80" />
              <Cell fill="#f87171" />
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ title, value, bg }) {
  return (
    <div className={`rounded-xl p-4 shadow ${bg}`}>
      <h3 className="text-md font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
