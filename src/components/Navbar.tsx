import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/profile", label: "Perfil" },
  { to: "/calendar", label: "Calendario" },
  { to: "/forms", label: "Formularios" },
  { to: "/reports", label: "Informes" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md border-b border-blue-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <a href="/" className="text-blue-700 font-bold text-xl">
          🩺 AIntegra Health
        </a>

        {/* Botón menú móvil */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-blue-700 focus:outline-none"
        >
          ☰
        </button>

        {/* Links */}
        <div
          className={`${
            open ? "block" : "hidden"
          } absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none md:flex md:items-center transition-all`}
        >
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 p-4 md:p-0">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
