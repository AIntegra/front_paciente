import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../services/supabase";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, ClipboardCheck, ClipboardEdit } from "lucide-react"; // ✅ Iconos premium

interface DailyLog {
  id?: string;
  user_id: string;
  date: string;
  mood: "buena" | "regular" | "mala";
  comment?: string;
}

interface Appointment {
  id?: string;
  user_id: string;
  date: string;
  title: string;
  description?: string;
}

export default function CalendarPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [comment, setComment] = useState("");
  const [mood, setMood] = useState<"buena" | "regular" | "mala" | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserAndData = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const authUser = auth?.user;
      if (!authUser) return;

      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", authUser.id)
        .single();

      if (!userRow) return;

      setUserId(userRow.id);
      await Promise.all([loadLogs(userRow.id), loadAppointments(userRow.id)]);
      setLoading(false);
    };

    loadUserAndData();
  }, []);

  const loadLogs = async (uid: string) => {
    const { data } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: true });
    if (data) setLogs(data);
  };

  const loadAppointments = async (uid: string) => {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: true });
    if (data) setAppointments(data);
  };

  const handleSave = async () => {
    if (!userId || !mood) return alert("Selecciona un estado antes de guardar.");
    setSaving(true);

    const log: DailyLog = {
      user_id: userId,
      date: format(selectedDate, "yyyy-MM-dd"),
      mood,
      comment,
    };

    const { error } = await supabase
      .from("daily_logs")
      .upsert([log], { onConflict: "user_id,date" });

    if (!error) {
      await loadLogs(userId);
      setComment("");
      setMood("");
    }

    setSaving(false);
  };

  const tileContent = ({ date }: { date: Date }) => {
    const log = logs.find((l) => isSameDay(new Date(l.date), date));
    if (!log) return null;

    const colors: Record<string, string> = {
      buena: "bg-green-500",
      regular: "bg-yellow-500",
      mala: "bg-red-500",
    };

    return <div className={`${colors[log.mood]} w-2.5 h-2.5 rounded-full mx-auto mt-1`} />;
  };

  const dailyAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.date), selectedDate)
  );

  const selectedLog = logs.find((log) => isSameDay(new Date(log.date), selectedDate));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600 font-medium animate-pulse">
        Cargando calendario...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-10 bg-gradient-to-b from-blue-100 to-white overflow-x-hidden relative animate-fadeIn">

      {/* ✅ Fondo premium clínico */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>

      <div className="relative max-w-6xl mx-auto bg-white/80 backdrop-blur-xl border border-blue-100 shadow-2xl rounded-3xl p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-black text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
          <CalendarDays className="w-7 h-7 text-blue-600" />
          Calendario de salud
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ✅ Calendario */}
          <div className="flex justify-center items-start">
            <Calendar
              onChange={(value) => setSelectedDate(value as Date)}
              value={selectedDate}
              locale="es-ES"
              tileContent={tileContent}
              className="rounded-2xl border border-gray-200 shadow-md p-3 bg-white w-full max-w-sm sm:max-w-md"
            />
          </div>

          {/* ✅ Panel lateral */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Día seleccionado:
            </h2>
            <p className="text-blue-600 font-extrabold mb-4 text-lg">
              {format(selectedDate, "dd 'de' MMMM yyyy", { locale: es })}
            </p>

            {/* ✅ Selección de estado */}
            <div className="flex flex-wrap gap-2 mb-3">
              {["buena", "regular", "mala"].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setMood(estado as any)}
                  className={`px-3 py-1.5 rounded-full font-medium text-sm sm:text-base border transition flex items-center gap-1
                    ${
                      mood === estado
                        ? "ring-2 ring-blue-500 scale-105"
                        : "opacity-90 hover:opacity-100"
                    }
                    ${
                      estado === "buena"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : estado === "regular"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : "bg-red-100 text-red-700 border-red-300"
                    }
                  `}
                >
                  <ClipboardCheck size={14} />
                  {estado}
                </button>
              ))}
            </div>

            {/* ✅ Comentario */}
            <textarea
              placeholder="Escribe tus comentarios del día..."
              className="w-full border border-blue-200 bg-white/70 text-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            {/* ✅ Botón guardar */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`mt-4 w-full py-2.5 rounded-xl text-white font-semibold shadow-md transition flex items-center justify-center gap-2
                ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"
                }
              `}
            >
              <ClipboardEdit size={18} />
              {saving ? "Guardando..." : "Guardar registro"}
            </button>

            {/* ✅ Estado guardado */}
            {selectedLog && (
              <div className="mt-6 bg-white/70 border border-blue-100 rounded-2xl p-4 shadow-inner">
                <p className="font-medium">
                  Estado guardado:{" "}
                  <span
                    className={`font-bold ${
                      selectedLog.mood === "buena"
                        ? "text-green-600"
                        : selectedLog.mood === "regular"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedLog.mood.toUpperCase()}
                  </span>
                </p>
                <p className="text-gray-600 mt-1 italic">
                  {selectedLog.comment || "Sin comentarios."}
                </p>
              </div>
            )}

            {/* ✅ Citas programadas */}
            {dailyAppointments.length > 0 && (
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold text-blue-700 mb-1 flex items-center gap-2">
                  🩺 Citas programadas
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm sm:text-base">
                  {dailyAppointments.map((a) => (
                    <li key={a.id}>
                      <strong>{format(new Date(a.date), "HH:mm")}:</strong>{" "}
                      {a.title} {a.description ? ` – ${a.description}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
