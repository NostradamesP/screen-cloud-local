import React from "react";
import {
  Monitor,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { CONTENT_ICONS, CONTENT_LABELS, PURPOSE_ICONS, PURPOSE_LABELS, VIDEO_TEMPLATES, normalizePurpose } from "./constants";

interface ScreenDetailPanelProps {
  screen: any;
  pairCode: { screenId: string; pairCode: string } | null;
  isOnline: (screen: any) => boolean;
  getPlaybackInfo: (screen: any) => any;
  getAssignedContent: (screen: any) => any;
  onEdit: (screen: any) => void;
  onDelete: (screen: any) => void;
  onAssignContent: (screen: any) => void;
  onClose: () => void;
}

export function ScreenDetailPanel({
  screen,
  pairCode,
  isOnline,
  getPlaybackInfo,
  getAssignedContent,
  onEdit,
  onDelete,
  onAssignContent,
  onClose,
}: ScreenDetailPanelProps) {
  const online = isOnline(screen);
  const playback = getPlaybackInfo(screen);
  const assigned = getAssignedContent(screen);
  const purpose = normalizePurpose(screen.purpose);
  const PurposeIcon = PURPOSE_ICONS[purpose] || Monitor;
  const AssignedIcon = assigned ? (CONTENT_ICONS[assigned.type] || Monitor) : Monitor;
  const PlaybackIcon = playback.icon;
  const templateInfo = VIDEO_TEMPLATES.find(t => t.key === screen.settings?.template);

  return (
    <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${online ? "bg-green-50" : "bg-gray-100"}`}>
            <Monitor className={`h-6 w-6 ${online ? "text-green-600" : "text-gray-400"}`} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{screen.name}</h2>
            {screen.location && <p className="text-sm text-gray-500">{screen.location}</p>}
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className={`mb-4 rounded-lg border px-3 py-2.5 ${playback.className}`}>
        <div className="flex items-center gap-2">
          <PlaybackIcon className="h-4 w-4" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{playback.label}</p>
            <p className="text-xs opacity-75">{playback.detail}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Resolución</p>
            <p className="mt-0.5 font-medium text-gray-900">{screen.resolution}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Orientación</p>
            <p className="mt-0.5 font-medium text-gray-900">{screen.orientation === "portrait" ? "Vertical" : "Horizontal"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Propósito</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <PurposeIcon className="h-3.5 w-3.5 text-gray-400" />
              <p className="font-medium text-gray-900">{PURPOSE_LABELS[purpose] || "Otro"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Template</p>
            <p className="mt-0.5 font-medium text-gray-900">{templateInfo?.label || screen.settings?.template || "Canvas"}</p>
          </div>
        </div>

        {screen.lastHeartbeat && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Último heartbeat</p>
            <p className="mt-0.5 text-sm text-gray-700">{new Date(screen.lastHeartbeat).toLocaleString("es")}</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Contenido idle</p>
        <button
          onClick={() => onAssignContent(screen)}
          className={`w-full rounded-lg border border-dashed p-3 text-left transition-colors ${
            assigned
              ? "border-amber-200 bg-amber-50/70 hover:border-amber-300"
              : "border-gray-300 hover:border-brand-400 hover:bg-brand-50/60"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${assigned ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
              <AssignedIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {assigned ? assigned.title : "Sin contenido asignado"}
              </p>
              <p className={`text-xs ${assigned ? "text-amber-700" : "text-gray-500"}`}>
                {assigned ? `${CONTENT_LABELS[assigned.type] || assigned.type}` : "Asignar contenido"}
              </p>
            </div>
            <span className="text-xs font-medium text-brand-600">Cambiar</span>
          </div>
        </button>
      </div>

      {pairCode && pairCode.screenId === screen.id && (
        <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 p-3">
          <p className="text-xs font-medium text-brand-700">Código de vinculación</p>
          <p className="mt-1 text-2xl font-bold tracking-widest text-brand-700">{pairCode.pairCode}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => onEdit(screen)} className="btn-secondary flex-1">
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </button>
        <button onClick={() => onDelete(screen)} className="btn-secondary flex-1 text-red-600 hover:border-red-200 hover:bg-red-50">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
}
