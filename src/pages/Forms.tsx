import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import { useNavigate } from "react-router-dom"

export default function Forms() {
  const [forms, setForms] = useState<any[]>([])
  const [selectedForm, setSelectedForm] = useState<any>(null)
  const [answers, setAnswers] = useState<any>({})
  const navigate = useNavigate()

  // 🔹 Cargar formularios disponibles
  useEffect(() => {
    const fetchForms = async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) console.error("Error cargando formularios:", error)
      else setForms(data)
    }

    fetchForms()
  }, [])

  // 🔹 Manejar cambios en las respuestas
  const handleAnswerChange = (field: string, value: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 🔹 Enviar formulario
  const handleSubmit = async () => {
    if (!selectedForm) return alert("Selecciona un formulario")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return navigate("/")

    // Buscar el registro de usuario en la tabla users
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (!userRow) {
      alert("Usuario no encontrado en la base de datos")
      return
    }

    // Guardar submission
    const { error } = await supabase.from("submissions").insert([
      {
        user_id: userRow.id,
        form_id: selectedForm.id,
        answers_json: answers,
      },
    ])

    if (error) {
      console.error("Error enviando formulario:", error)
      alert("Error enviando formulario")
    } else {
      alert("✅ Formulario enviado correctamente")
      setSelectedForm(null)
      setAnswers({})
    }
  }

  // 🔹 Renderizar preguntas del formulario
  const renderQuestions = () => {
    if (!selectedForm?.schema_json) {
      return (
        <p className="text-gray-500 text-center mt-4">
          No hay preguntas definidas en este formulario.
        </p>
      )
    }

    const questions = Array.isArray(selectedForm.schema_json)
      ? selectedForm.schema_json
      : []

    return (
      <div className="space-y-4 mt-6">
        {questions.map((q: any, idx: number) => (
          <div key={idx} className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">
              {q.label}
            </label>
            {q.type === "textarea" ? (
              <textarea
                className="border rounded-lg p-2 bg-gray-50"
                placeholder={q.placeholder || ""}
                value={answers[q.name] || ""}
                onChange={(e) =>
                  handleAnswerChange(q.name, e.target.value)
                }
              />
            ) : (
              <input
                type={q.type || "text"}
                className="border rounded-lg p-2 bg-gray-50"
                placeholder={q.placeholder || ""}
                value={answers[q.name] || ""}
                onChange={(e) =>
                  handleAnswerChange(q.name, e.target.value)
                }
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-secondary px-4">
      <div className="bg-white shadow-soft rounded-2xl p-8 w-full max-w-2xl transition-all duration-300 hover:shadow-md">
        {!selectedForm ? (
          <>
            <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
              🩺 Formularios médicos
            </h1>

            <div className="space-y-4">
              {forms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => setSelectedForm(form)}
                  className="w-full text-left bg-blue-50 hover:bg-blue-100 p-4 rounded-xl shadow-sm"
                >
                  <h2 className="text-lg font-semibold text-blue-700">
                    {form.title}
                  </h2>
                  <p className="text-gray-600">{form.description}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
              🩺 {selectedForm.title}
            </h1>
            <p className="text-gray-600 text-center mb-6">
              {selectedForm.description}
            </p>

            {renderQuestions()}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setSelectedForm(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm"
              >
                Volver
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-sm"
              >
                Enviar formulario
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
