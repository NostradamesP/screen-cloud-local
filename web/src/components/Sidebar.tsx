import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Image,
  ListVideo,
  Calendar as CalendarIcon,
  Monitor,
  Layers,
  Layout as LayoutIcon,
  Puzzle,
  Bell,
  History,
  Hash,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/content", icon: Image, label: "Contenido" },
  { to: "/playlists", icon: ListVideo, label: "Playlists" },
  { to: "/schedules", icon: CalendarIcon, label: "Programación" },
  { to: "/screens", icon: Monitor, label: "Pantallas" },
  { to: "/screen-groups", icon: Layers, label: "Grupos" },
  { to: "/layouts", icon: LayoutIcon, label: "Layouts" },
  { to: "/widgets", icon: Puzzle, label: "Widgets" },
  { to: "/notifications", icon: Bell, label: "Alertas" },
  { to: "/audit", icon: History, label: "Auditoría" },
  { to: "/calendar", icon: CalendarIcon, label: "Calendario" },
  { to: "/tags", icon: Hash, label: "Etiquetas" },
  { to: "/users", icon: UsersIcon, label: "Usuarios" },
  { to: "/settings", icon: SettingsIcon, label: "Configuración" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="fixed inset-y-0 left-0 z-30 flex w-[--sidebar-width] flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
        <Monitor className="h-6 w-6 text-brand-600" />
        <span className="text-lg font-bold text-gray-900">Signage</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
