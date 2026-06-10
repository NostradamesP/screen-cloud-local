import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

const ROLE_BADGES: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700",
  editor: "bg-blue-50 text-blue-700",
  viewer: "bg-gray-50 text-gray-700",
};

const ROLE_ICONS: Record<string, any> = {
  admin: ShieldAlert,
  editor: ShieldCheck,
  viewer: Shield,
};

export default function Users() {
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setMembers(await api.org.members());
      setError("");
    } catch (err: any) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const changeRole = async (id: string, role: string) => {
    try {
      await api.org.updateMemberRole(id, role);
      load();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuarios</h1>

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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m: any) => {
              const Icon = ROLE_ICONS[m.role] ?? Shield;
              return (
                <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.email}</td>
                  <td className="px-4 py-3">
                    <select className={`input text-xs inline-flex w-auto ${ROLE_BADGES[m.role]}`} value={m.role} onChange={(e) => changeRole(m.id, e.target.value)}>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {members.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Sin miembros</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
