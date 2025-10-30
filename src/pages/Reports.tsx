import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { FileText, FileSearch, Loader2 } from "lucide-react"; // ✅ Iconos premium

interface Report {
  id: string;
  status: string | null;
  pdf_url: string | null;
  created_at: string;
  form_title?: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("No se pudo obtener la sesión actual");
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!userData) {
        alert("No se encontró el usuario en la base de datos");
        setLoading(false);
        return;
      }

      const { data: reportsData, error } = await supabase
        .from("reports")
        .select("id, status, pdf_url, created_at, submission_id")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar reports:", error.message);
        setLoading(false);
        return;
      }

      const withTitles = await Promise.all(
        (reportsData || []).map(async (report) => {
          const { data: submission } = await supabase
            .from("submissions")
            .select("form_id")
            .eq("id", report.submission_id)
            .single();

          let formTitle = "";
          if (submission?.form_id) {
            const { data: form } = await supabase
              .from("forms")
              .select("title")
              .eq("id", submission.form_id)
              .single();
            formTitle = form?.title || "";
          }

          return { ...report, form_title: formTitle };
        })
      );

      setReports(withTitles);
      setLoading(false);
    };

    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-blue-700 animate-pulse gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Cargando informes clínicos...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-blue-100 to-white overflow-x-hidden relative animate-fadeIn">

      {/* ✅ Fondo médico elegante */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>

      <div className="relative max-w-3xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl border border-blue-100 rounded-3xl p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-black text-blue-700 mb-6 flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-600" />
          Informes médicos
        </h1>

        {/* ✅ Si no hay informes */}
        {reports.length === 0 ? (
          <div className="bg-white/60 text-gray-500 rounded-xl p-8 shadow-inner text-center border">
            <FileSearch className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            Actualmente no tienes informes generados.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-white/70 backdrop-blur-xl border border-blue-100 shadow-sm rounded-xl p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-3 hover:shadow-xl transition-all"
              >
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800 text-base sm:text-lg break-words">
                    {r.form_title || "Informe médico"}
                  </h2>

                  <p className="text-sm text-gray-600">
                    Estado:{" "}
                    <span
                      className={
                        r.status === "completado"
                          ? "text-green-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }
                    >
                      {r.status || "pendiente"}
                    </span>
                  </p>

                  <p className="text-sm text-gray-400">
                    Generado el{" "}
                    {new Date(r.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>

                {/* ✅ Botón de abrir PDF */}
                {r.pdf_url ? (
                  <a
                    href={r.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto text-center bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-md font-semibold hover:bg-blue-700 hover:scale-[1.02] transition"
                  >
                    Ver informe
                  </a>
                ) : (
                  <span className="w-full md:w-auto text-center text-yellow-600 font-semibold">
                    🔄 Generándose...
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
