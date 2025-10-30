import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import logo from "../assets/logo.png"; // ✅ tu logo

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate("/profile");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 bg-gradient-to-b from-blue-100 to-white relative overflow-hidden">

      {/* Fondo clínico */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>

      {/* Tarjeta */}
      <div className="relative bg-white/80 backdrop-blur-xl w-full max-w-sm sm:max-w-md p-8 rounded-3xl shadow-2xl border border-blue-100 animate-fadeIn">

        {/* ✅ LOGO DE TU EMPRESA */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={logo}
            alt="AIntegra Health"
            className="w-20 h-20 object-contain mb-2 drop-shadow-md"
          />
          <h1 className="text-3xl sm:text-4xl font-black text-blue-700">
            AIntegra Health
          </h1>
          <p className="text-gray-500 text-sm">Acceso seguro a tu historial clínico</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-11 bg-gray-50 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-11 bg-gray-50 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-1 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold shadow-md transition transform ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? "Accediendo..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          © {new Date().getFullYear()} AIntegra Health • Centro Médico Privado
        </p>
      </div>
    </div>
  );
}
