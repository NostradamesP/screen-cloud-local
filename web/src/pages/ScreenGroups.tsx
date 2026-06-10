import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useConfirm } from "@/hooks/useConfirm";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";

export default function ScreenGroups() {
  const { confirm, dialog } = useConfirm();
  const [groups, setGroups] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", screenIds: [] as string[] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [g, s] = await Promise.all([
        api.screenGroups.list(),
        api.screens.list(),
      ]);
      setGroups(g);
      setScreens(s);
      setError("");
    } catch (err: any) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.screenGroups.update(editing.id, form);
      } else {
        await api.screenGroups.create(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", screenIds: [] });
      load();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const handleEdit = (g: any) => {
    setForm({ name: g.name, screenIds: g.screenIds ?? [] });
    setEditing(g);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar grupo",
      message: "El grupo se eliminará y sus pantallas dejarán de recibir programaciones asociadas a ese grupo.",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      await api.screenGroups.delete(id);
      load();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const toggleScreen = (screenId: string) => {
    setForm((f) => ({
      ...f,
      screenIds: f.screenIds.includes(screenId)
        ? f.screenIds.filter((id) => id !== screenId)
        : [...f.screenIds, screenId],
    }));
  };

  const openForm = () => {
    setShowForm(true);
    setEditing(null);
    setForm({ name: "", screenIds: [] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grupos de Pantallas</h1>
        <button onClick={openForm} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Nuevo grupo
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-slide-down">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre del grupo</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Pantallas en este grupo</label>
              {screens.length === 0 ? (
                <p className="text-sm text-gray-400">No hay pantallas disponibles.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {screens.map((s) => (
                    <label key={s.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${form.screenIds.includes(s.id) ? "bg-brand-50 border border-brand-200" : "hover:bg-gray-50 border border-transparent"}`}>
                      <input type="checkbox" checked={form.screenIds.includes(s.id)} onChange={() => toggleScreen(s.id)} className="rounded" />
                      <span className="truncate">{s.name}</span>
                      {s.location && <span className="text-xs text-gray-400 truncate">({s.location})</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editing ? "Guardar" : "Crear"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <div key={g.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{g.name}</h3>
                  <p className="text-xs text-gray-500">{g.screenCount} pantalla(s)</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(g)} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(g.id)} className="p-1 text-gray-400 hover:text-red-600" aria-label="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {g.screenIds && g.screenIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {g.screenIds.map((sid: string) => {
                  const screen = screens.find((s) => s.id === sid);
                  return screen ? (
                    <span key={sid} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {screen.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
        {groups.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No hay grupos aún. Crea tu primer grupo.</p>
        )}
      </div>
      {dialog}
    </div>
  );
}
