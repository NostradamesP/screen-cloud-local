import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useConfirm } from "@/hooks/useConfirm";
import { Plus, Pencil, Trash2, Upload, FileVideo, FileImage, Send, Eye, Globe, Rss, Code, LayoutDashboard, ImageOff } from "lucide-react";

const CONTENT_TYPES: Record<string, string> = {
  webpage: "Página Web",
  image: "Imagen",
  video: "Video",
  dashboard: "Dashboard",
  rss: "Feed RSS",
  html: "HTML Custom",
};

const FILE_TYPES = ["image", "video"];
const MAX_FILE_SIZE = 500 * 1024 * 1024;

function contentSource(item: any) {
  return item.filePath || item.url || "";
}

function ContentPreview({ item, compact = false }: { item: any; compact?: boolean }) {
  const source = contentSource(item);
  const previewClass = compact ? "h-24" : "aspect-video";
  const iconClass = compact ? "h-6 w-6" : "h-9 w-9";
  const iconWrap = compact ? "h-11 w-11" : "h-16 w-16";
  const label = CONTENT_TYPES[item.type] ?? item.type;

  if (item.type === "image" && source) {
    return (
      <div className={`${previewClass} relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100`}>
        <img src={source} alt={item.title} className="h-full w-full object-contain" loading="lazy" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2">
          <span className="rounded bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-gray-700 backdrop-blur">{label}</span>
        </div>
      </div>
    );
  }

  if (item.type === "video" && source) {
    return (
      <div className={`${previewClass} relative overflow-hidden rounded-lg border border-gray-200 bg-black`}>
        <video src={source} className="h-full w-full object-contain" muted preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm">
            <FileVideo className="h-5 w-5" />
          </span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <span className="rounded bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-gray-700 backdrop-blur">Video</span>
        </div>
      </div>
    );
  }

  const iconMap: Record<string, any> = {
    webpage: Globe,
    dashboard: LayoutDashboard,
    rss: Rss,
    html: Code,
  };
  const Icon = iconMap[item.type] || ImageOff;
  const host = source
    ? (() => {
        try {
          return new URL(source).hostname.replace(/^www\./, "");
        } catch {
          return source;
        }
      })()
    : "Sin URL";

  return (
    <div className={`${previewClass} relative overflow-hidden rounded-lg border border-gray-200 bg-[radial-gradient(circle_at_20%_10%,#ffffff,transparent_34%),linear-gradient(135deg,#f8fafc,#e2e8f0)]`}>
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className={`flex ${compact ? "items-center gap-3" : "items-start justify-between gap-4"}`}>
          <div className={`flex ${iconWrap} shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm`}>
            <Icon className={iconClass} />
          </div>
          {!compact && <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-sm">{label}</span>}
        </div>
        <div className="min-w-0">
          <p className={`${compact ? "text-sm" : "text-lg"} truncate font-bold text-gray-900`}>{item.title || label}</p>
          <p className="mt-1 truncate text-xs font-medium text-gray-500">{host}</p>
        </div>
      </div>
    </div>
  );
}

export default function Content() {
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ type: "webpage", title: "", url: "", duration: 10, expiresAt: "", filePath: "", mimeType: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [contentTags, setContentTags] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");

  const load = async () => {
    const [data, media, tagList] = await Promise.all([
      api.content.list().catch(() => []),
      api.media.list().catch(() => []),
      api.tags.list().catch(() => []),
    ]);
    setItems(data);
    setMediaItems(media);
    setTags(tagList);
    const ctags: Record<string, string[]> = {};
    if (data.length > 0) {
      try {
        const batch = await api.tags.getContentTagsBatch(data.map((d: any) => d.id));
        Object.assign(ctags, batch);
      } catch {
        for (const item of data) ctags[item.id] = [];
      }
    }
    setContentTags(ctags);
  };

  useEffect(() => { load(); }, []);

  const publish = async (id: string, status: string) => {
    await api.org.setContentStatus(id, status);
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      type: form.type,
      title: form.title,
      duration: form.duration,
    };
    if (FILE_TYPES.includes(form.type) && form.filePath) {
      payload.filePath = form.filePath;
      payload.mimeType = form.mimeType;
      payload.url = undefined;
    } else {
      payload.url = form.url;
    }
    if (form.expiresAt) payload.expiresAt = form.expiresAt;
    if (editing) {
      await api.content.update(editing.id, payload);
    } else {
      await api.content.create(payload);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ type: "webpage", title: "", url: "", duration: 10, expiresAt: "", filePath: "", mimeType: "" });
    load();
  };

  const handleEdit = (item: any) => {
    setForm({
      type: item.type,
      title: item.title,
      url: item.url ?? "",
      duration: item.duration,
      expiresAt: item.expiresAt ? item.expiresAt.substring(0, 10) : "",
      filePath: item.filePath ?? "",
      mimeType: item.mimeType ?? "",
    });
    setEditing(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar contenido",
      message: "Este contenido dejará de estar disponible para pantallas, playlists o programaciones que lo usen.",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    await api.content.delete(id);
    load();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  };

  const uploadFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo excede el límite de 500 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      const asset = await api.media.upload(file, setUploadProgress);
      setForm({
        ...form,
        filePath: asset.url,
        mimeType: asset.mimeType,
        url: "",
      });
      await load();
    } catch (err: any) {
      setError(err.message || "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  }, [form]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const selectMedia = (asset: any) => {
    setForm({
      ...form,
      filePath: asset.url,
      mimeType: asset.mimeType,
      url: "",
    });
    setShowMediaPicker(false);
  };

  const openForm = () => {
    setShowForm(true);
    setEditing(null);
    setForm({ type: "webpage", title: "", url: "", duration: 10, expiresAt: "", filePath: "", mimeType: "" });
  };

  const isFileType = FILE_TYPES.includes(form.type);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contenido</h1>
        <button onClick={openForm} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Nuevo
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
                <label className="label">Tipo</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, filePath: "", url: "" })}>
                  {Object.entries(CONTENT_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Título</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              {isFileType ? (
                <div className="md:col-span-2">
                  <label className="label">Archivo</label>
                  {form.filePath ? (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                      {form.mimeType?.startsWith("video") ? <FileVideo className="h-5 w-5 text-blue-600" /> : <FileImage className="h-5 w-5 text-blue-600" />}
                      <span className="text-sm text-blue-700 flex-1 truncate">{form.filePath.split("/").pop()}</span>
                      <button type="button" onClick={() => setShowMediaPicker(true)} className="text-xs text-blue-600 hover:underline">Cambiar</button>
                      <button type="button" onClick={() => setForm({ ...form, filePath: "", mimeType: "" })} className="text-xs text-red-500 hover:underline">Quitar</button>
                    </div>
                  ) : uploading ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">Subiendo archivo...</span>
                        <span className="text-sm text-blue-600">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`rounded-lg border-2 border-dashed p-4 transition-all ${
                        dragOver ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className={`h-6 w-6 ${dragOver ? "text-brand-600" : "text-gray-400"}`} />
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Arrastra un archivo</span> o
                        </p>
                        <div className="flex gap-2">
                          <label className="btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                            <Upload className="h-4 w-4" />
                            Seleccionar archivo
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} />
                          </label>
                          <button type="button" onClick={() => setShowMediaPicker(true)} className="btn-secondary text-sm">
                            Biblioteca
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP, MP4, WebM · Máx 500 MB</p>
                      </div>
                    </div>
                  )}
                  {form.filePath && (
                    <div className="mt-3 max-w-xl">
                      <ContentPreview item={{ ...form, title: form.title || "Preview" }} />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="label">URL</label>
                  <input className="input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                </div>
              )}
              <div>
                <label className="label">Duración (segundos)</label>
                <input type="number" className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 10 })} />
              </div>
              <div>
                <label className="label">Expira el</label>
                <input type="date" className="input" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">Dejar vacío para que no expire</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={uploading}>{editing ? "Guardar" : "Crear"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Media picker modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMediaPicker(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Biblioteca de archivos</h2>
              <button onClick={() => setShowMediaPicker(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            {mediaItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay archivos subidos. Sube uno desde el formulario.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mediaItems.map((asset) => (
                  <button key={asset.id} type="button" onClick={() => selectMedia(asset)} className="border rounded-lg p-2 hover:border-blue-500 hover:bg-blue-50 text-left">
                    <ContentPreview
                      item={{
                        type: asset.mimeType?.startsWith("video") ? "video" : "image",
                        title: asset.originalName,
                        filePath: asset.url,
                        mimeType: asset.mimeType,
                      }}
                      compact
                    />
                    <p className="text-xs text-gray-600 truncate mt-1">{asset.originalName}</p>
                    <p className="text-xs text-gray-400">{(asset.size / 1024 / 1024).toFixed(1)} MB</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="card overflow-hidden p-0">
            <div className="p-3 pb-0">
              <ContentPreview item={item} />
            </div>
            <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {CONTENT_TYPES[item.type] ?? item.type}
                  </span>
                  {item.status && item.status !== "published" && (
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      item.status === "draft" ? "bg-yellow-50 text-yellow-700" : "bg-orange-50 text-orange-700"
                    }`}>{item.status === "draft" ? "Borrador" : "Revisión"}</span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                {contentTags[item.id] && contentTags[item.id].length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {contentTags[item.id].map((tid: string) => {
                      const tag = tags.find((t: any) => t.id === tid);
                      return tag ? <span key={tid} className="text-[10px] px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: tag.color }}>{tag.name}</span> : null;
                    })}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                {item.status !== "published" && (
                  <button onClick={() => publish(item.id, "published")} className="p-1 text-green-500 hover:text-green-700" aria-label="Publicar"><Send className="h-4 w-4" /></button>
                )}
                {item.status === "draft" && (
                  <button onClick={() => publish(item.id, "review")} className="p-1 text-orange-500 hover:text-orange-700" aria-label="Enviar a revisión"><Eye className="h-4 w-4" /></button>
                )}
                <button onClick={() => handleEdit(item)} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Editar"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {item.url && (
              <p className="text-xs text-gray-500 truncate">{item.url}</p>
            )}
            {item.filePath && (
              <p className="text-xs text-gray-500 truncate">{item.filePath.split("/").pop()}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{item.duration}s de duración</p>
            {item.expiresAt && new Date(item.expiresAt) < new Date() && (
              <p className="text-xs text-red-500 mt-1">Expirado</p>
            )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No hay contenido aún. Crea tu primer elemento.</p>
        )}
      </div>
      {dialog}
    </div>
  );
}
