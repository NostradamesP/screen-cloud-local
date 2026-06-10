import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useConfirm } from "@/hooks/useConfirm";
import { Plus, Pencil, Trash2, Puzzle } from "lucide-react";

export default function Widgets() {
  const { confirm, dialog } = useConfirm();
  const [widgets, setWidgets] = useState<any[]>([]);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ widgetDefinitionId: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [w, d] = await Promise.all([
        api.widgets.list(),
        api.widgets.definitions().catch(() => []),
      ]);
      setWidgets(w);
      setDefinitions(d);
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
        await api.widgets.update(editing.id, form);
      } else {
        await api.widgets.create(form);
      }
      setShowForm(false);
      setEditing(null);
      load();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const handleEdit = (w: any) => {
    setForm({ widgetDefinitionId: w.widgetDefinitionId, name: w.name });
    setEditing(w);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar widget",
      message: "El widget se eliminará y dejará de estar disponible para layouts o pantallas que lo usen.",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      await api.widgets.delete(id);
      load();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const defName = (id: string) => definitions.find((d) => d.id === id)?.name ?? id;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Widgets</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ widgetDefinitionId: "", name: "" }); }} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Nuevo widget
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo de widget</label>
                <select className="input" value={form.widgetDefinitionId} onChange={(e) => setForm({ ...form, widgetDefinitionId: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {definitions.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.type})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
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
        {widgets.map((w) => (
          <div key={w.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <Puzzle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{w.name}</h3>
                  <p className="text-xs text-gray-500">{defName(w.widgetDefinitionId)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(w)} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Editar"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(w.id)} className="p-1 text-gray-400 hover:text-red-600" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {widgets.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No hay widgets aún.</p>
        )}
      </div>
      {dialog}
    </div>
  );
}
