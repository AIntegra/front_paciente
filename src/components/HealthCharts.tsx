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
import { HeartPulse, Salad, Moon } from "lucide-react"; // ✅ iconos premium

export const HealthCharts = ({
  data,
  type,
}: {
  data: any[];
  type: "general" | "alimentacion" | "sueno";
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-blue-100 shadow text-center text-gray-500 w-full">
        No hay datos suficientes para mostrar gráficos.
      </div>
    );
  }

  const Card = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: any;
    children: any;
  }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-blue-100 shadow-lg p-4 sm:p-6 w-full transition hover:shadow-xl">
      <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-blue-700 mb-4">
        {icon} {title}
      </h2>

      {/* ✅ Contenedor totalmente responsivo */}
      <div className="w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );

  /** ✅ SALUD GENERAL */
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
      <Card title="Evaluación de salud general" icon={<HeartPulse size={20} />}>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
          <XAxis dataKey="date" stroke="#475569" />
          <YAxis stroke="#475569" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="peso" stroke="#3b82f6" name="Peso (kg)" strokeWidth={2} />
          <Line type="monotone" dataKey="sistolica" stroke="#ef4444" name="Presión sistólica" strokeWidth={2} />
          <Line type="monotone" dataKey="diastolica" stroke="#22c55e" name="Presión diastólica" strokeWidth={2} />
        </LineChart>
      </Card>
    );
  }

  /** ✅ ALIMENTACIÓN */
  if (type === "alimentacion") {
    return (
      <Card title="Hábitos alimenticios" icon={<Salad size={20} />}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
          <XAxis dataKey="date" stroke="#475569" />
          <YAxis stroke="#475569" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="comidas_dia"
            stroke="#f59e0b"
            name="Comidas al día"
            strokeWidth={2}
          />
        </LineChart>
      </Card>
    );
  }

  /** ✅ SUEÑO */
  if (type === "sueno") {
    return (
      <Card title="Calidad del sueño" icon={<Moon size={20} />}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
          <XAxis dataKey="date" stroke="#475569" />
          <YAxis stroke="#475569" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="horas_sueno"
            stroke="#0ea5e9"
            name="Horas de sueño"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="descanso"
            stroke="#8b5cf6"
            name="Descanso percibido"
            strokeWidth={2}
          />
        </LineChart>
      </Card>
    );
  }

  return null;
};
