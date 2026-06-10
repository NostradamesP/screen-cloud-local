import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { useConfirm } from "@/hooks/useConfirm";
import { Upload, Trash2, FileVideo, FileImage, X, Check, HardDrive, AlertTriangle } from "lucide-react";

const MAX_FILE_SIZE = 500 * 1024 * 1024;

export default function MediaLibrary() {
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState<{ disk: { used: number; available: number; total: number }; uploads: { total: number; org: number; files: number } } | null>(null);
  const [orphans, setOrphans] = useState<Array<{ orgId: string; filename: string; size: number }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [data, statsData, orphansData] = await Promise.all([
      api.media.list().catch(() => []),
      api.media.stats().catch(() => null),
      api.media.orphans().catch(() => []),
    ]);
    setItems(data);
    setStats(statsData);
    setOrphans(orphansData);
  };

  useEffect(() => { load(); }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo "${file.name}" excede el límite de 500 MB`;
    }
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.type)) {
      return `Tipo de archivo no soportado: ${file.type}`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setUploading(true);
    setProgress(0);
    setError("");
    setSuccess("");
    try {
      await api.media.upload(file, setProgress);
      setSuccess(`"${file.name}" subido correctamente`);
      await load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "No se pudo subir el archivo");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = "";
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Eliminar archivo",
      message: `¿Eliminar "${name}"? Este archivo se eliminará permanentemente.`,
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      await api.media.delete(id);
      setSuccess(`"${name}" eliminado`);
      await load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "No se pudo eliminar el archivo");
    }
  };

  const handleCleanupOrphans = async () => {
    const ok = await confirm({
      title: "Limpiar archivos huérfanos",
      message: `Se encontraron ${orphans.length} archivo(s) huérfano(s) (${formatSize(orphans.reduce((s, f) => s + f.size, 0))}). ¿Eliminarlos permanentemente?`,
      confirmLabel: "Limpiar",
    });
    if (!ok) return;
    try {
      const result = await api.media.cleanupOrphans();
      setSuccess(`${result.deleted} archivo(s) huérfano(s) eliminado(s) (${formatSize(result.totalSize)})`);
      await load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "No se pudieron limpiar los archivos huérfanos");
    }
  };

  const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Medios</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} archivo{items.length !== 1 ? "s" : ""} · {formatSize(totalSize)} total
          </p>
        </div>
        <div className="flex gap-2">
          {orphans.length > 0 && (
            <button onClick={handleCleanupOrphans} className="btn-secondary text-orange-600 border-orange-200 hover:bg-orange-50">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {orphans.length} huérfano{orphans.length !== 1 ? "s" : ""}
            </button>
          )}
          <label className={`btn-primary cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? `Subiendo ${progress}%` : "Subir archivo"}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <HardDrive className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{formatSize(stats.disk.used)}</p>
              <p className="text-xs text-gray-500">Disco usado de {formatSize(stats.disk.total)}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <FileImage className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{formatSize(stats.uploads.org)}</p>
              <p className="text-xs text-gray-500">{stats.uploads.files} archivo{stats.uploads.files !== 1 ? "s" : ""} en organización</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <HardDrive className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{formatSize(stats.disk.available)}</p>
              <p className="text-xs text-gray-500">Espacio disponible</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2 animate-slide-down">
          <X className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2 animate-slide-down">
          <Check className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {uploading && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Subiendo archivo...</span>
            <span className="text-sm text-blue-600">{progress}%</span>
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mb-6 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-gray-200 bg-gray-50 hover:border-gray-300"
        }`}
      >
        <Upload className={`h-10 w-10 mx-auto mb-3 ${dragOver ? "text-brand-600" : "text-gray-400"}`} />
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Arrastra y suelta</span> un archivo aquí
        </p>
        <p className="text-xs text-gray-400">
          Imágenes (JPG, PNG, GIF, WebP) o Videos (MP4, WebM, OGG) · Máx 500 MB
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <FileImage className="h-16 w-16 mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500">No hay archivos en la biblioteca</p>
          <p className="text-sm text-gray-400 mt-1">Sube tu primer archivo para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.mimeType?.startsWith("video") ? (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start gap-2">
                  {item.mimeType?.startsWith("video") ? (
                    <FileVideo className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <FileImage className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.originalName}</p>
                    <p className="text-xs text-gray-500">{formatSize(item.size)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id, item.originalName)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-white transition-all shadow-sm"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {dialog}
    </div>
  );
}
