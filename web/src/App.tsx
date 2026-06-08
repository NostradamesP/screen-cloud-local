import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Content from "@/pages/Content";
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

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/content" element={<Content />} />
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
        </Route>
      </Routes>
    </AuthProvider>
  );
}
