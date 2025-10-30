import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Send, ArrowLeft, FileText } from "lucide-react"; // ✅ iconos premium

export default function Forms() {
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const navigate = useNavigate();

  // ✅ Cargar formularios disponibles
  useEffect(() => {
    const fetchForms = async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) console.error("Error cargando formularios:", error);
      else setForms(data);
    };

    fetchForms();
  }, []);

  const handleAnswerChange = (field: string, value: string) => {
    setAnswers((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedForm) return alert("Selecciona un formulario");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return navigate("/");

    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userRow) {
      alert("Usuario no encontrado");
      return;
    }

    const { error } = await supabase.from("submissions").insert([
      {
        user_id: userRow.id,
        form_id: selectedForm.id,
        answers_json: answers,
      },
    ]);

    if (error) {
      alert("Error enviando formulario");
    } else {
      alert("✅ Formulario enviado correctamente");
      setSelectedForm(null);
      setAnswers({});
    }
  };

  const renderQuestions = () => {
    if (!selectedForm?.schema_json) {
      return (
        <p className="text-gray-500 text-center mt-4">
          No hay preguntas definidas para este formulario.
        </p>
      );
    }

    const questions = Array.isArray(selectedForm.schema_json)
      ? selectedForm.schema_json
      : [];

    return (
      <div className="space-y-5 mt-6">
        {questions.map((q: any, idx: number) => (
          <div key={idx} className="flex flex-col w-full">
            <label className="text-gray-700 font-medium mb-1">{q.label}</label>

            {q.type === "textarea" ? (
              <textarea
                rows={4}
                className="border border-blue-200 rounded-xl p-3 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500 transition outline-none"
                placeholder={q.placeholder || ""}
                value={answers[q.name] || ""}
                onChange={(e) => handleAnswerChange(q.name, e.target.value)}
              />
            ) : (
              <input
                type={q.type || "text"}
                className="border border-blue-200 rounded-xl p-3 bg-white/70 shadow-sm focus:ring-2 focus:ring-blue-500 transition outline-none"
                placeholder={q.placeholder || ""}
                value={answers[q.name] || ""}
                onChange={(e) => handleAnswerChange(q.name, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-blue-100 to-white overflow-x-hidden relative">

      {/* ✅ Fondo médico suave */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>

      <div className="relative w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl border border-blue-100 rounded-3xl p-6 sm:p-10 animate-fadeIn">

        {/* ✅ Si NO hay formulario seleccionado */}
        {!selectedForm ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-black text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
              <ClipboardList className="w-7 h-7 text-blue-600" />
              Formularios médicos
            </h1>

            <div className="space-y-4">
              {forms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => setSelectedForm(form)}
                  className="w-full text-left bg-white/70 backdrop-blur-xl hover:bg-white/90 border border-blue-100 shadow-sm p-4 rounded-xl transition"
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-blue-700 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {form.title}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {form.description}
                  </p>
                </button>
              ))}

              {forms.length === 0 && (
                <p className="text-gray-500 text-center mt-4">
                  No hay formularios disponibles
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-black text-blue-700 mb-2 text-center flex items-center gap-2 justify-center">
              <FileText className="w-7 h-7 text-blue-600" />
              {selectedForm.title}
            </h1>
            <p className="text-gray-600 text-center mb-6">
              {selectedForm.description}
            </p>

            {renderQuestions()}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-6">
              <button
                onClick={() => setSelectedForm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar formulario
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
