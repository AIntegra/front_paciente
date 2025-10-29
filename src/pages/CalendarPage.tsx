import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../services/supabase";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

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

    if (error) {
      console.error("❌ Error guardando:", error);
      alert("Error al guardar el registro.");
    } else {
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
      buena: "bg-green-400",
      regular: "bg-yellow-400",
      mala: "bg-red-400",
    };
    return (
      <div className={`${colors[log.mood]} w-2 h-2 rounded-full mx-auto mt-1`}></div>
    );
  };

  const dailyAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.date), selectedDate)
  );

  const selectedLog = logs.find((log) =>
    isSameDay(new Date(log.date), selectedDate)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-600">
        Cargando calendario...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-gradient-to-b from-blue-50 to-white px-3 sm:px-6 py-6 animate-fadeIn">
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-6xl border border-blue-100">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 text-center">
          Calendario de salud
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* 🗓️ Calendario */}
          <div className="flex justify-center items-center">
            <Calendar
              onChange={(value) => setSelectedDate(value as Date)}
              value={selectedDate}
              locale="es-ES"
              tileContent={tileContent}
              className="rounded-xl shadow-sm border border-gray-200 p-2 w-full max-w-sm"
            />
          </div>

          {/* 📋 Panel lateral */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Día seleccionado:{" "}
              <span className="text-blue-600">
                {format(selectedDate, "dd 'de' MMMM yyyy", { locale: es })}
              </span>
            </h2>

            <div className="flex flex-wrap gap-2 mb-3">
              {["buena", "regular", "mala"].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setMood(estado as "buena" | "regular" | "mala")}
                  className={`px-3 py-1 rounded-full font-medium transition border ${
                    mood === estado
                      ? "ring-2 ring-blue-500 scale-105"
                      : "opacity-90 hover:opacity-100"
                  } ${
                    estado === "buena"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : estado === "regular"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                      : "bg-red-100 text-red-700 border-red-300"
                  }`}
                >
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </button>
              ))}
            </div>

            {/* 📝 Textarea mejorado */}
            <textarea
              placeholder="Escribe tus comentarios del día..."
              className="w-full border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-400 rounded-xl p-3 shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 resize-none"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className={`mt-4 w-full py-2.5 rounded-xl text-white font-semibold transition ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-sm"
              }`}
            >
              {saving ? "Guardando..." : "Guardar registro"}
            </button>

            {selectedLog && (
              <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p>
                  <strong>Estado guardado:</strong>{" "}
                  <span
                    className={`font-semibold ${
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

            {dailyAppointments.length > 0 && (
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  🩺 Citas programadas
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {dailyAppointments.map((a) => (
                    <li key={a.id}>
                      <strong>{format(new Date(a.date), "HH:mm")}:</strong>{" "}
                      {a.title}
                      {a.description ? ` – ${a.description}` : ""}
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


