import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Monitor, Wifi, WifiOff, RefreshCw, FileVideo, FileImage, Globe, Rss, Code, Check, Building2, CalendarDays, Info, UtensilsCrossed, DoorOpen, Presentation, Gauge } from "lucide-react";
import QRCode from "qrcode";

const CONTENT_ICONS: Record<string, any> = {
  video: FileVideo,
  image: FileImage,
  webpage: Globe,
  dashboard: Globe,
  rss: Rss,
  html: Code,
};

const CONTENT_LABELS: Record<string, string> = {
  video: "Video",
  image: "Imagen",
  webpage: "Página Web",
  dashboard: "Dashboard",
  rss: "Feed RSS",
  html: "HTML",
};

const PURPOSE_ICONS: Record<string, any> = {
  office: Building2,
  events: CalendarDays,
  public_info: Info,
  menu_board: UtensilsCrossed,
  lobby: DoorOpen,
  meeting_room: Presentation,
  production: Gauge,
  other: Monitor,
};

const PURPOSE_LABELS: Record<string, string> = {
  office: "Oficina",
  events: "Eventos",
  public_info: "Información Pública",
  menu_board: "Menú Digital",
  lobby: "Lobby / Recepción",
  meeting_room: "Sala de Reuniones",
  production: "Producción / KPIs",
  other: "Otro",
};

export default function Screens() {
  const [screens, setScreens] = useState<any[]>([]);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", location: "", resolution: "1920x1080", orientation: "landscape" as const, purpose: "other" as string });
  const [pairCode, setPairCode] = useState<{ screenId: string; pairCode: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [pickingContent, setPickingContent] = useState<any>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [clearMsg, setClearMsg] = useState<string | null>(null);

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
    setForm({ name: s.name, location: s.location ?? "", resolution: s.resolution, orientation: s.orientation, purpose: s.purpose ?? "other" });
    setEditing(s);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await api.screens.delete(id).catch(() => {});
    load();
  };

  const assignContent = async (screenId: string, contentId: string | null) => {
    await api.screens.update(screenId, { idleContentId: contentId || undefined });
    setPickingContent(null);
    load();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      await api.player.sync();
      setSyncMsg("Sincronizado");
    } catch {
      setSyncMsg("Error");
    }
    setSyncing(false);
    setTimeout(() => setSyncMsg(null), 3000);
  };

  const handleClearCache = async () => {
    setClearing(true);
    setClearMsg(null);
    try {
      await api.player.clearCache();
      setClearMsg("Caché limpiado");
    } catch {
      setClearMsg("Error");
    }
    setClearing(false);
    setTimeout(() => setClearMsg(null), 3000);
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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pantallas</h1>
        <div className="flex gap-2">
          <button onClick={generatePairCode} className="btn-secondary transition-all hover:scale-105">
            Generar código de vinculación
          </button>
          <button onClick={handleSync} disabled={syncing} className="btn-secondary transition-all hover:scale-105">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : syncMsg || "Sincronizar"}
          </button>
          <button onClick={handleClearCache} disabled={clearing} className="btn-secondary transition-all hover:scale-105 text-red-600 border-red-200 hover:border-red-300">
            <Trash2 className="h-4 w-4 mr-2" />
            {clearing ? "Limpiando..." : clearMsg || "Limpiar Caché"}
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", location: "", resolution: "1920x1080", orientation: "landscape", purpose: "other" }); }} className="btn-primary transition-all hover:scale-105">
            <Plus className="h-4 w-4 mr-2" /> Nueva
          </button>
        </div>
      </div>

      {pairCode && (
        <div className="card mb-6 bg-brand-50 border-brand-200 animate-slide-down">
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
          <button onClick={() => { setPairCode(null); setQrDataUrl(null); }} className="btn-secondary mt-3 transition-all hover:scale-105">Cerrar</button>
        </div>
      )}

      {showForm && (
        <div className="card mb-6 animate-slide-down">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input transition-shadow focus:ring-2 focus:ring-brand-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Ubicación</label>
                <input className="input transition-shadow focus:ring-2 focus:ring-brand-500" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label className="label">Resolución</label>
                <select className="input transition-shadow focus:ring-2 focus:ring-brand-500" value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })}>
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                  <option value="3840x2160">3840x2160 (4K)</option>
                  <option value="1366x768">1366x768</option>
                </select>
              </div>
              <div>
                <label className="label">Orientación</label>
                <select className="input transition-shadow focus:ring-2 focus:ring-brand-500" value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value as any })}>
                  <option value="landscape">Horizontal</option>
                  <option value="portrait">Vertical</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label mb-2">Propósito</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(PURPOSE_ICONS).map(([key, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, purpose: key })}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-all ${
                        form.purpose === key
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${form.purpose === key ? "text-brand-600" : "text-gray-400"}`} />
                      <span className="text-xs font-medium">{PURPOSE_LABELS[key]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary transition-all hover:scale-105">{editing ? "Guardar" : "Crear"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screens.map((s) => {
          const assigned = contentItems.find((c: any) => c.id === s.idleContentId);
          const TypeIcon = assigned ? (CONTENT_ICONS[assigned.type] || Monitor) : null;
          return (
            <div key={s.id} className="card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${isOnline(s) ? "bg-green-50" : "bg-gray-100"}`}>
                    <Monitor className={`h-5 w-5 transition-colors ${isOnline(s) ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{s.name}</h3>
                    {s.location && <p className="text-xs text-gray-500">{s.location}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(s)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                {isOnline(s) ? (
                  <span className="flex items-center gap-1 text-green-600"><Wifi className="h-3 w-3" /> Online</span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400"><WifiOff className="h-3 w-3" /> Offline</span>
                )}
                <span>{s.resolution}</span>
                <span>{s.orientation === "portrait" ? "Vertical" : "Horizontal"}</span>
                <span className="flex items-center gap-1 text-gray-400">
                  {React.createElement(PURPOSE_ICONS[s.purpose] || Monitor, { className: "h-3 w-3" })}
                  {PURPOSE_LABELS[s.purpose] || s.purpose}
                </span>
              </div>

              <button
                onClick={() => setPickingContent(s)}
                className="w-full text-left rounded-lg border border-dashed border-gray-300 p-3 transition-all duration-200 hover:border-brand-400 hover:bg-brand-50/50 group"
              >
                {assigned ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                      {TypeIcon && <TypeIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{assigned.title}</p>
                      <p className="text-xs text-amber-600">{CONTENT_LABELS[assigned.type] || assigned.type} • Idle</p>
                    </div>
                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Cambiar</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-gray-400 group-hover:bg-gray-100 transition-colors">
                      <Monitor className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Asignar contenido</p>
                  </div>
                )}
              </button>

              {s.lastHeartbeat && (
                <p className="text-xs text-gray-400 mt-2">
                  Último heartbeat: {new Date(s.lastHeartbeat).toLocaleString("es")}
                </p>
              )}
            </div>
          );
        })}
        {screens.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">No hay pantallas registradas.</p>
        )}
      </div>

      {pickingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in" onClick={() => setPickingContent(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full m-4 max-h-[80vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Contenido para {pickingContent.name}</h2>
              <button onClick={() => setPickingContent(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              <button
                onClick={() => assignContent(pickingContent.id, null)}
                className="w-full text-left rounded-lg border border-dashed border-gray-300 p-3 transition-all hover:border-gray-400 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-gray-400">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-gray-500">Ninguno (pantalla negra)</p>
                </div>
              </button>
              {contentItems.map((c: any) => {
                const Icon = CONTENT_ICONS[c.type] || Monitor;
                const isSelected = c.id === pickingContent.idleContentId;
                return (
                  <button
                    key={c.id}
                    onClick={() => assignContent(pickingContent.id, c.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-all hover:border-brand-400 hover:bg-brand-50/50 ${isSelected ? "border-brand-500 bg-brand-50" : "border-gray-200"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${isSelected ? "bg-brand-100 text-brand-600" : "bg-gray-50 text-gray-500"} transition-colors`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                        <p className="text-xs text-gray-500">{CONTENT_LABELS[c.type] || c.type}</p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-brand-600" />}
                    </div>
                  </button>
                );
              })}
              {contentItems.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No hay contenido disponible. Creá contenido primero.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
