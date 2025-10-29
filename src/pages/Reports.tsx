import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

interface Report {
  id: string
  status: string | null
  pdf_url: string | null
  created_at: string
  form_title?: string
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)

      // 1️⃣ Obtener usuario autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        alert('No se pudo obtener la sesión actual')
        setLoading(false)
        return
      }

      // 2️⃣ Buscar ID interno en "users"
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!userData) {
        alert('No se encontró el usuario en la tabla users.')
        setLoading(false)
        return
      }

      // 3️⃣ Traer los reports del usuario actual
      const { data: reportsData, error } = await supabase
        .from('reports')
        .select('id, status, pdf_url, created_at, submission_id')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al cargar reports:', error.message)
        setLoading(false)
        return
      }

      // 4️⃣ (Opcional) Unir con forms para mostrar títulos
      const withTitles = await Promise.all(
        (reportsData || []).map(async (report) => {
          const { data: submission } = await supabase
            .from('submissions')
            .select('form_id')
            .eq('id', report.submission_id)
            .single()

          let formTitle = ''
          if (submission?.form_id) {
            const { data: form } = await supabase
              .from('forms')
              .select('title')
              .eq('id', submission.form_id)
              .single()
            formTitle = form?.title || ''
          }

          return { ...report, form_title: formTitle }
        })
      )

      setReports(withTitles)
      setLoading(false)
    }

    loadReports()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Cargando informes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Informes médicos</h1>

      {reports.length === 0 ? (
        <p className="text-gray-500">No tienes informes disponibles.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white shadow-sm border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div>
                <h2 className="font-semibold text-gray-800">
                  {r.form_title || 'Informe médico'}
                </h2>
                <p className="text-sm text-gray-500">
                  Estado: {r.status || 'pendiente'}
                </p>
                <p className="text-sm text-gray-400">
                  Creado el {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>

              {r.pdf_url ? (
                <a
                  href={r.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Ver PDF
                </a>
              ) : (
                <span className="mt-2 md:mt-0 text-yellow-600 font-medium">
                  🔄 En proceso...
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
