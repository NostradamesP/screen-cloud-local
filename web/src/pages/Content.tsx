import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useConfirm } from "@/hooks/useConfirm";
import { Plus, Pencil, Trash2, Upload, FileVideo, FileImage, Send, Eye } from "lucide-react";

const CONTENT_TYPES: Record<string, string> = {
  webpage: "Página Web",
  image: "Imagen",
  video: "Video",
  dashboard: "Dashboard",
  rss: "Feed RSS",
  html: "HTML Custom",
};

const FILE_TYPES = ["image", "video"];

export default function Content() {
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ type: "webpage", title: "", url: "", duration: 10, expiresAt: "", filePath: "", mimeType: "" });
  const [uploading, setUploading] = useState(false);
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
    for (const item of data) {
      try { ctags[item.id] = await api.tags.getContentTags(item.id); } catch { ctags[item.id] = []; }
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
    setUploading(true);
    try {
      setError("");
      const asset = await api.media.upload(file);
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
      e.target.value = "";
    }
  };

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
                  ) : (
                    <div className="flex gap-2">
                      <label className="btn-secondary cursor-pointer flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        {uploading ? "Subiendo..." : "Subir archivo"}
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                      <button type="button" onClick={() => setShowMediaPicker(true)} className="btn-secondary">
                        Biblioteca
                      </button>
                    </div>
                  )}
                  {form.filePath && form.mimeType?.startsWith("image") && (
                    <img src={form.filePath} alt="preview" className="mt-2 max-h-40 rounded object-contain bg-gray-100" />
                  )}
                  {form.filePath && form.mimeType?.startsWith("video") && (
                    <video src={form.filePath} className="mt-2 max-h-40 rounded bg-gray-100" controls muted />
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
                    {asset.mimeType?.startsWith("video") ? (
                      <video src={asset.url} className="w-full h-24 object-cover rounded" muted />
                    ) : (
                      <img src={asset.url} alt={asset.originalName} className="w-full h-24 object-cover rounded" />
                    )}
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
          <div key={item.id} className="card">
            {item.filePath && item.mimeType?.startsWith("image") && (
              <img src={item.filePath} alt={item.title} className="w-full h-32 object-cover rounded-t-lg mb-2" />
            )}
            {item.filePath && item.mimeType?.startsWith("video") && (
              <video src={item.filePath} className="w-full h-32 object-cover rounded-t-lg mb-2" muted />
            )}
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
                  <button onClick={() => publish(item.id, "published")} className="p-1 text-green-500 hover:text-green-700" title="Publicar"><Send className="h-4 w-4" /></button>
                )}
                {item.status === "draft" && (
                  <button onClick={() => publish(item.id, "review")} className="p-1 text-orange-500 hover:text-orange-700" title="Enviar a revisión"><Eye className="h-4 w-4" /></button>
                )}
                <button onClick={() => handleEdit(item)} className="p-1 text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
        ))}
        {items.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No hay contenido aún. Crea tu primer elemento.</p>
        )}
      </div>
      {dialog}
    </div>
  );
}
