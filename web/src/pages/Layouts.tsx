import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useConfirm } from "@/hooks/useConfirm";
import { Plus, Pencil, Trash2, Layout as LayoutIcon } from "lucide-react";

export default function Layouts() {
  const { confirm, dialog } = useConfirm();
  const [layouts, setLayouts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", resolution: "1920x1080", orientation: "landscape" });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [zoneForm, setZoneForm] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.layouts.list();
      setLayouts(data);
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
        await api.layouts.update(editing.id, form);
      } else {
        await api.layouts.create(form);
      }
      setShowForm(false);
      setEditing(null);
      load();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const handleEdit = (l: any) => {
    setForm({ name: l.name, resolution: l.resolution, orientation: l.orientation });
    setEditing(l);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar layout",
      message: "El layout y sus zonas serán eliminados. Las pantallas que dependan de él podrían quedar sin esa composición.",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      await api.layouts.delete(id);
      load();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const toggleExpand = async (id: string) => {
    try {
      if (!expanded[id]) {
        const data = await api.layouts.get(id);
        setLayouts((prev) => prev.map((l) => (l.id === id ? data : l)));
      }
      setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const openZoneForm = (layoutId: string, zone?: any) => {
    setZoneForm(zone ? { layoutId, ...zone } : { layoutId, name: "", type: "content", x: 0, y: 0, width: 100, height: 100, playlistId: "", contentItemId: "" });
  };

  const saveZone = async () => {
    if (!zoneForm) return;
    try {
      const payload = { ...zoneForm };
      delete payload.layoutId;
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;
      if (!payload.playlistId) payload.playlistId = undefined;
      if (!payload.contentItemId) payload.contentItemId = undefined;
      if (zoneForm.id) {
        await api.layouts.updateZone(zoneForm.layoutId, zoneForm.id, payload);
      } else {
        await api.layouts.createZone(zoneForm.layoutId, payload);
      }
      setZoneForm(null);
      toggleExpand(zoneForm.layoutId);
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  const deleteZone = async (layoutId: string, zoneId: string) => {
    const ok = await confirm({
      title: "Eliminar zona",
      message: "La zona se quitará del layout.",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      await api.layouts.deleteZone(layoutId, zoneId);
      toggleExpand(layoutId);
      setError("");
    } catch (err: any) {
      setError(err.message || "Error en la operación");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Layouts</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", resolution: "1920x1080", orientation: "landscape" }); }} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Nuevo layout
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Resolución</label>
                <select className="input" value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })}>
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                  <option value="3840x2160">3840x2160 (4K)</option>
                  <option value="1366x768">1366x768</option>
                </select>
              </div>
              <div>
                <label className="label">Orientación</label>
                <select className="input" value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value })}>
                  <option value="landscape">Horizontal</option>
                  <option value="portrait">Vertical</option>
                </select>
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

      <div className="space-y-3">
        {layouts.map((l) => (
          <div key={l.id} className="card">
            <div className="flex items-center justify-between">
              <button onClick={() => toggleExpand(l.id)} className="flex items-center gap-2 flex-1 text-left" aria-label="Expandir">
                <LayoutIcon className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-gray-900">{l.name}</span>
                <span className="text-xs text-gray-400">{l.resolution} | {l.orientation === "portrait" ? "Vertical" : "Horizontal"}</span>
                {l.zones && <span className="text-xs text-gray-400">({l.zones.length} zonas)</span>}
              </button>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(l)} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Editar"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(l.id)} className="p-1 text-gray-400 hover:text-red-600" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {expanded[l.id] && (
              <div className="mt-3 ml-6">
                <button onClick={() => openZoneForm(l.id)} className="btn-secondary text-xs mb-2"><Plus className="h-3 w-3 mr-1" />Añadir zona</button>
                {l.zones && l.zones.length > 0 && (
                  <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-2 mb-3" style={{ minHeight: 120 }}>
                    {l.zones.map((z: any) => (
                      <div key={z.id} className="absolute border-2 border-brand-400 bg-brand-50/50 rounded flex items-center justify-center overflow-hidden group" style={{ left: `${z.x}px`, top: `${z.y}px`, width: `${z.width}px`, height: `${z.height}px` }}>
                        <div className="text-center p-1">
                          <p className="text-xs font-medium text-brand-700 truncate">{z.name}</p>
                          <p className="text-[10px] text-gray-500">{z.type}</p>
                        </div>
                        <div className="absolute top-0 right-0 hidden group-hover:flex gap-0.5 bg-white/90 rounded-bl p-0.5">
                          <button onClick={(e) => { e.stopPropagation(); openZoneForm(l.id, z); }} className="p-0.5 text-gray-500 hover:text-gray-700" aria-label="Editar zona"><Pencil className="h-3 w-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteZone(l.id, z.id); }} className="p-0.5 text-gray-500 hover:text-red-600" aria-label="Eliminar zona"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {zoneForm && zoneForm.layoutId === l.id && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <h4 className="text-sm font-medium mb-2">{zoneForm.id ? "Editar zona" : "Nueva zona"}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <input className="input text-xs" placeholder="Nombre" value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} />
                      <input className="input text-xs" placeholder="Tipo" value={zoneForm.type} onChange={(e) => setZoneForm({ ...zoneForm, type: e.target.value })} />
                      <input className="input text-xs" type="number" placeholder="X" value={zoneForm.x} onChange={(e) => setZoneForm({ ...zoneForm, x: parseInt(e.target.value) || 0 })} />
                      <input className="input text-xs" type="number" placeholder="Y" value={zoneForm.y} onChange={(e) => setZoneForm({ ...zoneForm, y: parseInt(e.target.value) || 0 })} />
                      <input className="input text-xs" type="number" placeholder="Ancho" value={zoneForm.width} onChange={(e) => setZoneForm({ ...zoneForm, width: parseInt(e.target.value) || 100 })} />
                      <input className="input text-xs" type="number" placeholder="Alto" value={zoneForm.height} onChange={(e) => setZoneForm({ ...zoneForm, height: parseInt(e.target.value) || 100 })} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveZone} className="btn-primary text-xs">{zoneForm.id ? "Guardar" : "Crear"}</button>
                      <button onClick={() => setZoneForm(null)} className="btn-secondary text-xs">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {layouts.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay layouts aún.</p>
        )}
      </div>
      {dialog}
    </div>
  );
}
