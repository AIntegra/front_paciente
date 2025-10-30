import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { HealthCharts } from "../components/HealthCharts";
import { useHealthData } from "../hooks/useHealthData";
import LayoutContainer from "../components/LayoutContainer";
import { UserCircle2, HeartPulse, Salad, Moon, LogOut } from "lucide-react"; // ✅ iconos médicos premium

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { generalData, alimentacionData, suenoData, loading: loadingHealth } =
    useHealthData(internalUserId || undefined);

  const [activeTab, setActiveTab] = useState<"general" | "alimentacion" | "sueno">(
    "general"
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate("/");

      setUser(user);

      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!userRow) {
        setLoading(false);
        return;
      }

      setInternalUserId(userRow.id);

      const { data: profileData } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("user_id", userRow.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-600 text-lg animate-pulse">
        Cargando información del paciente...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-blue-100 to-white overflow-x-hidden relative">

      {/* ✅ Fondo clínico suave */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>

      <LayoutContainer>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-100 p-6 sm:p-10 max-w-3xl mx-auto animate-fadeIn">

          {/* ✅ Header con icono */}
          <div className="flex flex-col items-center text-center mb-6">
            <UserCircle2 className="w-14 h-14 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">
              Bienvenido
            </h1>
            <p className="text-blue-900 break-all font-medium">
              {user?.email}
            </p>
          </div>

          {/* ✅ Datos personales */}
          {profile ? (
            <div className="bg-white/60 rounded-2xl p-4 shadow-inner border space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
              <p><strong className="text-blue-600">📅 Fecha de nacimiento:</strong> {profile.birth_date}</p>
              <p><strong className="text-blue-600">⚧ Género:</strong> {profile.gender}</p>
              <p><strong className="text-blue-600">🩺 Historial médico:</strong> {profile.medical_history}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-center text-sm sm:text-base mt-4">
              No se encontró información del paciente.
            </p>
          )}

          {/* ✅ Tabs modernos */}
          <div className="mt-8">
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {[
                { key: "general", label: "Salud general", icon: <HeartPulse /> },
                { key: "alimentacion", label: "Alimentación", icon: <Salad /> },
                { key: "sueno", label: "Sueño", icon: <Moon /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm sm:text-base transition-all shadow-sm ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ✅ Gráficos premium */}
            {loadingHealth ? (
              <div className="bg-white/60 rounded-2xl shadow-inner border p-6 text-center text-gray-500">
                Cargando datos...
              </div>
            ) : (
              <div className="w-full">
                {activeTab === "general" && <HealthCharts data={generalData} type="general" />}
                {activeTab === "alimentacion" && <HealthCharts data={alimentacionData} type="alimentacion" />}
                {activeTab === "sueno" && <HealthCharts data={suenoData} type="sueno" />}
              </div>
            )}
          </div>

          {/* ✅ Logout premium */}
          <div className="mt-10 text-center">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl shadow-md transition font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>

          {/* ✅ Footer */}
          <footer className="mt-10 text-center text-xs sm:text-sm text-gray-500">
            Seguimiento clínico automatizado por{" "}
            <span className="font-semibold text-blue-600">AIntegra Health</span>
          </footer>
        </div>
      </LayoutContainer>
    </div>
  );
}
