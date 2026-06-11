import React from "react";
import { X, Monitor, FileVideo, Globe, Rss, Code, LayoutDashboard, ImageOff } from "lucide-react";
import { CONTENT_ICONS, CONTENT_LABELS } from "./constants";

interface ContentPickerModalProps {
  screen: any;
  contentItems: any[];
  onAssign: (screenId: string, contentId: string | null) => void;
  onClose: () => void;
}

function pickerSource(item: any) {
  return item.filePath || item.url || "";
}

function PickerPreview({ item }: { item: any }) {
  const source = pickerSource(item);
  if (item.type === "image" && source) {
    return (
      <div className="h-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
        <img src={source} alt={item.title} className="h-full w-full object-contain" loading="lazy" />
      </div>
    );
  }
  if (item.type === "video" && source) {
    return (
      <div className="relative h-24 overflow-hidden rounded-lg border border-gray-200 bg-black">
        <video src={source} className="h-full w-full object-contain" muted preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm">
            <FileVideo className="h-4 w-4" />
          </span>
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
  return (
    <div className="relative h-24 overflow-hidden rounded-lg border border-gray-200 bg-[linear-gradient(135deg,#f8fafc,#e2e8f0)]">
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="relative flex h-full items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export function ContentPickerModal({ screen, contentItems, onAssign, onClose }: ContentPickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[84vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Asignar contenido a {screen.name}</h2>
            <p className="text-sm text-gray-500">Este contenido se mostrará cuando no haya programación activa.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={() => onAssign(screen.id, null)}
          className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left hover:bg-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-200 text-gray-500">
              <Monitor className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Sin contenido asignado</p>
              <p className="text-xs text-gray-500">Quitar contenido idle actual</p>
            </div>
          </div>
        </button>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {contentItems.map((item) => {
            const Icon = CONTENT_ICONS[item.type] || Monitor;
            const isSelected = screen.idleContentId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onAssign(screen.id, item.id)}
                className={`w-full rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                  isSelected
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/50"
                }`}
              >
                <PickerPreview item={item} />
                <div className="mt-3 flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isSelected ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{CONTENT_LABELS[item.type] || item.type} · {item.duration}s</p>
                    {(item.url || item.filePath) && <p className="mt-1 truncate text-[11px] text-gray-400">{item.filePath ? item.filePath.split("/").pop() : item.url}</p>}
                  </div>
                  {isSelected && (
                    <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Actual</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {contentItems.length === 0 && (
          <div className="py-12 text-center">
            <Monitor className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No hay contenido disponible.</p>
            <p className="text-xs text-gray-400">Crea contenido primero en la sección Contenido.</p>
          </div>
        )}
      </div>
    </div>
  );
}
