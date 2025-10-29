import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export const HealthCharts = ({
  data,
  type,
}: {
  data: any[];
  type: "general" | "alimentacion" | "sueno";
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow text-center text-gray-500">
        No hay datos suficientes para mostrar gráficos.
      </div>
    );
  }

  if (type === "general") {
    const formatted = data.map((d) => {
      let sistolica = 0,
        diastolica = 0;
      if (d.presion?.includes("/")) {
        const [s, dia] = d.presion.split("/").map(Number);
        sistolica = s;
        diastolica = dia;
      }
      return { ...d, sistolica, diastolica };
    });

    return (
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Evaluación de salud general
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="peso" stroke="#3b82f6" name="Peso (kg)" />
            <Line
              type="monotone"
              dataKey="sistolica"
              stroke="#ef4444"
              name="Presión sistólica"
            />
            <Line
              type="monotone"
              dataKey="diastolica"
              stroke="#22c55e"
              name="Presión diastólica"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "alimentacion") {
    return (
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Hábitos alimenticios
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="comidas_dia"
              stroke="#f59e0b"
              name="Comidas al día"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "sueno") {
    return (
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Calidad del sueño
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="horas_sueno"
              stroke="#0ea5e9"
              name="Horas de sueño"
            />
            <Line
              type="monotone"
              dataKey="descanso"
              stroke="#8b5cf6"
              name="Descanso percibido"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};
