import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { HealthCharts } from "../components/HealthCharts";
import { useHealthData } from "../hooks/useHealthData";
import LayoutContainer from "../components/LayoutContainer";

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

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (userError || !userRow) {
        console.error("❌ No se encontró usuario en 'users':", userError);
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
      <div className="flex justify-center items-center h-[70vh] text-gray-600 animate-fadeIn">
        Cargando datos del paciente...
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-blue-50 to-white py-6 animate-fadeIn">
      <LayoutContainer>
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-2xl md:max-w-3xl mx-auto transition-all duration-300 hover:shadow-xl border border-blue-100">
          {/* 🧑‍⚕️ Header */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 mb-6 text-center break-words">
            Bienvenido,{" "}
            <span className="text-blue-800">{user?.email}</span>
          </h1>

          {/* 🩺 Datos personales */}
          {profile ? (
            <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
              <p>
                <strong className="text-blue-600">📅 Fecha de nacimiento:</strong>{" "}
                {profile.birth_date}
              </p>
              <p>
                <strong className="text-blue-600">⚧ Género:</strong>{" "}
                {profile.gender}
              </p>
              <p>
                <strong className="text-blue-600">🩺 Historial médico:</strong>{" "}
                {profile.medical_history}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-center text-sm sm:text-base mt-4">
              No se encontró información del paciente.
            </p>
          )}

          {/* === Tabs === */}
          <div className="mt-8 sm:mt-10">
            <div className="flex flex-wrap justify-center mb-5 gap-2 sm:gap-3">
              {[
                { key: "general", label: "Salud general" },
                { key: "alimentacion", label: "Alimentación" },
                { key: "sueno", label: "Sueño" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loadingHealth ? (
              <div className="bg-gray-50 rounded-2xl shadow-inner p-6 text-center text-gray-500">
                Cargando datos de salud...
              </div>
            ) : (
              <>
                {activeTab === "general" && (
                  <HealthCharts data={generalData} type="general" />
                )}
                {activeTab === "alimentacion" && (
                  <HealthCharts data={alimentacionData} type="alimentacion" />
                )}
                {activeTab === "sueno" && (
                  <HealthCharts data={suenoData} type="sueno" />
                )}
              </>
            )}
          </div>

          {/* 🔘 Logout */}
          <div className="mt-8 sm:mt-10 text-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl shadow-sm transition w-full sm:w-auto"
            >
              Cerrar sesión
            </button>
          </div>

          {/* 📄 Footer */}
          <footer className="mt-10 text-center text-xs sm:text-sm text-gray-400">
            Seguimiento clínico automatizado por{" "}
            <span className="font-semibold text-blue-600">AIntegra Health</span>
          </footer>
        </div>
      </LayoutContainer>
    </div>
  );
}

