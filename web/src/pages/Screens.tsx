import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Monitor, Wifi, WifiOff, Settings as SettingsIcon } from "lucide-react";
import QRCode from "qrcode";

export default function Screens() {
  const [screens, setScreens] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", location: "", resolution: "1920x1080", orientation: "landscape" as const, idleContentId: "" });
  const [pairCode, setPairCode] = useState<{ screenId: string; pairCode: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState<any>(null);
  const [configForm, setConfigForm] = useState({ brightness: 100, volume: 50, rebootTime: "", timezone: "" });

  const load = async () => {
    const [data, content] = await Promise.all([
      api.screens.list().catch(() => []),
      api.content.list().catch(() => []),
    ]);
    setScreens(data);
    setContentItems(content);
  };

  useEffect(() => { load(); }, []);

  const isOnline = (screen: any) => {
    if (!screen.lastHeartbeat) return false;
    const diff = Date.now() - new Date(screen.lastHeartbeat).getTime();
    return diff < 60000;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (!payload.idleContentId) payload.idleContentId = undefined;
    if (editing) {
      await api.screens.update(editing.id, payload);
    } else {
      await api.screens.create(payload);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleEdit = (s: any) => {
    setForm({ name: s.name, location: s.location ?? "", resolution: s.resolution, orientation: s.orientation, idleContentId: s.idleContentId ?? "" });
    setEditing(s);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta pantalla?")) return;
    await api.screens.delete(id);
    load();
  };

  const openConfig = (s: any) => {
    const settings = s.settings || {};
    setConfigForm({ brightness: settings.brightness ?? 100, volume: settings.volume ?? 50, rebootTime: settings.rebootTime ?? "", timezone: settings.timezone ?? "" });
    setConfiguring(s);
  };

  const saveConfig = async () => {
    if (!configuring) return;
    await api.screens.update(configuring.id, { settings: configForm });
    setConfiguring(null);
    load();
  };

  const generatePairCode = async () => {
    const res = await api.screens.getPairCode();
    setPairCode(res);
    try {
      const pairingUrl = `${window.location.origin}/player?pair=${res.pairCode}`;
      const dataUrl = await QRCode.toDataURL(pairingUrl, { width: 200, margin: 2 });
      setQrDataUrl(dataUrl);
    } catch { setQrDataUrl(null); }
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pantallas</h1>
        <div className="flex gap-2">
          <button onClick={generatePairCode} className="btn-secondary">
            Generar código de vinculación
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", location: "", resolution: "1920x1080", orientation: "landscape", idleContentId: "" }); }} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Nueva
          </button>
        </div>
      </div>

      {pairCode && (
        <div className="card mb-6 bg-brand-50 border-brand-200">
          <h3 className="font-medium text-brand-800 mb-2">Código de vinculación</h3>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold text-brand-600 tracking-widest">{pairCode.pairCode}</p>
              <p className="text-sm text-brand-600 mt-1">
                Abre el reproductor en la pantalla e ingresa este código.
              </p>
            </div>
            {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-24 h-24 bg-white p-1 rounded" />}
          </div>
          <button onClick={() => { setPairCode(null); setQrDataUrl(null); }} className="btn-secondary mt-3">Cerrar</button>
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Ubicación</label>
                <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
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
                <select className="input" value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value as any })}>
                  <option value="landscape">Horizontal</option>
                  <option value="portrait">Vertical</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Contenido idle (cuando no hay schedule activo)</label>
                <select className="input" value={form.idleContentId} onChange={(e) => setForm({ ...form, idleContentId: e.target.value })}>
                  <option value="">Ninguno (pantalla negra)</option>
                  {contentItems.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
                  ))}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screens.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isOnline(s) ? "bg-green-50" : "bg-gray-100"}`}>
                  <Monitor className={`h-5 w-5 ${isOnline(s) ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{s.name}</h3>
                  {s.location && <p className="text-xs text-gray-500">{s.location}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openConfig(s)} className="p-1 text-gray-400 hover:text-gray-600" title="Configurar">
                  <SettingsIcon className="h-4 w-4" />
                </button>
                <button onClick={() => handleEdit(s)} className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {isOnline(s) ? (
                <span className="flex items-center gap-1 text-green-600"><Wifi className="h-3 w-3" /> Online</span>
              ) : (
                <span className="flex items-center gap-1 text-gray-400"><WifiOff className="h-3 w-3" /> Offline</span>
              )}
              <span>{s.resolution}</span>
              <span>{s.orientation === "portrait" ? "Vertical" : "Horizontal"}</span>
            </div>
            {s.lastHeartbeat && (
              <p className="text-xs text-gray-400 mt-2">
                Último heartbeat: {new Date(s.lastHeartbeat).toLocaleString("es")}
              </p>
            )}
            {s.idleContentId && (
              <p className="text-xs text-amber-600 mt-1">
                Idle: {contentItems.find((c: any) => c.id === s.idleContentId)?.title ?? "Configurado"}
              </p>
            )}
          </div>
        ))}
        {screens.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No hay pantallas registradas.</p>
        )}
      </div>

      {configuring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfiguring(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Configurar: {configuring.name}</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Brillo (%)</label>
                <input type="range" min="0" max="100" className="w-full" value={configForm.brightness} onChange={(e) => setConfigForm({ ...configForm, brightness: parseInt(e.target.value) })} />
                <span className="text-xs text-gray-500">{configForm.brightness}%</span>
              </div>
              <div>
                <label className="label">Volumen (%)</label>
                <input type="range" min="0" max="100" className="w-full" value={configForm.volume} onChange={(e) => setConfigForm({ ...configForm, volume: parseInt(e.target.value) })} />
                <span className="text-xs text-gray-500">{configForm.volume}%</span>
              </div>
              <div>
                <label className="label">Reinicio automático</label>
                <input type="time" className="input" value={configForm.rebootTime} onChange={(e) => setConfigForm({ ...configForm, rebootTime: e.target.value })} />
              </div>
              <div>
                <label className="label">Zona horaria</label>
                <input className="input" value={configForm.timezone} onChange={(e) => setConfigForm({ ...configForm, timezone: e.target.value })} placeholder="America/Argentina/Buenos_Aires" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={saveConfig} className="btn-primary">Guardar</button>
                <button onClick={() => setConfiguring(null)} className="btn-secondary">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
