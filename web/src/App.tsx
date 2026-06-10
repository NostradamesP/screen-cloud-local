import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Content from "@/pages/Content";
import ContentHub from "@/pages/ContentHub";
import MediaLibrary from "@/pages/MediaLibrary";
import Playlists from "@/pages/Playlists";
import Schedules from "@/pages/Schedules";
import Screens from "@/pages/Screens";
import ScreenGroups from "@/pages/ScreenGroups";
import Layouts from "@/pages/Layouts";
import Widgets from "@/pages/Widgets";
import AuditLogs from "@/pages/AuditLogs";
import Notifications from "@/pages/Notifications";
import Tags from "@/pages/Tags";
import Users from "@/pages/Users";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-black text-gray-200">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-800">Página no encontrada</h1>
      <p className="mt-2 text-sm text-gray-500">La ruta que buscas no existe o fue movida.</p>
      <Link to="/" className="btn-primary mt-6">Volver al Dashboard</Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/content" element={<ContentHub />} />
          <Route path="/content/library" element={<Content />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/screens" element={<Screens />} />
          <Route path="/screen-groups" element={<ScreenGroups />} />
          <Route path="/layouts" element={<Layouts />} />
          <Route path="/widgets" element={<Widgets />} />
          <Route path="/audit" element={<AuditLogs />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/users" element={<Users />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
