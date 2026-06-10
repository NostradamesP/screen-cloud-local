import React from "react";
import {
  Monitor,
  Pencil,
  Trash2,
} from "lucide-react";
import { CONTENT_ICONS, CONTENT_LABELS, PURPOSE_ICONS, PURPOSE_LABELS, normalizePurpose } from "./constants";

interface ScreenCardProps {
  screen: any;
  selected: boolean;
  isOnline: (screen: any) => boolean;
  getPlaybackInfo: (screen: any) => any;
  getAssignedContent: (screen: any) => any;
  onSelect: (screen: any) => void;
  onEdit: (screen: any) => void;
  onDelete: (screen: any) => void;
  onAssignContent: (screen: any) => void;
}

export function ScreenCard({
  screen,
  selected,
  isOnline,
  getPlaybackInfo,
  getAssignedContent,
  onSelect,
  onEdit,
  onDelete,
  onAssignContent,
}: ScreenCardProps) {
  const online = isOnline(screen);
  const playback = getPlaybackInfo(screen);
  const assigned = getAssignedContent(screen);
  const purpose = normalizePurpose(screen.purpose);
  const PurposeIcon = PURPOSE_ICONS[purpose] || Monitor;
  const AssignedIcon = assigned ? (CONTENT_ICONS[assigned.type] || Monitor) : Monitor;
  const PlaybackIcon = playback.icon;

  return (
    <div
      onClick={() => onSelect(screen)}
      className={`group relative cursor-pointer rounded-xl border bg-white p-4 transition-all hover:shadow-md ${
        selected ? "border-brand-500 ring-2 ring-brand-200" : "border-gray-200"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${online ? "bg-green-50" : "bg-gray-100"}`}>
            <Monitor className={`h-5 w-5 ${online ? "text-green-600" : "text-gray-400"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-gray-900">{screen.name}</h3>
            {screen.location && <p className="truncate text-xs text-gray-500">{screen.location}</p>}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(screen); }}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(screen); }}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`mb-3 rounded-lg border px-3 py-2 ${playback.className}`}>
        <div className="flex items-center gap-2">
          <PlaybackIcon className="h-4 w-4" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{playback.label}</p>
            <p className="truncate text-xs opacity-75">{playback.detail}</p>
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Monitor className="h-3.5 w-3.5" />
          <span>{screen.resolution}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <span className={screen.orientation === "portrait" ? "rotate-90" : ""}>
            <Monitor className="h-3.5 w-3.5" />
          </span>
          <span>{screen.orientation === "portrait" ? "Vertical" : "Horizontal"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <PurposeIcon className="h-3.5 w-3.5" />
          <span className="truncate">{PURPOSE_LABELS[purpose] || "Otro"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <span className="text-[10px] font-medium uppercase tracking-wide">
            {screen.settings?.template || "full_bleed"}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onAssignContent(screen); }}
        className={`w-full rounded-lg border border-dashed p-2.5 text-left transition-colors ${
          assigned
            ? "border-amber-200 bg-amber-50/70 hover:border-amber-300"
            : "border-gray-300 hover:border-brand-400 hover:bg-brand-50/60"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${assigned ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
            <AssignedIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-gray-900">
              {assigned ? assigned.title : "Sin contenido"}
            </p>
            <p className={`text-[10px] ${assigned ? "text-amber-700" : "text-gray-500"}`}>
              {assigned ? CONTENT_LABELS[assigned.type] || assigned.type : "Asignar"}
            </p>
          </div>
        </div>
      </button>

      {screen.lastHeartbeat && (
        <p className="mt-2 text-[10px] text-gray-400">
          Último heartbeat: {new Date(screen.lastHeartbeat).toLocaleString("es")}
        </p>
      )}
    </div>
  );
}
