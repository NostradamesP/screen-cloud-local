import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle } from "lucide-react";

const SEVERITY_ICONS: Record<string, any> = {
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const SEVERITY_COLORS: Record<string, string> = {
  warning: "text-amber-600 bg-amber-50",
  error: "text-red-600 bg-red-50",
  info: "text-blue-600 bg-blue-50",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.notifications.list();
      setNotifications(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      load();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      load();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary">
            <CheckCheck className="h-4 w-4 mr-2" /> Marcar todas leídas
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-slide-down">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => {
          const Icon = SEVERITY_ICONS[n.severity] ?? Bell;
          const colorClass = SEVERITY_COLORS[n.severity] ?? "text-gray-600 bg-gray-50";
          return (
            <div key={n.id} className={`card flex items-start gap-3 ${!n.read ? "border-l-4 border-l-brand-500" : ""}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{n.title}</h3>
                    <p className="text-sm text-gray-500">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{new Date(n.createdAt).toLocaleString("es")}</span>
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="text-brand-600 hover:underline">Leído</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay notificaciones.</p>
        )}
      </div>
    </div>
  );
}
