import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2 } from "lucide-react";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function Schedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({
    playlistId: "",
    screenId: "",
    groupId: "",
    name: "",
    startDate: "",
    endDate: "",
    timeStart: "",
    timeEnd: "",
    daysOfWeek: [] as number[],
    priority: 0,
  });

  const load = async () => {
    const [s, p, sc, g] = await Promise.all([
      api.schedules.list(),
      api.playlists.list(),
      api.screens.list(),
      api.screenGroups.list().catch(() => []),
    ]);
    setSchedules(s);
    setPlaylists(p);
    setScreens(sc);
    setGroups(g);
  };

  useEffect(() => { load(); }, []);

  const toggleDay = (day: number) => {
    setForm((f: any) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter((d: number) => d !== day)
        : [...f.daysOfWeek, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...form,
      priority: parseInt(form.priority) || 0,
      screenId: form.screenId || undefined,
      groupId: form.groupId || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      timeStart: form.timeStart || undefined,
      timeEnd: form.timeEnd || undefined,
    };
    if (editing) {
      await api.schedules.update(editing.id, payload);
    } else {
      await api.schedules.create(payload);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleEdit = (s: any) => {
    setForm({
      playlistId: s.playlistId,
      screenId: s.screenId ?? "",
      groupId: s.groupId ?? "",
      name: s.name,
      startDate: s.startDate ?? "",
      endDate: s.endDate ?? "",
      timeStart: s.timeStart ?? "",
      timeEnd: s.timeEnd ?? "",
      daysOfWeek: s.daysOfWeek ?? [],
      priority: s.priority ?? 0,
    });
    setEditing(s);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta programación?")) return;
    await api.schedules.delete(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Programación</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ playlistId: "", screenId: "", groupId: "", name: "", startDate: "", endDate: "", timeStart: "", timeEnd: "", daysOfWeek: [], priority: 0 }); }} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Nueva
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Playlist</label>
                <select className="input" value={form.playlistId} onChange={(e) => setForm({ ...form, playlistId: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {playlists.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Prioridad</label>
                <input type="number" min="0" className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">A mayor número, mayor prioridad</p>
              </div>
              <div>
                <label className="label">Días de la semana</label>
                <div className="flex gap-1 flex-wrap">
                  {DAYS.map((day, i) => (
                    <button type="button" key={i} onClick={() => toggleDay(i)}
                      className={`px-2 py-1 text-xs rounded border ${form.daysOfWeek.includes(i) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-300"}`}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Asignar a</label>
                <select className="input" value={form.screenId || form.groupId ? (form.screenId ? `screen:${form.screenId}` : `group:${form.groupId}`) : ""} onChange={(e) => {
                  const val = e.target.value;
                  if (!val) { setForm({ ...form, screenId: "", groupId: "" }); }
                  else if (val.startsWith("screen:")) { setForm({ ...form, screenId: val.replace("screen:", ""), groupId: "" }); }
                  else if (val.startsWith("group:")) { setForm({ ...form, screenId: "", groupId: val.replace("group:", "") }); }
                }}>
                  <option value="">Todas las pantallas</option>
                  <optgroup label="Pantallas">
                    {screens.map((s) => <option key={`screen:${s.id}`} value={`screen:${s.id}`}>{s.name}</option>)}
                  </optgroup>
                  <optgroup label="Grupos">
                    {groups.map((g) => <option key={`group:${g.id}`} value={`group:${g.id}`}>{g.name}</option>)}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="label">Fecha inicio</label>
                <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Fecha fin</label>
                <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Hora inicio</label>
                <input type="time" className="input" value={form.timeStart} onChange={(e) => setForm({ ...form, timeStart: e.target.value })} />
              </div>
              <div>
                <label className="label">Hora fin</label>
                <input type="time" className="input" value={form.timeEnd} onChange={(e) => setForm({ ...form, timeEnd: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editing ? "Guardar" : "Crear"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {schedules.map((s) => {
          const targetScreen = s.screenId ? screens.find((sc) => sc.id === s.screenId) : null;
          const targetGroup = s.groupId ? groups.find((g) => g.id === s.groupId) : null;
          return (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{s.name}</h3>
                  <div className="flex gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                    {s.screenId && targetScreen && <span className="font-medium text-brand-600">{targetScreen.name}</span>}
                    {s.groupId && targetGroup && <span className="font-medium text-purple-600">Grupo: {targetGroup.name}</span>}
                    {!s.screenId && !s.groupId && <span className="text-gray-400">Todas las pantallas</span>}
                    {s.daysOfWeek && <span>{s.daysOfWeek.map((d: number) => DAYS[d]).join(", ")}</span>}
                    {s.timeStart && <span>{s.timeStart} - {s.timeEnd}</span>}
                    {s.startDate && <span>Desde {s.startDate}</span>}
                    {s.endDate && <span>Hasta {s.endDate}</span>}
                    {s.priority > 0 && <span className="text-amber-600">Prioridad: {s.priority}</span>}
                    {!s.active && <span className="text-red-500">Inactivo</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(s)} className="p-1 text-gray-400 hover:text-gray-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {schedules.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay programaciones aún.</p>
        )}
      </div>
    </div>
  );
}