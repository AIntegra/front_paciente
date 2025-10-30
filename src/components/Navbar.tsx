import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Home, User, CalendarDays, ClipboardList, FileText } from "lucide-react";

const links = [
  { to: "/profile", label: "Perfil", icon: <User size={18} /> },
  { to: "/calendar", label: "Calendario", icon: <CalendarDays size={18} /> },
  { to: "/forms", label: "Formularios", icon: <ClipboardList size={18} /> },
  { to: "/reports", label: "Informes", icon: <FileText size={18} /> },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/70 backdrop-blur-xl shadow-md border-b border-blue-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6">

        {/* Logo Premium */}
        <a
          href="/"
          className="text-blue-700 font-black text-xl flex items-center gap-2 hover:opacity-90 transition"
        >
          <Home className="text-blue-600" /> 
          <span className="hidden sm:inline">AIntegra Health</span>
        </a>

        {/* Botón menú móvil */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-blue-700 transition hover:scale-105"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Links Escritorio */}
        <div className="hidden md:flex items-center gap-2">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-blue-100"
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Menú móvil premium con animación suave */}
      <div
        className={`md:hidden bg-white/90 backdrop-blur-xl border-t border-blue-100 shadow-lg transition-all overflow-hidden ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-2 p-4">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-blue-100"
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
