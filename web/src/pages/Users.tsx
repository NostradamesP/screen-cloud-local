import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Shield, ShieldAlert, ShieldCheck, UserMinus } from "lucide-react";

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

  const load = async () => setMembers(await api.org.members());
  useEffect(() => { load(); }, []);

  const changeRole = async (id: string, role: string) => {
    await api.org.updateMemberRole(id, role);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuarios</h1>
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
