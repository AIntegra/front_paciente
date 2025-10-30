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
      try {
        setLoading(true);

        const { data: submissions, error } = await supabase
          .from("submissions")
          .select("form_id, answers_json, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("❌ Error cargando respuestas:", error);
          setLoading(false);
          return;
        }

        const FORM_HEALTH = "24f92e42-cf91-49ba-a78c-892b59365115";
        const FORM_FOOD = "a23bc623-ac74-4f56-b73a-18f65bb3e45a";
        const FORM_SLEEP = "a6cb6ae4-0955-4b70-8010-65d28da49df2";

        const formatDate = (iso: string) => {
          const d = new Date(iso);
          return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${d.getFullYear()}`;
        };

        const safe = (n: any) => (isNaN(Number(n)) ? 0 : Number(n));

        const general = submissions
          .filter((s) => s.form_id === FORM_HEALTH)
          .map((s) => {
            const a = normalizeKeys(s.answers_json);
            return {
              date: formatDate(s.created_at),
              peso: safe(a.peso),
              altura: safe(a.altura),
              presion: a.presion ?? "",
              fuma: a.fuma ?? "",
            };
          });

        const food = submissions
          .filter((s) => s.form_id === FORM_FOOD)
          .map((s) => {
            const a = normalizeKeys(s.answers_json);
            return {
              date: formatDate(s.created_at),
              comidas_dia: safe(a.comidas_dia),
            };
          });

        const sleep = submissions
          .filter((s) => s.form_id === FORM_SLEEP)
          .map((s) => {
            const a = normalizeKeys(s.answers_json);
            return {
              date: formatDate(s.created_at),
              descanso: safe(
                a["descanso_percibido_(1-10)"] ??
                  a["descanso_percibido_1-10"] ??
                  a["descanso"]
              ),
              horas_sueno: safe(
                a["horas_de_sueno_por_noche"] ??
                  a["horas_sueno"] ??
                  a["horas_de_sueno"]
              ),
            };
          });

        setGeneralData(general);
        setAlimentacionData(food);
        setSuenoData(sleep);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId]);

  return { generalData, alimentacionData, suenoData, loading };
};

// ✅ Normaliza claves con acentos, mayúsculas y espacios
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
