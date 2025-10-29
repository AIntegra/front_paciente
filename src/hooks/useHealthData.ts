import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export interface HealthDataPoint {
  date: string;
  peso?: number;
  altura?: number;
  presion?: string;
  fuma?: string;
  comidas_dia?: number;
  descanso?: number;
  horas_sueno?: number;
}

export const useHealthData = (userId?: string) => {
  const [generalData, setGeneralData] = useState<HealthDataPoint[]>([]);
  const [alimentacionData, setAlimentacionData] = useState<HealthDataPoint[]>([]);
  const [suenoData, setSuenoData] = useState<HealthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      setLoading(true);

      const { data: submissions, error } = await supabase
        .from("submissions")
        .select("form_id, answers_json, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }); // orden cronológico

      if (error) {
        console.error("❌ Error cargando respuestas:", error);
        setLoading(false);
        return;
      }

      console.log("🧩 Submissions crudas:", submissions);

      const FORM_HEALTH = "24f92e42-cf91-49ba-a78c-892b59365115";
      const FORM_FOOD = "a23bc623-ac74-4f56-b73a-18f65bb3e45a";
      const FORM_SLEEP = "a6cb6ae4-0955-4b70-8010-65d28da49df2";

      // 🩺 Salud general
      const general = submissions
        .filter((s) => s.form_id === FORM_HEALTH)
        .map((s) => {
          const a = normalizeKeys(s.answers_json);
          return {
            date: new Date(s.created_at).toLocaleDateString(),
            peso: Number(a.peso ?? 0),
            altura: Number(a.altura ?? 0),
            presion: a.presion ?? "",
            fuma: a.fuma ?? "",
          };
        });
      setGeneralData(general);

      // 🍎 Alimentación
      const food = submissions
        .filter((s) => s.form_id === FORM_FOOD)
        .map((s) => {
          const a = normalizeKeys(s.answers_json);
          return {
            date: new Date(s.created_at).toLocaleDateString(),
            comidas_dia: Number(a.comidas_dia ?? 0),
          };
        });
      setAlimentacionData(food);

      // 😴 Sueño
      const sleep = submissions
        .filter((s) => s.form_id === FORM_SLEEP)
        .map((s) => {
          const a = normalizeKeys(s.answers_json);
          return {
            date: new Date(s.created_at).toLocaleDateString(),
            descanso: Number(
              a["descanso_percibido_(1-10)"] ??
                a["descanso_percibido_1-10"] ??
                a["descanso"] ??
                0
            ),
            horas_sueno: Number(
              a["horas_de_sueno_por_noche"] ??
                a["horas_sueno"] ??
                a["horas_de_sueno"] ??
                0
            ),
          };
        });
      setSuenoData(sleep);

      setLoading(false);
    };

    fetchAll();
  }, [userId]);

  return { generalData, alimentacionData, suenoData, loading };
};

// 🔧 Limpia claves del JSON (acentos, mayúsculas, espacios)
function normalizeKeys(obj: any) {
  if (!obj || typeof obj !== "object") return {};
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = key
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "_");
    normalized[cleanKey] = value;
  }
  return normalized;
}
