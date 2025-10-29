import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "./services/supabase"

import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Forms from "./pages/Forms"
import Reports from "./pages/Reports"
import Navbar from "./components/Navbar"
import CalendarPage from "./pages/CalendarPage";

function AppContent() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // 1️⃣ Verificar sesión inicial
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    checkSession()

    // 2️⃣ Escuchar cambios de sesión (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <p className="text-gray-600 text-lg">Cargando aplicación...</p>
      </div>
    )
  }

  const isLoginPage = location.pathname === "/"

  return (
    <div className="min-h-screen bg-secondary font-sans text-gray-800">
      {/* Navbar visible solo fuera del login */}
      {!isLoginPage && <Navbar />}

      <div className="max-w-5xl mx-auto p-6">
        <Routes>
          {/* Página de inicio */}
          <Route path="/" element={<Login />} />
          {/* Calendario de estado de ánimo */}
          <Route path="/calendar" element={<CalendarPage />} />
          {/* Perfil del paciente */}
          <Route
            path="/profile"
            element={session ? <Profile /> : <Navigate to="/" replace />}
          />

          {/* Formularios médicos */}
          <Route
            path="/forms"
            element={session ? <Forms /> : <Navigate to="/" replace />}
          />

          {/* Informes médicos */}
          <Route
            path="/reports"
            element={session ? <Reports /> : <Navigate to="/" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
