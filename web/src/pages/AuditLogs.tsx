import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { History, ChevronLeft, ChevronRight } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  create: "Creación",
  update: "Actualización",
  delete: "Eliminación",
};

const ENTITY_LABELS: Record<string, string> = {
  content: "Contenido",
  playlist: "Playlist",
  playlist_item: "Item de playlist",
};

export default function AuditLogs() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; totalPages: number } | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: "50" };
      if (filter) params.entityType = filter;
      const result = await api.auditLogs.list(params);
      setData(result);
      setError("");
    } catch (err: any) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
        <select className="input w-48" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
          <option value="">Todos los tipos</option>
          <option value="content">Contenido</option>
          <option value="playlist">Playlists</option>
          <option value="playlist_item">Items de playlist</option>
        </select>
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

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Entidad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((log: any) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      log.action === "create" ? "bg-green-50 text-green-700" :
                      log.action === "delete" ? "bg-red-50 text-red-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{ENTITY_LABELS[log.entityType] ?? log.entityType}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{log.entityId?.substring(0, 8)}...</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString("es")}</td>
                </tr>
              ))}
              {(!data || data.items.length === 0) && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-gray-500">Página {data.page} de {data.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary text-xs"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages} className="btn-secondary text-xs"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
