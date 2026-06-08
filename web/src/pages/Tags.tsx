import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Hash } from "lucide-react";

const COLORS = ["#6366f1", "#ef4444", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#a855f7"];

export default function Tags() {
  const [tags, setTags] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", color: "#6366f1" });

  const load = async () => setTags(await api.tags.list());
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.tags.update(editing.id, form);
    else await api.tags.create(form);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar etiqueta?")) return;
    await api.tags.delete(id); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Etiquetas</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", color: "#6366f1" }); }} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Nueva
        </button>
      </div>
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="label">Nombre</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Color</label>
                <div className="flex gap-1">
                  {COLORS.map(c => <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`w-8 h-8 rounded-full border-2 ${form.color === c ? "border-gray-900" : "border-transparent"}`} style={{ backgroundColor: c }} />)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editing ? "Guardar" : "Crear"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {tags.map(t => (
          <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white" style={{ backgroundColor: t.color }}>
            <Hash className="h-3 w-3" />
            <span>{t.name}</span>
            <button onClick={() => { setForm({ name: t.name, color: t.color }); setEditing(t); setShowForm(true); }} className="p-0.5 hover:opacity-80"><Pencil className="h-3 w-3" /></button>
            <button onClick={() => handleDelete(t.id)} className="p-0.5 hover:opacity-80"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}
        {tags.length === 0 && <p className="text-gray-500">No hay etiquetas.</p>}
      </div>
    </div>
  );
}
