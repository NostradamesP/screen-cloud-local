import { NavLink } from "react-router-dom";
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Monitor,
  Image,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/screens", icon: Monitor, label: "Pantallas" },
  { to: "/content", icon: FolderKanban, label: "Contenido" },
  { to: "/media", icon: Image, label: "Biblioteca" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/60 bg-white/75 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <Monitor className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-base font-bold leading-tight text-gray-900">Signage</p>
            <p className="text-xs text-gray-500">Control de pantallas</p>
          </div>
        </div>

        <nav className="flex flex-1 items-center justify-center gap-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all sm:px-4",
                  isActive
                    ? "border-brand-200 bg-white/90 text-brand-700 shadow-sm"
                    : "border-white/60 bg-white/35 text-gray-600 hover:bg-white/70 hover:text-gray-900"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden min-w-0 text-right md:block">
            <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <button
            onClick={logout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/60 bg-white/35 text-gray-500 transition-colors hover:bg-white/80 hover:text-gray-900"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
