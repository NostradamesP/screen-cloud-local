import React from "react";
import { X, Monitor } from "lucide-react";
import { CONTENT_ICONS, CONTENT_LABELS } from "./constants";

interface ContentPickerModalProps {
  screen: any;
  contentItems: any[];
  onAssign: (screenId: string, contentId: string | null) => void;
  onClose: () => void;
}

export function ContentPickerModal({ screen, contentItems, onAssign, onClose }: ContentPickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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

        <div className="space-y-2">
          {contentItems.map((item) => {
            const Icon = CONTENT_ICONS[item.type] || Monitor;
            const isSelected = screen.idleContentId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onAssign(screen.id, item.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-md ${isSelected ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{CONTENT_LABELS[item.type] || item.type} · {item.duration}s</p>
                  </div>
                  {isSelected && (
                    <span className="text-xs font-medium text-brand-600">Actual</span>
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
